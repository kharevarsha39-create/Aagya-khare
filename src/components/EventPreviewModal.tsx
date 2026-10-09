import React, { useState } from 'react';
import { EventItem } from '../types';
import { EventCard } from './EventCard';
import { 
  X, 
  Eye, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Trophy, 
  Award, 
  Users, 
  CheckCircle2, 
  Mail,
  IndianRupee
} from 'lucide-react';
import { formatDateRange, formatTimeRemaining } from '../utils/matchingEngine';
import { formatINR, convertTextCurrenciesToINR } from '../utils/currency';

interface EventPreviewModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitForVerification: () => void;
}

export const EventPreviewModal: React.FC<EventPreviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmitForVerification,
}) => {
  const [viewMode, setViewMode] = useState<'details' | 'card'>('details');

  if (!isOpen) return null;

  const countdown = formatTimeRemaining(event.registrationDeadline, event.verificationStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl my-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Top Header Bar */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Opportunity Preview
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              · See how students will see this event
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Full Details vs Card */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('details')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  viewMode === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Details View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  viewMode === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Feed Card View
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {viewMode === 'card' ? (
            /* Card View Preview in isolated mock grid */
            <div className="max-w-md mx-auto py-6">
              <div className="text-xs text-center text-slate-400 mb-4">
                This is how your opportunity appears in the student discovery grid:
              </div>
              <EventCard event={event} featured={true} />
            </div>
          ) : (
            /* Full Details View Preview */
            <div className="space-y-6">
              
              {/* Banner with overlay */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                {event.bannerUrl ? (
                  <img
                    src={event.bannerUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
                    <span className="text-lg font-bold text-indigo-300">{event.category}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Classification & Category badges */}
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

                {/* Countdown & Fee */}
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold backdrop-blur-md border bg-slate-950/90 text-indigo-200 border-indigo-900">
                    <Clock className="w-4 h-4" />
                    <span>{countdown.text}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-emerald-300 font-mono text-sm font-bold border border-slate-700 backdrop-blur-md">
                    {event.fee === 0 ? 'Free Entry' : `Registration Fee: ${formatINR(event.fee)}`}
                  </div>
                </div>
              </div>

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
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Organizer</span>
                  </span>
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Event Dates</div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{formatDateRange(event.eventStartAt, event.eventEndAt)}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Mode & Location</div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{event.mode} · {event.location}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <IndianRupee className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Registration Fee</div>
                    <div className="text-xs font-bold text-emerald-300 mt-0.5">
                      {event.fee === 0 ? 'Free Entry' : formatINR(event.fee)}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <Users className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Team Size & Cap</div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{event.teamSize || 'Individual'} · Max {event.maxParticipants || 100} Participants</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 sm:col-span-2 lg:col-span-2">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Registration Deadline</div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">{new Date(event.registrationDeadline).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Short & Detailed Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Opportunity Overview</h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {event.description}
                </p>

                {event.detailedDescription && (
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-slate-300 mb-1">Detailed Event Breakdown:</h5>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      {event.detailedDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Eligibility Specs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility Criteria</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">Eligible Academic Years: </span>
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
              </div>

              {/* Prizes & Certificates */}
              {(event.prizes || event.certificateAvailable) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.prizes && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-300">Prizes & Bounties (₹ INR)</div>
                        <div className="text-xs text-slate-300 mt-1">{convertTextCurrenciesToINR(event.prizes)}</div>
                      </div>
                    </div>
                  )}
                  {event.certificateAvailable && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-300">Verified Credentials</div>
                        <div className="text-xs text-slate-300 mt-1">Participation Certificate provided to all eligible attendees.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rules & Contact */}
              {event.rules && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rules & Guidelines</h4>
                  <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-800">
                    {event.rules}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Contact Organizer: {event.contactEmail}</span>
              </div>

            </div>
          )}

        </div>

        {/* Preview Footer Controls */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            ← Back to Editing Form
          </button>

          <button
            onClick={() => {
              onClose();
              onSubmitForVerification();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Looks Great! Submit for Verification</span>
          </button>
        </div>

      </div>
    </div>
  );
};
