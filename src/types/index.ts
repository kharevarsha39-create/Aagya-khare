export type UserRole = 'student' | 'organizer' | 'admin';

export type AcademicYear = 'First' | 'Second' | 'Third' | 'Fourth' | 'All';

export type Branch = 'CSE' | 'ECE' | 'EEE' | 'Mechanical' | 'Civil' | 'Other' | 'All';

export type EventClassification = 'official' | 'student_organized';

export type VerificationStatus = 
  | 'draft' 
  | 'pending_verification' 
  | 'approved' 
  | 'rejected' 
  | 'published' 
  | 'registration_closed' 
  | 'cancelled';

export type EventMode = 'Online' | 'Offline' | 'Hybrid';

export interface NotificationPreferences {
  inApp: boolean;
  browserPush: boolean;
  emailUpdates: boolean;
  remind3Days: boolean;
  remind24Hours: boolean;
  remind2Hours: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college: string;
  avatar?: string;
  // Student-specific
  academicYear?: AcademicYear;
  branch?: Branch;
  interests?: string[];
  preferredMode?: 'Online' | 'Offline' | 'Both';
  preferredCategories?: string[];
  // Organizer-specific
  organizationName?: string;
  organizationType?: string; // Department, Club, Society, Independent
  contactInfo?: string;
  isVerifiedOrganizer?: boolean;
  // Shared
  notificationPrefs: NotificationPreferences;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  organizerId: string;
  organizerName: string;
  organizerType: string;
  college: string;
  category: string;
  tags: string[];
  classification: EventClassification; // Official vs Student-Organized
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isOrganizerVerified?: boolean;
  eligibleYears: AcademicYear[];
  eligibleBranches: Branch[];
  registrationOpenAt: string;
  registrationDeadline: string;
  eventStartAt: string;
  eventEndAt: string;
  fee: number; // numeric value in specified currency, 0 for Free
  currency?: string; // default: 'INR'
  originalCurrency?: string; // 'USD' | 'EUR' etc. if converted
  originalFee?: number; // original numerical fee before exchange rate conversion
  currencyConversionRate?: number; // exchange rate used during conversion
  flaggedForCurrencyReview?: boolean; // true if currency/exchange rate was uncertain
  currencyReviewReason?: string;
  mode: EventMode;
  location: string;
  registrationUrl: string;
  bannerUrl: string;
  bannerStoragePath?: string;
  bannerFileName?: string;
  bannerFileSize?: number;
  contactEmail: string;
  teamSize?: string;
  certificateAvailable: boolean;
  prizes?: string;
  rules?: string;
  officialAnnouncementUrl?: string;
  maxParticipants?: number;
  viewsCount: number;
  clicksCount: number;
  savedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // student id or 'all'
  eventId?: string;
  type: 
    | 'event_published' 
    | 'deadline_approaching' 
    | 'event_updated' 
    | 'event_cancelled' 
    | 'verification_update' 
    | 'match_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  eventId: string;
  eventTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface MatchScoreResult {
  score: number; // 0 - 100
  label: 'Great Match' | 'Relevant to Your Interests' | 'Explore Something New' | 'Ineligible';
  isEligible: boolean;
  ineligibilityReason?: string;
  reasons: {
    interestMatch: number; // 0 - 40
    eligibilityMatch: number; // 0 - 25
    urgencyMatch: number; // 0 - 20
    collegeMatch: number; // 0 - 10
    modeMatch: number; // 0 - 5
  };
}

export const INTEREST_CATEGORIES = [
  'Coding',
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'Hackathons',
  'Robotics',
  'Electronics',
  'Entrepreneurship',
  'Startups',
  'Business',
  'Cultural Events',
  'Dance',
  'Music',
  'Photography',
  'Design',
  'Sports',
  'Gaming',
  'Workshops',
  'Seminars',
  'Internships',
  'Technical Competitions',
  'Other'
] as const;
