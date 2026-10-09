import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, INTEREST_CATEGORIES, AcademicYear, Branch, EventClassification, EventMode } from '../types';
import { EventBannerUploader } from './EventBannerUploader';
import { EventPreviewModal } from './EventPreviewModal';
import { formatINR, convertTextCurrenciesToINR } from '../utils/currency';
import { 
  PlusCircle, 
  Clock, 
  Calendar, 
  Eye, 
  MousePointerClick, 
  Bookmark, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  X, 
  ExternalLink,
  ShieldCheck,
  Send,
  Layers,
  Sparkles,
  Trash2,
  FileText,
  RefreshCw,
  Building2,
  Lock,
  ArrowRight,
  IndianRupee
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const { 
    currentUser, 
    events, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    verifyEventCurrency,
    setSelectedEventForModal,
    activeView,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'manage' | 'create'>(() => {
    return activeView === 'organizer_create' ? 'create' : 'manage';
  });

  React.useEffect(() => {
    if (activeView === 'organizer_create') {
      setActiveTab('create');
    }
  }, [activeView]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Quick extend deadline modal
  const [extendingEvent, setExtendingEvent] = useState<EventItem | null>(null);
  const [newDeadlineInput, setNewDeadlineInput] = useState('');

  // Editing state (null = creating new, string = event id being edited)
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Event submission form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [category, setCategory] = useState<string>('Coding');
  const [organizerName, setOrganizerName] = useState(currentUser?.organizationName || currentUser?.name || '');
  const [organizerType, setOrganizerType] = useState(currentUser?.organizationType || 'Student Club');
  const [college, setCollege] = useState(currentUser?.college || 'Apex Institute of Technology');
  const [classification, setClassification] = useState<EventClassification>('student_organized');
  const [eventStartAt, setEventStartAt] = useState('');
  const [eventEndAt, setEventEndAt] = useState('');
  const [registrationOpenAt, setRegistrationOpenAt] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eligibleYears, setEligibleYears] = useState<AcademicYear[]>(['All']);
  const [eligibleBranches, setEligibleBranches] = useState<Branch[]>(['All']);
  const [fee, setFee] = useState<number>(0);
  const [mode, setMode] = useState<EventMode>('Offline');
  const [location, setLocation] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  
  // Banner state
  const [bannerUrl, setBannerUrl] = useState('/src/assets/images/event_ai_hackathon_1791531171162.jpg');
  const [bannerFileName, setBannerFileName] = useState('default_hackathon_banner.jpg');
  const [bannerFileSize, setBannerFileSize] = useState<number | undefined>(340000);
  const [bannerStoragePath, setBannerStoragePath] = useState('events/banners/default_hackathon.jpg');

  const [selectedTags, setSelectedTags] = useState<string[]>(['Coding', 'Hackathons']);
  const [teamSize, setTeamSize] = useState('1 - 4 Members');
  const [certificateAvailable, setCertificateAvailable] = useState(true);
  const [prizes, setPrizes] = useState('');
  const [rules, setRules] = useState('');
  const [officialAnnouncementUrl, setOfficialAnnouncementUrl] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);

  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Filter events belonging to organizer
  const myEvents = events.filter(e => 
    e.organizerId === currentUser?.id || e.organizerName.toLowerCase().includes('society') || e.organizerName.toLowerCase().includes('club') || currentUser?.role === 'organizer'
  );

  const filteredMyEvents = myEvents.filter(e => {
    if (selectedStatusFilter === 'all') return true;
    return e.verificationStatus === selectedStatusFilter;
  });

  // Calculate engagement stats
  const totalViews = myEvents.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const totalClicks = myEvents.reduce((acc, curr) => acc + (curr.clicksCount || 0), 0);
  const totalBookmarks = myEvents.reduce((acc, curr) => acc + (curr.savedCount || 0), 0);
  const activeCount = myEvents.filter(e => e.verificationStatus === 'published').length;

  // Reset form to blank defaults
  const resetFormFields = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setDetailedDescription('');
    setCategory('Coding');
    setOrganizerName(currentUser?.organizationName || currentUser?.name || '');
    setOrganizerType(currentUser?.organizationType || 'Student Club');
    setCollege(currentUser?.college || 'Apex Institute of Technology');
    setClassification('student_organized');
    setEventStartAt('');
    setEventEndAt('');
    setRegistrationOpenAt('');
    setRegistrationDeadline('');
    setEligibleYears(['All']);
    setEligibleBranches(['All']);
    setFee(0);
    setMode('Offline');
    setLocation('');
    setRegistrationUrl('');
    setContactEmail(currentUser?.email || '');
    setBannerUrl('/src/assets/images/event_ai_hackathon_1791531171162.jpg');
    setBannerFileName('default_hackathon_banner.jpg');
    setBannerFileSize(340000);
    setBannerStoragePath('events/banners/default_hackathon.jpg');
    setSelectedTags(['Coding', 'Hackathons']);
    setTeamSize('1 - 4 Members');
    setCertificateAvailable(true);
    setPrizes('');
    setRules('');
    setOfficialAnnouncementUrl('');
    setMaxParticipants(100);
    setFormError(null);
    setFormSuccess(null);
  };

  // Populate form with existing event for editing
  const startEditingEvent = (ev: EventItem) => {
    // Check ownership authorization
    if (ev.organizerId !== currentUser?.id && currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') {
      alert('You are only authorized to edit events you created.');
      return;
    }

    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setDetailedDescription(ev.detailedDescription || '');
    setCategory(ev.category);
    setOrganizerName(ev.organizerName);
    setOrganizerType(ev.organizerType);
    setCollege(ev.college);
    setClassification(ev.classification);
    setEventStartAt(ev.eventStartAt ? ev.eventStartAt.slice(0, 16) : '');
    setEventEndAt(ev.eventEndAt ? ev.eventEndAt.slice(0, 16) : '');
    setRegistrationOpenAt(ev.registrationOpenAt ? ev.registrationOpenAt.slice(0, 16) : '');
    setRegistrationDeadline(ev.registrationDeadline ? ev.registrationDeadline.slice(0, 16) : '');
    setEligibleYears(ev.eligibleYears || ['All']);
    setEligibleBranches(ev.eligibleBranches || ['All']);
    setFee(ev.fee || 0);
    setMode(ev.mode);
    setLocation(ev.location);
    setRegistrationUrl(ev.registrationUrl);
    setContactEmail(ev.contactEmail);
    setBannerUrl(ev.bannerUrl || '');
    setBannerFileName(ev.bannerFileName || 'current_poster.jpg');
    setBannerFileSize(ev.bannerFileSize);
    setBannerStoragePath(ev.bannerStoragePath || '');
    setSelectedTags(ev.tags || []);
    setTeamSize(ev.teamSize || 'Individual');
    setCertificateAvailable(ev.certificateAvailable ?? true);
    setPrizes(ev.prizes || '');
    setRules(ev.rules || '');
    setOfficialAnnouncementUrl(ev.officialAnnouncementUrl || '');
    setMaxParticipants(ev.maxParticipants || 100);
    
    setFormError(null);
    setFormSuccess(null);
    setActiveTab('create');
  };

  const toggleYearSelection = (year: AcademicYear) => {
    if (year === 'All') {
      setEligibleYears(['All']);
      return;
    }
    const filtered = eligibleYears.filter(y => y !== 'All');
    if (filtered.includes(year)) {
      const next = filtered.filter(y => y !== year);
      setEligibleYears(next.length === 0 ? ['All'] : next);
    } else {
      setEligibleYears([...filtered, year]);
    }
  };

  const toggleBranchSelection = (branch: Branch) => {
    if (branch === 'All') {
      setEligibleBranches(['All']);
      return;
    }
    const filtered = eligibleBranches.filter(b => b !== 'All');
    if (filtered.includes(branch)) {
      const next = filtered.filter(b => b !== branch);
      setEligibleBranches(next.length === 0 ? ['All'] : next);
    } else {
      setEligibleBranches([...filtered, branch]);
    }
  };

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Construct mock event object for live preview
  const constructPreviewEvent = (): EventItem => {
    const now = new Date().toISOString();
    return {
      id: editingEventId || `event_preview_${Date.now()}`,
      title: title || 'Untitled Opportunity Preview',
      description: description || 'No summary provided yet.',
      detailedDescription: detailedDescription || undefined,
      organizerId: currentUser?.id || 'organizer_1',
      organizerName: organizerName || currentUser?.organizationName || 'Campus Organizer',
      organizerType: organizerType || 'Student Club',
      college: college || 'Apex Institute of Technology',
      category: category || 'Coding',
      tags: selectedTags.length > 0 ? selectedTags : ['Coding'],
      classification,
      verificationStatus: 'published',
      isOrganizerVerified: true,
      eligibleYears: eligibleYears.length > 0 ? eligibleYears : ['All'],
      eligibleBranches: eligibleBranches.length > 0 ? eligibleBranches : ['All'],
      registrationOpenAt: registrationOpenAt || now,
      registrationDeadline: registrationDeadline || new Date(Date.now() + 5 * 86400000).toISOString(),
      eventStartAt: eventStartAt || new Date(Date.now() + 7 * 86400000).toISOString(),
      eventEndAt: eventEndAt || new Date(Date.now() + 8 * 86400000).toISOString(),
      fee: Number(fee) || 0,
      currency: 'INR',
      mode,
      location: location || 'Campus Venue',
      registrationUrl: registrationUrl || 'https://campuspulse.edu',
      bannerUrl: bannerUrl || '/src/assets/images/event_ai_hackathon_1791531171162.jpg',
      bannerFileName,
      bannerFileSize,
      bannerStoragePath,
      contactEmail: contactEmail || 'contact@campus.edu',
      teamSize,
      certificateAvailable,
      prizes,
      rules,
      officialAnnouncementUrl,
      maxParticipants,
      viewsCount: 0,
      clicksCount: 0,
      savedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  };

  // Form Submission Validation
  const handleCreateSubmit = (e?: React.FormEvent, isDraft = false) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Required field validation
    if (!title.trim()) return setFormError('Event Name is required.');
    if (!description.trim()) return setFormError('Short Description is required.');
    if (!organizerName.trim()) return setFormError('Organizer Name is required.');
    if (!college.trim()) return setFormError('College or Institution Name is required.');
    if (!location.trim()) return setFormError('Event Venue or Online Location is required.');
    if (!registrationUrl.trim()) return setFormError('Registration URL is required.');
    if (!contactEmail.trim()) return setFormError('Contact Email is required.');

    // Dates validation
    if (!registrationDeadline) return setFormError('Registration Deadline Date and Time is required.');
    if (!eventStartAt) return setFormError('Event Start Date and Time is required.');

    const now = new Date().getTime();
    const regOpen = registrationOpenAt ? new Date(registrationOpenAt).getTime() : now;
    const regClose = new Date(registrationDeadline).getTime();
    const eventStart = new Date(eventStartAt).getTime();
    const eventEnd = eventEndAt ? new Date(eventEndAt).getTime() : eventStart + 86400000;

    if (regClose < regOpen) {
      return setFormError('Registration deadline cannot be earlier than the opening date.');
    }
    if (eventStart < regClose) {
      return setFormError('Event start date cannot be earlier than the registration deadline.');
    }
    if (eventEnd < eventStart) {
      return setFormError('Event end date cannot be earlier than the start date.');
    }

    setIsSubmitting(true);

    // If editing existing event
    if (editingEventId) {
      updateEvent(editingEventId, {
        title,
        description,
        detailedDescription,
        category,
        organizerName,
        organizerType,
        college,
        classification,
        verificationStatus: isDraft ? 'draft' : 'pending_verification', // re-enters review if modified
        eligibleYears,
        eligibleBranches,
        registrationOpenAt: new Date(regOpen).toISOString(),
        registrationDeadline: new Date(regClose).toISOString(),
        eventStartAt: new Date(eventStart).toISOString(),
        eventEndAt: new Date(eventEnd).toISOString(),
        fee: Number(fee) || 0,
        currency: 'INR',
        flaggedForCurrencyReview: false,
        currencyReviewReason: undefined,
        mode,
        location,
        registrationUrl,
        bannerUrl: bannerUrl || '/src/assets/images/event_ai_hackathon_1791531171162.jpg',
        bannerFileName,
        bannerFileSize,
        bannerStoragePath,
        contactEmail,
        tags: selectedTags,
        teamSize,
        certificateAvailable,
        prizes,
        rules,
        officialAnnouncementUrl,
        maxParticipants,
      });

      setIsSubmitting(false);
      setFormSuccess(isDraft ? 'Draft updated successfully.' : 'Event updated and submitted for verification!');
      setTimeout(() => {
        resetFormFields();
        setActiveTab('manage');
      }, 1500);
      return;
    }

    // Creating new event
    createEvent({
      title,
      description,
      detailedDescription,
      category,
      organizerName,
      organizerType,
      college,
      classification,
      verificationStatus: isDraft ? 'draft' : 'pending_verification',
      eligibleYears,
      eligibleBranches,
      registrationOpenAt: new Date(regOpen).toISOString(),
      registrationDeadline: new Date(regClose).toISOString(),
      eventStartAt: new Date(eventStart).toISOString(),
      eventEndAt: new Date(eventEnd).toISOString(),
      fee: Number(fee) || 0,
      currency: 'INR',
      mode,
      location,
      registrationUrl,
      bannerUrl: bannerUrl || '/src/assets/images/event_ai_hackathon_1791531171162.jpg',
      bannerFileName,
      bannerFileSize,
      bannerStoragePath,
      contactEmail,
      tags: selectedTags,
      teamSize,
      certificateAvailable,
      prizes,
      rules,
      officialAnnouncementUrl,
      maxParticipants,
    });

    setIsSubmitting(false);
    setFormSuccess(
      isDraft 
        ? 'Event saved as draft in your dashboard.' 
        : 'Event and poster uploaded! Submitted for administrative verification. Once approved, it will be automatically dispatched to eligible students.'
    );

    setTimeout(() => {
      resetFormFields();
      setActiveTab('manage');
    }, 1800);
  };

  const handleExtendDeadline = () => {
    if (!extendingEvent || !newDeadlineInput) return;
    updateEvent(extendingEvent.id, {
      registrationDeadline: new Date(newDeadlineInput).toISOString(),
      verificationStatus: 'published', // re-open if it was closed
    });
    setExtendingEvent(null);
    setNewDeadlineInput('');
  };

  const handleCloseRegistrationEarly = (id: string) => {
    updateEvent(id, { verificationStatus: 'registration_closed' });
  };

  const handleCancelEvent = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this event? Students who saved it will receive a cancellation notification.')) {
      updateEvent(id, { verificationStatus: 'cancelled' });
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this event draft from your dashboard?')) {
      deleteEvent(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/40">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Organizer Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {currentUser?.organizationName || 'Campus Event Organizer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish college opportunities, upload event posters, monitor registrations, and keep deadlines up to date.
          </p>
        </div>

        {/* Prominent Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-slate-800 text-white shadow'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Manage Events ({myEvents.length})
          </button>

          {/* Prominent + Create Event Button */}
          <button
            onClick={() => {
              resetFormFields();
              setActiveTab('create');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Event</span>
          </button>
        </div>
      </div>

      {/* Engagement KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Published</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1 tabular-nums">{activeCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student Impressions</div>
          <div className="text-2xl font-extrabold font-mono text-indigo-400 mt-1 tabular-nums">{totalViews.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registration Clicks</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bookmarked by Students</div>
          <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1 tabular-nums">{totalBookmarks.toLocaleString()}</div>
        </div>
      </div>

      {/* TAB 1: MANAGE EVENTS */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          
          {/* Status filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <span className="text-slate-500 mr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'published', label: 'Published & Open' },
                { id: 'pending_verification', label: 'In Verification Queue' },
                { id: 'registration_closed', label: 'Registration Closed' },
                { id: 'draft', label: 'Drafts' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedStatusFilter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                resetFormFields();
                setActiveTab('create');
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Another Event</span>
            </button>
          </div>

          {/* Events Table / Card List */}
          <div className="space-y-4">
            {filteredMyEvents.length > 0 ? (
              filteredMyEvents.map(event => (
                <div
                  key={event.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Small Poster Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 hidden sm:block">
                      {event.bannerUrl ? (
                        <img 
                          src={event.bannerUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold bg-slate-900">
                          NO POSTER
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="font-semibold text-indigo-400">{event.category}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={event.classification === 'official' ? 'text-sky-300' : 'text-slate-300'}>
                          {event.classification === 'official' ? '🏛️ Official' : '👥 Student-Organized'}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          event.verificationStatus === 'published' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : event.verificationStatus === 'pending_verification'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : event.verificationStatus === 'registration_closed'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-400'
                        }`}>
                          {event.verificationStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                        <span className="text-emerald-300 font-semibold">
                          Fee: {event.fee === 0 ? 'Free Entry' : formatINR(event.fee)}
                        </span>
                        <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                        <span>Event: {new Date(event.eventStartAt).toLocaleDateString()}</span>
                        <span>Mode: {event.mode}</span>
                        <span>Views: {event.viewsCount}</span>
                        <span>Clicks: {event.clicksCount}</span>
                        <span>Saved: {event.savedCount}</span>
                      </div>

                      {event.flaggedForCurrencyReview && (
                        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span><strong>Currency Review Flag:</strong> {event.currencyReviewReason || 'Please verify that fee is configured in ₹ INR.'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => verifyEventCurrency(event.id, event.fee)}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] whitespace-nowrap shrink-0 self-start sm:self-auto"
                          >
                            Confirm in ₹ INR
                          </button>
                        </div>
                      )}

                      {event.verificationReason && (
                        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                          Admin Review Feedback: {event.verificationReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this event */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button
                      onClick={() => setSelectedEventForModal(event)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Preview
                    </button>

                    {/* Edit Event Button */}
                    <button
                      onClick={() => startEditingEvent(event)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setExtendingEvent(event);
                        setNewDeadlineInput(event.registrationDeadline.slice(0, 16));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline</span>
                    </button>

                    {event.verificationStatus === 'published' && (
                      <button
                        onClick={() => handleCloseRegistrationEarly(event.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 text-xs font-semibold"
                      >
                        Close Early
                      </button>
                    )}

                    {event.verificationStatus !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelEvent(event.id)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 text-xs transition-colors"
                        title="Cancel Event"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Delete draft / own event */}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Events in this View</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Publish an opportunity to connect with eligible students across campus.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetFormFields();
                    setActiveTab('create');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Event</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE / EDIT EVENT FORM */}
      {activeTab === 'create' && (
        <form onSubmit={(e) => handleCreateSubmit(e, false)} className="space-y-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>{editingEventId ? 'Edit Event Details' : 'Create New Campus Opportunity'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {editingEventId ? `Editing: ${title || 'Event'}` : 'Publish Your Event to CampusPulse'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill out the required event details and upload a horizontal poster. Submitted opportunities enter the administrative verification queue before broadcasting to students.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetFormFields();
                  setActiveTab('manage');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel & Exit
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Event</span>
              </button>
            </div>
          </div>

          {/* Validation Error Alert */}
          {formError && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <div className="flex-1 font-medium">{formError}</div>
              <button type="button" onClick={() => setFormError(null)} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Success Alert */}
          {formSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-3 animate-in fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
              <div className="flex-1 font-medium">{formSuccess}</div>
            </div>
          )}

          {/* SECTION 1: EVENT POSTER & BANNER UPLOAD */}
          <div className="space-y-4">
            <EventBannerUploader
              bannerUrl={bannerUrl}
              bannerFileName={bannerFileName}
              bannerFileSize={bannerFileSize}
              onBannerChange={(data) => {
                setBannerUrl(data.url);
                setBannerFileName(data.fileName);
                setBannerFileSize(data.fileSize);
                setBannerStoragePath(data.storagePath);
              }}
              onBannerRemove={() => {
                setBannerUrl('');
                setBannerFileName('');
                setBannerFileSize(undefined);
                setBannerStoragePath('');
              }}
              isUploading={isSubmitting}
            />
          </div>

          {/* SECTION 2: BASIC EVENT INFORMATION */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">01. Basic Information</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Event Name *</span>
                <span className="text-[11px] text-slate-500 font-normal">Required</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. InnovateX 2026: National Collegiate AI Sprint"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {INTEREST_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Classification *</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="student_organized">👥 Student-Organized (Club / Society / Community)</option>
                  <option value="official">🏛️ Official College (Department / Administration)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Short Summary Description *</span>
                <span className="text-[11px] text-slate-500 font-normal">Shown on cards (1-2 sentences)</span>
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A high-intensity 36-hour hackathon building autonomous multimodal agents with cloud computing bounties..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Detailed Event Description</span>
                <span className="text-[11px] text-slate-500 font-normal">Optional extended briefing & agenda</span>
              </label>
              <textarea
                rows={4}
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="Include full schedule, mentorship hours, submission rules, deliverables, and tech stack guidelines..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 3: ORGANIZER & INSTITUTION DETAILS */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">02. Organizer Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Organizer / Club Name *</label>
                <input
                  type="text"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="e.g. Developer Student Chapter"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Organizer Type</label>
                <input
                  type="text"
                  value={organizerType}
                  onChange={(e) => setOrganizerType(e.target.value)}
                  placeholder="e.g. Student Club, Department, Society"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">College / Institution *</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Apex Institute of Technology"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DATES & REGISTRATION DEADLINES */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">03. Dates & Deadlines</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registration Opens At</label>
                <input
                  type="datetime-local"
                  value={registrationOpenAt}
                  onChange={(e) => setRegistrationOpenAt(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                  <span>Registration Deadline *</span>
                  <span className="text-[10px] text-amber-400/80">Required</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-800/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                  <span>Event Starts At *</span>
                  <span className="text-[10px] text-indigo-400/80">Required</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventStartAt}
                  onChange={(e) => setEventStartAt(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-indigo-800/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Ends At</label>
                <input
                  type="datetime-local"
                  value={eventEndAt}
                  onChange={(e) => setEventEndAt(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: ELIGIBILITY & TARGET AUDIENCE */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">04. Eligibility & Smart Matching</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Eligible Academic Years</label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'First', 'Second', 'Third', 'Fourth'] as AcademicYear[]).map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYearSelection(yr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      eligibleYears.includes(yr)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr === 'All' ? 'All Academic Years' : `${yr} Year`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Eligible Degree Branches</label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'] as Branch[]).map(br => (
                  <button
                    key={br}
                    type="button"
                    onClick={() => toggleBranchSelection(br)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      eligibleBranches.includes(br)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {br === 'All' ? 'All Branches' : br}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Relevant Student Interests (Used for Smart Matching Engine)</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                {INTEREST_CATEGORIES.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTagSelection(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6: LOGISTICS & REGISTRATION */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">05. Logistics & Registration Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Mode *</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Offline">Offline (Campus Venue)</option>
                  <option value="Online">Online (Zoom / Meet / Discord)</option>
                  <option value="Hybrid">Hybrid (Both)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Registration Fee (₹ INR) *</label>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {fee === 0 ? 'Free Entry' : formatINR(fee)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={fee}
                    onChange={(e) => setFee(Math.max(0, Number(e.target.value)))}
                    placeholder="0 for Free Entry (e.g. 499)"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Enter 0 for Free Entry, or numeric fee in ₹ INR (e.g. 499 for ₹499).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Venue or Online Link *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hall 4B or Discord Server"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registration URL *</label>
                <input
                  type="url"
                  required
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://forms.gle/... or https://your-site.org/register"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. coordinator@club.edu"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Optional perks & rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Team Size (Optional)</label>
                <input
                  type="text"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g. Solo or 2 - 4 Members"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Prize Pool / Bounties (₹ INR)</label>
                <input
                  type="text"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="e.g. ₹1,00,000 Cash Pool + Cloud Credits"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={certificateAvailable}
                    onChange={(e) => setCertificateAvailable(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Participation Certificate Provided</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Participation Rules & Guidelines (Optional)</label>
              <textarea
                rows={2}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Fresh code only. GitHub submission required by deadline. Teams must check in 15 minutes before opening..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* BOTTOM ACTIONS: SAVE DRAFT, PREVIEW EVENT, SUBMIT */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleCreateSubmit(e, true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Event</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Submission...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{editingEventId ? 'Update & Re-Submit Event' : 'Submit for Verification'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* QUICK EXTEND DEADLINE MODAL */}
      {extendingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Update Registration Deadline</h3>
              <button onClick={() => setExtendingEvent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <p className="text-xs text-slate-300">
              Extending the deadline will update the live countdown clock and notify students who saved <strong>{extendingEvent.title}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">New Closing Date & Time</label>
              <input
                type="datetime-local"
                value={newDeadlineInput}
                onChange={(e) => setNewDeadlineInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setExtendingEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendDeadline}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save & Update Countdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE EVENT PREVIEW MODAL */}
      <EventPreviewModal
        isOpen={showPreviewModal}
        event={constructPreviewEvent()}
        onClose={() => setShowPreviewModal(false)}
        onSubmitForVerification={() => {
          setShowPreviewModal(false);
          handleCreateSubmit(undefined, false);
        }}
      />

    </div>
  );
};
