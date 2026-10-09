import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMatchScore, formatTimeRemaining, formatDateRange } from '../utils/matchingEngine';
import { formatINR, convertTextCurrenciesToINR } from '../utils/currency';
import { 
  X, 
  Bookmark, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Trophy, 
  Award, 
  AlertTriangle, 
  Flag,
  Share2,
  CheckCircle2,
  Info,
  Mail,
  Users,
  IndianRupee
} from 'lucide-react';

export const EventDetailsModal: React.FC = () => {
  const { 
    selectedEventForModal, 
    setSelectedEventForModal, 
    currentUser, 
    toggleSaveEvent, 
    isEventSaved,
    setShowReportModal,
    incrementEventClick
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showRedirectWarning, setShowRedirectWarning] = useState(false);

  if (!selectedEventForModal) return null;

  const event = selectedEventForModal;
  const saved = isEventSaved(event.id);
  const matchResult = calculateMatchScore(currentUser, event);
  const countdown = formatTimeRemaining(event.registrationDeadline, event.verificationStatus);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const proceedToRegistration = () => {
    incrementEventClick(event.id);
    setShowRedirectWarning(false);
    window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner Image */}
        <div className="relative h-64 w-full bg-slate-800 overflow-hidden">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
              <span className="text-xl font-bold text-indigo-300">{event.category}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => setSelectedEventForModal(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top category & verification badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-indigo-950/90 border border-indigo-700/80 text-xs font-bold text-indigo-300 backdrop-blur-md">
              {event.category}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${
              event.classification === 'official' 
                ? 'bg-sky-950/90 border-sky-700/80 text-sky-300' 
                : 'bg-purple-950/90 border-purple-700/80 text-purple-300'
            }`}>
              {event.classification === 'official' ? '🏛️ Official College Event' : '👥 Student-Organized'}
            </span>
          </div>

          {/* Bottom Countdown & Fee on Banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold backdrop-blur-md border tabular-nums ${
              countdown.isClosed
                ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                : countdown.isUrgent
                  ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                  : 'bg-slate-950/90 text-indigo-200 border-indigo-900'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{countdown.text}</span>
            </div>

            <div className="flex items-center gap-2">
              {event.flaggedForCurrencyReview && (
                <div className="px-2.5 py-1.5 rounded-xl bg-amber-950/90 text-amber-300 font-mono text-xs font-bold border border-amber-700 backdrop-blur-md">
                  ⚠️ Currency Review
                </div>
              )}
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-emerald-300 font-mono text-sm font-bold border border-slate-700 backdrop-blur-md">
                {event.fee === 0 ? 'Free Entry' : `Registration Fee: ${formatINR(event.fee)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[calc(85vh-16rem)] overflow-y-auto">
          
          {/* Currency Review Notice Banner if flagged */}
          {event.flaggedForCurrencyReview && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300">Currency Verification Required</strong>
                <span>{event.currencyReviewReason || 'The original currency was unverified. Please confirm fee in Indian Rupees (₹ INR).'}</span>
              </div>
            </div>
          )}

          {/* Title & Organizer Info */}
          <div>
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs text-slate-400">
              <span className="text-slate-300">
                Organized by <strong className="text-white">{event.organizerName}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>{event.college}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                {event.isOrganizerVerified ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Institution/Club
                  </span>
                ) : (
                  <span className="text-slate-400">Community Club</span>
                )}
              </span>
            </div>
          </div>

          {/* Match Score Banner for Student */}
          {currentUser?.role === 'student' && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{matchResult.label}</span>
                    <span className="font-mono text-indigo-300 tabular-nums">({matchResult.score}% Relevance)</span>
                  </div>
                  <div className="text-[11px] text-indigo-200/80 mt-0.5">
                    Evaluated on your interests in {currentUser.interests?.slice(0, 3).join(', ')}, academic year ({currentUser.academicYear}), and mode ({currentUser.preferredMode}).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Event Dates</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{formatDateRange(event.eventStartAt, event.eventEndAt)}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Mode & Venue</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{event.mode} · {event.location}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <IndianRupee className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Registration Fee</div>
                <div className="text-xs font-bold text-emerald-300 mt-0.5">
                  {event.fee === 0 ? 'Free Entry' : formatINR(event.fee)}
                </div>
                {event.originalCurrency && event.currencyConversionRate && (
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Converted: {event.originalCurrency === 'USD' ? '$' : ''}{event.originalFee} {event.originalCurrency} (@ ₹{event.currencyConversionRate})
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Users className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Team Size & Cap</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{event.teamSize || 'Individual'} · Max {event.maxParticipants || 'Unlimited'} Participants</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 sm:col-span-2 lg:col-span-2">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Registration Deadline</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{new Date(event.registrationDeadline).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About This Opportunity</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {event.detailedDescription && (
              <div className="pt-2 border-t border-slate-800/60">
                <h5 className="text-xs font-bold text-slate-300 mb-1.5">Detailed Agenda & Rules</h5>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {event.detailedDescription}
                </p>
              </div>
            )}
          </div>

          {/* Eligibility Specs */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility & Participation Criteria</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Academic Years: </span>
                <span className="text-slate-200 font-medium">
                  {event.eligibleYears.includes('All') ? 'Open to All Years (1st, 2nd, 3rd, 4th)' : event.eligibleYears.join(', ') + ' Year Students'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Eligible Branches: </span>
                <span className="text-slate-200 font-medium">
                  {event.eligibleBranches.includes('All') ? 'All Engineering & Applied Branches' : event.eligibleBranches.join(', ')}
                </span>
              </div>
            </div>
            {matchResult.ineligibilityReason && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Notice: {matchResult.ineligibilityReason}</span>
              </div>
            )}
          </div>

          {/* Prizes & Certificates if available */}
          {(event.prizes || event.certificateAvailable) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.prizes && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">Prizes & Bounties (₹ INR)</div>
                    <div className="text-xs text-slate-300 mt-1">{convertTextCurrenciesToINR(event.prizes)}</div>
                  </div>
                </div>
              )}
              {event.certificateAvailable && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Verified Credentials</div>
                    <div className="text-xs text-slate-300 mt-1">Official Participation Certificate provided to all eligible attendees.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rules & Contact */}
          {event.rules && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rules & Guidelines</h4>
              <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                {event.rules}
              </p>
            </div>
          )}

          {/* Official Announcement link if present */}
          {event.officialAnnouncementUrl && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Official University Notice:</span>
              <a 
                href={event.officialAnnouncementUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
              >
                <span>View Bulletin Notice</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Contact organizer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Contact: {event.contactEmail}</span>
            </div>

            <button
              onClick={() => setShowReportModal({ eventId: event.id, eventTitle: event.title })}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Event</span>
            </button>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveEvent(event.id)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                saved
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save Event'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>

          <button
            disabled={countdown.isClosed}
            onClick={() => setShowRedirectWarning(true)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
              countdown.isClosed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
            }`}
          >
            <span>{countdown.isClosed ? 'Registration Closed' : 'Register Now'}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* External Registration Safety Warning Dialog */}
        {showRedirectWarning && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700 mx-auto flex items-center justify-center text-indigo-400">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">External Registration Notice</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are proceeding to the organizer's external registration portal:
                <br />
                <span className="font-mono text-indigo-300 block my-2 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {event.registrationUrl}
                </span>
                CampusPulse redirects you directly to the verified organizer. Please ensure you complete your submission on their form.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowRedirectWarning(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedToRegistration}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <span>Continue to Registration</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
