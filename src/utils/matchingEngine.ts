import { User, EventItem, MatchScoreResult } from '../types';

/**
 * Calculates a match score between a student and an event.
 * Weights:
 * - Interest relevance: 40%
 * - Eligibility compatibility: 25% (Hard constraint: if incompatible, marked ineligible)
 * - Deadline urgency: 20%
 * - College compatibility: 10%
 * - Preferred mode compatibility: 5%
 */
export function calculateMatchScore(student: User | null, event: EventItem): MatchScoreResult {
  // If not logged in as student, return neutral score
  if (!student || student.role !== 'student') {
    return {
      score: 50,
      label: 'Explore Something New',
      isEligible: true,
      reasons: {
        interestMatch: 20,
        eligibilityMatch: 15,
        urgencyMatch: 10,
        collegeMatch: 5,
        modeMatch: 0,
      },
    };
  }

  // 1. Eligibility Check (Hard constraint)
  let isYearEligible = true;
  let isBranchEligible = true;
  let ineligibilityReason: string | undefined;

  if (event.eligibleYears && event.eligibleYears.length > 0 && !event.eligibleYears.includes('All')) {
    if (student.academicYear && !event.eligibleYears.includes(student.academicYear)) {
      isYearEligible = false;
      ineligibilityReason = `Restricted to ${event.eligibleYears.join(', ')} year students (You are in ${student.academicYear} year).`;
    }
  }

  if (event.eligibleBranches && event.eligibleBranches.length > 0 && !event.eligibleBranches.includes('All')) {
    if (student.branch && !event.eligibleBranches.includes(student.branch)) {
      isBranchEligible = false;
      ineligibilityReason = `Restricted to ${event.eligibleBranches.join(', ')} branches (Your branch is ${student.branch}).`;
    }
  }

  const isEligible = isYearEligible && isBranchEligible;

  // 2. Interest Relevance (0 - 40 points)
  let interestMatch = 0;
  const studentInterests = student.interests || [];
  if (studentInterests.length > 0) {
    const eventTags = [event.category, ...(event.tags || [])];
    const matchingInterests = studentInterests.filter(interest => 
      eventTags.some(tag => tag.toLowerCase() === interest.toLowerCase() || tag.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(tag.toLowerCase()))
    );
    
    // Normalize ratio: 1 match gives 20 pts, 2 matches gives 32 pts, 3+ matches gives 40 pts
    if (matchingInterests.length >= 3) {
      interestMatch = 40;
    } else if (matchingInterests.length === 2) {
      interestMatch = 32;
    } else if (matchingInterests.length === 1) {
      interestMatch = 22;
    } else {
      interestMatch = 4; // slight baseline for discovery
    }
  } else {
    interestMatch = 20; // Default when no interests selected yet
  }

  // 3. Eligibility Score (0 - 25 points)
  const eligibilityMatch = isEligible ? 25 : 0;

  // 4. Deadline Urgency (0 - 20 points)
  let urgencyMatch = 0;
  const now = new Date().getTime();
  const deadlineTime = new Date(event.registrationDeadline).getTime();
  const diffHours = (deadlineTime - now) / (1000 * 60 * 60);

  if (diffHours <= 0 || event.verificationStatus === 'registration_closed') {
    urgencyMatch = 0; // Already closed
  } else if (diffHours <= 24) {
    urgencyMatch = 20; // Closing in < 24h (Urgent)
  } else if (diffHours <= 72) {
    urgencyMatch = 16; // Closing in < 3 days
  } else if (diffHours <= 168) {
    urgencyMatch = 12; // Closing in < 7 days
  } else {
    urgencyMatch = 8;
  }

  // 5. College Compatibility (0 - 10 points)
  let collegeMatch = 0;
  if (!student.college || event.college.toLowerCase().includes(student.college.toLowerCase()) || student.college.toLowerCase().includes(event.college.toLowerCase())) {
    collegeMatch = 10;
  } else {
    collegeMatch = 4; // Inter-college event
  }

  // 6. Mode Compatibility (0 - 5 points)
  let modeMatch = 0;
  const prefMode = student.preferredMode || 'Both';
  if (prefMode === 'Both' || event.mode === 'Hybrid' || event.mode === prefMode) {
    modeMatch = 5;
  } else {
    modeMatch = 1;
  }

  // Overall Score Calculation
  let totalScore = interestMatch + eligibilityMatch + urgencyMatch + collegeMatch + modeMatch;

  if (!isEligible) {
    totalScore = Math.min(totalScore, 35); // Cap if ineligible
  }

  let label: MatchScoreResult['label'] = 'Explore Something New';
  if (!isEligible) {
    label = 'Ineligible';
  } else if (totalScore >= 78) {
    label = 'Great Match';
  } else if (totalScore >= 50) {
    label = 'Relevant to Your Interests';
  }

  return {
    score: Math.min(Math.max(totalScore, 5), 99),
    label,
    isEligible,
    ineligibilityReason,
    reasons: {
      interestMatch,
      eligibilityMatch,
      urgencyMatch,
      collegeMatch,
      modeMatch,
    },
  };
}

