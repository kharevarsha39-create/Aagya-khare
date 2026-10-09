import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EventCard } from './EventCard';
import { calculateMatchScore, calculatePriorityScore } from '../utils/matchingEngine';
import { 
  Sparkles, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  Bookmark, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Building2, 
  Zap, 
  RefreshCw,
  X,
  Filter,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { INTEREST_CATEGORIES, EventClassification, EventMode } from '../types';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    events, 
    savedEventIds, 
    activeView, 
    setActiveView, 
    setShowPreferencesModal,
    setShowOnboardingModal
  } = useApp();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<'all' | EventClassification>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | EventMode>('all');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'closing_soon' | 'event_date' | 'recently_added'>('recommended');
  
  // Section Navigation Tab
  // Default to priority if activeView is 'priority_list', or saved if 'saved_events', etc.
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (activeView === 'priority_list') return 'priority';
    if (activeView === 'official_events') return 'official';
    if (activeView === 'saved_events') return 'saved';
    return 'recommended';
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClassification('all');
    setSelectedCategory('all');
    setSelectedMode('all');
    setSelectedFeeFilter('all');
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  const hasActiveFilters = searchQuery !== '' || selectedClassification !== 'all' || selectedCategory !== 'all' || selectedMode !== 'all' || selectedFeeFilter !== 'all' || verifiedOnly;

  // Published events only for student discovery
  const publishedEvents = useMemo(() => {
    return events.filter(e => e.verificationStatus === 'published' || e.verificationStatus === 'registration_closed');
  }, [events]);

  // Priority List Engine: Calculates urgent, highly relevant events
  const priorityList = useMemo(() => {
    return publishedEvents
      .filter(e => e.verificationStatus === 'published') // only open registrations
      .map(e => ({
        event: e,
        priorityScore: calculatePriorityScore(e, currentUser, savedEventIds.includes(e.id)),
      }))
      .filter(item => item.priorityScore > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map(item => item.event);
  }, [publishedEvents, currentUser, savedEventIds]);

  // Filtered & Sorted events for main grid
  const filteredEvents = useMemo(() => {
    let result = [...publishedEvents];

    // 1. Tab specific base filter
    if (activeTab === 'priority') {
      result = priorityList;
    } else if (activeTab === 'saved') {
      result = result.filter(e => savedEventIds.includes(e.id));
    } else if (activeTab === 'closing_soon') {
      result = result.filter(e => {
        const diff = (new Date(e.registrationDeadline).getTime() - Date.now()) / (1000 * 3600);
        return diff > 0 && diff <= 48 && e.verificationStatus === 'published';
      });
    } else if (activeTab === 'official') {
      result = result.filter(e => e.classification === 'official');
    } else if (activeTab === 'student_organized') {
      result = result.filter(e => e.classification === 'student_organized');
    } else if (activeTab === 'hackathons') {
      result = result.filter(e => e.category === 'Hackathons' || e.tags.includes('Hackathons') || e.tags.includes('Coding'));
    } else if (activeTab === 'workshops') {
      result = result.filter(e => e.category === 'Workshops' || e.category === 'Seminars' || e.tags.includes('Workshops'));
    } else if (activeTab === 'cultural_sports') {
      result = result.filter(e => e.category === 'Cultural Events' || e.category === 'Sports' || e.category === 'Gaming');
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizerName.toLowerCase().includes(q) ||
        e.college.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 3. Classification filter
    if (selectedClassification !== 'all') {
      result = result.filter(e => e.classification === selectedClassification);
    }

    // 4. Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory || e.tags.includes(selectedCategory));
    }

    // 5. Mode filter
    if (selectedMode !== 'all') {
      result = result.filter(e => e.mode === selectedMode || (selectedMode === 'Online' && e.mode === 'Hybrid'));
    }

    // 6. Fee filter
    if (selectedFeeFilter === 'free') {
      result = result.filter(e => e.fee === 0);
    } else if (selectedFeeFilter === 'paid') {
      result = result.filter(e => e.fee > 0);
    }

    // 7. Verified organizer only
    if (verifiedOnly) {
      result = result.filter(e => e.isOrganizerVerified);
    }

    // 8. Sorting
    if (sortBy === 'recommended') {
      result.sort((a, b) => {
        const scoreB = calculateMatchScore(currentUser, b).score;
        const scoreA = calculateMatchScore(currentUser, a).score;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'closing_soon') {
      result.sort((a, b) => {
        return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
      });
    } else if (sortBy === 'event_date') {
      result.sort((a, b) => {
        return new Date(a.eventStartAt).getTime() - new Date(b.eventStartAt).getTime();
      });
    } else if (sortBy === 'recently_added') {
      result.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return result;
  }, [
    publishedEvents, 
    priorityList, 
    activeTab, 
    searchQuery, 
    selectedClassification, 
    selectedCategory, 
    selectedMode, 
    selectedFeeFilter, 
    verifiedOnly, 
    sortBy, 
    currentUser, 
    savedEventIds
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Personalized Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>CampusPulse Matching Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Hey, {currentUser?.name?.split(' ')[0] || 'Student'}! Welcome back 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here are the opportunities you might love tailored for <strong className="text-slate-200">{currentUser?.college}</strong> ({currentUser?.academicYear} Year {currentUser?.branch}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit My Interests</span>
          </button>
        </div>
      </div>

      {/* Priority Engine Spotlight: "Your Priority List ⚡" (if open and student has opportunities) */}
      {priorityList.length > 0 && activeTab !== 'priority' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-lg font-bold text-white">Your Priority List ⚡</h2>
              <span className="text-xs text-slate-400">· Urgent deadlines matching your profile</span>
            </div>
            <button
              onClick={() => setActiveTab('priority')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              See all ({priorityList.length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {priorityList.slice(0, 3).map((event, idx) => (
              <EventCard key={event.id} event={event} priorityRank={idx + 1} featured={idx === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Discovery Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-medium scrollbar-none">
          {[
            { id: 'recommended', label: 'Recommended For You', count: publishedEvents.length },
            { id: 'priority', label: 'Priority List ⚡', count: priorityList.length },
            { id: 'closing_soon', label: 'Closing Soon ⏳' },
            { id: 'official', label: 'Official College Events 🏛️' },
            { id: 'student_organized', label: 'Student-Organized 👥' },
            { id: 'hackathons', label: 'Hackathons & Coding' },
            { id: 'workshops', label: 'Workshops & Seminars' },
            { id: 'cultural_sports', label: 'Cultural & Sports' },
            { id: 'saved', label: 'Saved Events 📌', count: savedEventIds.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeTab === tab.id ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          
          {/* Search bar and quick sort */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, organizer, tech stack, college, or tags..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="recommended">Best Recommended Match</option>
                  <option value="closing_soon">Registration Closing Soon</option>
                  <option value="event_date">Upcoming Event Date</option>
                  <option value="recently_added">Recently Published</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold whitespace-nowrap"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filter Chips Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            {/* Classification */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="px-2 text-slate-500 font-medium text-[11px]">Source:</span>
              <button
                onClick={() => setSelectedClassification('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${selectedClassification === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedClassification('official')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${selectedClassification === 'official' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🏛️ Official Only
              </button>
              <button
                onClick={() => setSelectedClassification('student_organized')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${selectedClassification === 'student_organized' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                👥 Student Clubs
              </button>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="px-2 text-slate-500 font-medium text-[11px]">Mode:</span>
              {(['all', 'Online', 'Offline', 'Hybrid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${selectedMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Fee */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="px-2 text-slate-500 font-medium text-[11px]">Fee:</span>
              {(['all', 'free', 'paid'] as const).map(fee => (
                <button
                  key={fee}
                  onClick={() => setSelectedFeeFilter(fee)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${selectedFeeFilter === fee ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {fee === 'all' ? 'All' : fee === 'free' ? 'Free Entry' : 'Paid (₹ INR)'}
                </button>
              ))}
            </div>

            {/* Verified Organizer toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                verifiedOnly
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Organizers Only</span>
            </button>
          </div>

        </div>

      </div>

      {/* Events Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing <strong className="text-white font-mono">{filteredEvents.length}</strong> opportunities</span>
          {activeTab === 'saved' && (
            <span>Saved events sync automatically to your notification calendar.</span>
          )}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Matching Events Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try widening your search terms, clearing mode or source filters, or adjusting your selected interest preferences.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
