import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { useApp } from '../context/AppContext';
import { calculateMatchScore, formatTimeRemaining, formatDateRange } from '../utils/matchingEngine';
import { formatINR } from '../utils/currency';
import { 
  Bookmark, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles,
  Users,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  priorityRank?: number;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, priorityRank, featured = false }) => {
  const { 
    currentUser, 
    toggleSaveEvent, 
    isEventSaved, 
    setSelectedEventForModal,
    incrementEventClick
  } = useApp();

  const saved = isEventSaved(event.id);
  const matchResult = calculateMatchScore(currentUser, event);

  // Live countdown state ticking every second
  const [countdown, setCountdown] = useState(() => 
    formatTimeRemaining(event.registrationDeadline, event.verificationStatus)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatTimeRemaining(event.registrationDeadline, event.verificationStatus));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.registrationDeadline, event.verificationStatus]);

  // Image load error fallback state
  const [imgError, setImgError] = useState(false);

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementEventClick(event.id);
    setSelectedEventForModal(event);
  };

  const handleCardClick = () => {
    setSelectedEventForModal(event);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-slate-900/90 border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        featured 
          ? 'border-indigo-500/50 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/20' 
          : countdown.isUrgent && !countdown.isClosed
            ? 'border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-950/20'
            : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20'
      }`}
    >
      {/* Top Banner Image with Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
        {!imgError && event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 flex items-center justify-center p-4">
            <span className="text-sm font-semibold text-indigo-300 text-center">{event.category}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Priority Rank Ribbon if provided */}
        {priorityRank !== undefined && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-[11px] font-bold text-amber-300 shadow-md">
            <span>#{priorityRank} PRIORITY</span>
          </div>
        )}

        {/* Bookmark Save Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveEvent(event.id);
          }}
          aria-label={saved ? "Remove bookmark" : "Bookmark event"}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            saved
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-white/30'
              : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Registration Countdown Indicator on Banner bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-semibold backdrop-blur-md tabular-nums ${
            countdown.isClosed
              ? 'bg-rose-950/90 text-rose-300 border border-rose-800/60'
              : countdown.isUrgent
                ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80 shadow-md animate-pulse'
                : 'bg-slate-950/80 text-indigo-200 border border-slate-700/60'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{countdown.text}</span>
          </div>

          {/* Fee text */}
          <div className="flex items-center gap-1.5">
            {event.flaggedForCurrencyReview && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[10px] font-bold border border-amber-800" title="Currency pending review">
                ⚠️ Review
              </span>
            )}
            <div className={`px-2 py-0.5 rounded text-xs font-semibold border backdrop-blur-md ${
              event.fee === 0
                ? 'bg-emerald-950/85 text-emerald-300 border-emerald-800/80'
                : 'bg-slate-950/85 text-slate-200 border-slate-700/80 font-mono'
            }`}>
              {event.fee === 0 ? 'Free Entry' : formatINR(event.fee)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata Row: Category · Classification · Verification (Zero-Pill clean typography) */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-2">
            <span className="font-semibold text-indigo-400">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className={event.classification === 'official' ? 'text-sky-300 font-medium' : 'text-slate-300'}>
              {event.classification === 'official' ? '🏛️ Official College' : '👥 Student Club'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              {event.isOrganizerVerified ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Org</span>
                </span>
              ) : (
                <span className="text-slate-400">Community</span>
              )}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Organizer Name & College */}
          <div className="text-xs text-slate-400 mt-1 line-clamp-1">
            By <span className="text-slate-200 font-medium">{event.organizerName}</span> · {event.college}
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Mid Specs: Match Score + Date + Mode */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          
          {/* Smart Match Engine Result */}
          {currentUser?.role === 'student' && (
            <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200">{matchResult.label}</span>
              </div>
              <span className={`font-mono text-xs font-bold tabular-nums ${
                matchResult.score >= 80 ? 'text-emerald-400' : matchResult.score >= 50 ? 'text-indigo-400' : 'text-slate-400'
              }`}>
                {matchResult.score}% Relevance
              </span>
            </div>
          )}

          {/* Date & Mode info */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{formatDateRange(event.eventStartAt, event.eventEndAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{event.mode} ({event.location})</span>
            </div>
          </div>

          {/* Eligibility Criteria Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              Eligible: {event.eligibleYears.includes('All') ? 'All Years' : event.eligibleYears.join(', ') + ' Yrs'} 
              {' · '}
              {event.eligibleBranches.includes('All') ? 'All Branches' : event.eligibleBranches.join(', ')}
            </span>
          </div>

        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCardClick}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors text-center"
          >
            View Details
          </button>
          
          <button
            type="button"
            disabled={countdown.isClosed}
            onClick={handleRegisterClick}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
              countdown.isClosed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            <span>{countdown.isClosed ? 'Closed' : 'Register'}</span>
            {!countdown.isClosed && <ExternalLink className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </article>
  );
};