/**
 * Calculates priority score for "Your Priority List ⚡"
 */
export function calculatePriorityScore(
  event: EventItem,
  student: User | null,
  isSaved: boolean
): number {
  const matchResult = calculateMatchScore(student, event);

  // If closed or ineligible, give very low priority
  const now = new Date().getTime();
  const deadlineTime = new Date(event.registrationDeadline).getTime();
  const diffHours = (deadlineTime - now) / (1000 * 60 * 60);

  if (diffHours <= 0 || event.verificationStatus === 'registration_closed' || !matchResult.isEligible) {
    return -100;
  }

  let score = matchResult.score;

  // Deadline urgency bonuses
  if (diffHours <= 6) {
    score += 45; // Critical closing in hours
  } else if (diffHours <= 24) {
    score += 35; // Closing today
  } else if (diffHours <= 72) {
    score += 20; // Closing in 3 days
  }

  // Saved by student bonus
  if (isSaved) {
    score += 30;
  }

  return score;
}

/**
 * Formats time remaining until registration deadline
 */
export function formatTimeRemaining(deadlineIso: string, status?: string): {
  text: string;
  isUrgent: boolean;
  isClosed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date().getTime();
  const deadline = new Date(deadlineIso).getTime();
  const diff = deadline - now;

  if (status === 'registration_closed' || diff <= 0) {
    return {
      text: 'Registration Closed',
      isUrgent: false,
      isClosed: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const isUrgent = diff <= 24 * 60 * 60 * 1000; // < 24 hours

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
  } else {
    text = `${minutes}m ${seconds}s left`;
  }

  return {
    text,
    isUrgent,
    isClosed: false,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatDateRange(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = s.toLocaleDateString('en-US', options);
    const endStr = e.toLocaleDateString('en-US', options);
    if (startStr === endStr) {
      return `${startStr}, ${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${startStr} – ${endStr}`;
  } catch {
    return 'Upcoming';
  }
}

/**
 * Checks whether a student satisfies the strict eligibility criteria for an event.
 * Ineligible students must NEVER be notified about restricted events.
 */
export function checkStudentEligibility(student: User | null, event: EventItem): { isEligible: boolean; reason?: string } {
  if (!student || student.role !== 'student') {
    return { isEligible: false, reason: 'Only students can be evaluated for event eligibility' };
  }

  // 1. Academic Year Check
  if (event.eligibleYears && event.eligibleYears.length > 0 && !event.eligibleYears.includes('All')) {
    if (student.academicYear && !event.eligibleYears.includes(student.academicYear)) {
      return {
        isEligible: false,
        reason: `Restricted to ${event.eligibleYears.join(', ')} year students (${student.academicYear} year registered)`,
      };
    }
  }

  // 2. Branch Check
  if (event.eligibleBranches && event.eligibleBranches.length > 0 && !event.eligibleBranches.includes('All')) {
    if (student.branch && !event.eligibleBranches.includes(student.branch)) {
      return {
        isEligible: false,
        reason: `Restricted to ${event.eligibleBranches.join(', ')} branches (${student.branch} branch registered)`,
      };
    }
  }

  return { isEligible: true };
}

/**
 * Evaluates whether a notification should be generated for a student based on:
 * 1. Strict Eligibility (must be eligible)
 * 2. Student Notification Filter Preferences:
 *    - 'all_eligible': notifies if eligible
 *    - 'matching_interests': only notifies if there's an interest match (matchScore >= 50 or shared tags)
 *    - 'high_priority_only': only notifies if high match (>= 75%) or urgent deadline (<= 48 hours)
 */
export function shouldNotifyStudent(
  student: User,
  event: EventItem,
  matchResult: MatchScoreResult,
  diffHours: number
): { shouldNotify: boolean; reason: string } {
  // 1. Ineligible students are never notified
  if (!matchResult.isEligible) {
    return { 
      shouldNotify: false, 
      reason: matchResult.ineligibilityReason || 'Student is ineligible based on year or branch restrictions' 
    };
  }

  // 2. Closed events do not send registration alerts
  if (diffHours <= 0 || event.verificationStatus === 'registration_closed') {
    return { shouldNotify: false, reason: 'Registration deadline has already passed' };
  }

  // 3. Check student notification filter preference
  const filterMode = student.notificationPrefs?.filterMode || 'matching_interests';

  if (filterMode === 'high_priority_only') {
    const isHighMatch = matchResult.score >= 75;
    const isUrgentDeadline = diffHours <= 48;
    if (isHighMatch || isUrgentDeadline) {
      return { shouldNotify: true, reason: 'Passed high-priority filter (score >= 75% or deadline <= 48h)' };
    }
    return { shouldNotify: false, reason: `Filtered out: student selected 'High-priority events only' (score was ${matchResult.score}%)` };
  }

  if (filterMode === 'matching_interests') {
    // Check if student has overlapping interests with the event
    const studentInterests = student.interests || [];
    const eventTags = [event.category, ...(event.tags || [])];
    const hasMatchingInterest = studentInterests.some(interest =>
      eventTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(tag.toLowerCase()))
    );

    if (hasMatchingInterest || matchResult.score >= 50) {
      return { shouldNotify: true, reason: 'Passed matching interests filter' };
    }
    return { shouldNotify: false, reason: `Filtered out: student selected 'Only events matching selected interests'` };
  }

  // filterMode === 'all_eligible'
  return { shouldNotify: true, reason: 'Passed all-eligible filter' };
}

/**
 * Deterministic rule-based template fallback generator.
 * Produces crisp, factual, emoji-accented notification copy matching exact user specifications.
 */
export function generateSmartNotificationCopy(params: {
  eventTitle: string;
  category: string;
  matchScore: number;
  timeRemainingText: string;
  hoursRemaining: number;
  urgencyLevel?: 'critical' | 'high' | 'normal' | 'low';
}): { title: string; message: string; urgencyLevel: 'critical' | 'high' | 'normal' | 'low' } {
  const { eventTitle, category, matchScore, timeRemainingText, hoursRemaining } = params;

  // Closed deadline guard
  if (hoursRemaining <= 0) {
    return {
      title: `🔒 Registration Closed · ${eventTitle}`,
      message: `Registration for "${eventTitle}" has closed.`,
      urgencyLevel: 'low',
    };
  }

  // URGENT: Last <= 3 hours or hoursRemaining <= 6
  if (hoursRemaining <= 3 || params.urgencyLevel === 'critical') {
    const hoursLabel = hoursRemaining <= 1 ? 'Last 1 hour' : `Last ${Math.max(1, Math.round(hoursRemaining))} hours`;
    return {
      title: `🚨 ${hoursLabel}! · ${matchScore}% Match`,
      message: `🚨 ${hoursLabel}! Your ${matchScore}% match event "${eventTitle}" closes soon. Don't miss it!`,
      urgencyLevel: 'critical',
    };
  }

  // HIGH MATCH (>= 80%)
  if (matchScore >= 80) {
    const cleanCategory = category.toLowerCase().includes('hackathon') ? 'Hackathon' : category;
    return {
      title: `🔥 ${cleanCategory} Alert! · ${matchScore}% Match`,
      message: `🔥 ${cleanCategory} Alert! ${matchScore}% interest match for "${eventTitle}". Registration closes in ${timeRemainingText}. Register now!`,
      urgencyLevel: hoursRemaining <= 24 ? 'high' : 'normal',
    };
  }

  // MEDIUM MATCH (50% - 79%)
  if (matchScore >= 50) {
    return {
      title: `🎯 New ${category}! · ${matchScore}% Match`,
      message: `🎯 New ${category}! ${matchScore}% match with your interests. ${timeRemainingText} left to register for "${eventTitle}".`,
      urgencyLevel: 'normal',
    };
  }

  // LOWER MATCH (< 50%)
  return {
    title: `📢 New Campus Event · ${matchScore}% Match`,
    message: `📢 New ${category} Event! "${eventTitle}" has a ${matchScore}% interest match. Registration closes in ${timeRemainingText}.`,
    urgencyLevel: 'low',
  };
}
