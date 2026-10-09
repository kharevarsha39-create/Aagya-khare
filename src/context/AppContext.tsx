import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EventItem, NotificationItem, ReportItem, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_NOTIFICATIONS } from '../data/sampleData';
import { migrateEventToINR } from '../utils/currency';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  events: EventItem[];
  savedEventIds: string[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedEventForModal: EventItem | null;
  setSelectedEventForModal: (event: EventItem | null) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  authDefaultRole: UserRole;
  setAuthDefaultRole: (role: UserRole) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  showPreferencesModal: boolean;
  setShowPreferencesModal: (show: boolean) => void;
  showReportModal: { eventId: string; eventTitle: string } | null;
  setShowReportModal: (val: { eventId: string; eventTitle: string } | null) => void;
  showNotificationDrawer: boolean;
  setShowNotificationDrawer: (show: boolean) => void;
  showDemoNotice: boolean;
  setShowDemoNotice: (show: boolean) => void;
  
  // Actions
  loginAsUser: (user: User) => void;
  switchDemoAccount: (key: 'student1' | 'student2' | 'student3' | 'organizer' | 'admin') => void;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  updateUserProfile: (updates: Partial<User>) => void;
  toggleSaveEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  createEvent: (eventData: Partial<EventItem>) => EventItem;
  updateEvent: (eventId: string, updates: Partial<EventItem>) => void;
  approveEvent: (eventId: string) => void;
  rejectEvent: (eventId: string, reason: string) => void;
  toggleOrganizerVerification: (organizerId: string) => void;
  reportEvent: (eventId: string, eventTitle: string, reason: string) => void;
  resolveReport: (reportId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteEvent: (eventId: string) => void;
  incrementEventClick: (eventId: string) => void;
  verifyEventCurrency: (eventId: string, confirmedFeeINR?: number) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'campuspulse_active_user',
  ALL_USERS: 'campuspulse_all_users',
  EVENTS: 'campuspulse_events',
  SAVED_EVENTS: 'campuspulse_saved_events',
  NOTIFICATIONS: 'campuspulse_notifications',
  REPORTS: 'campuspulse_reports',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage or fallbacks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Student 1 (Aarav Sharma) so immediate interactive demo experience works
    return INITIAL_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(migrateEventToINR);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_EVENTS.map(migrateEventToINR);
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['event_ai_hackathon_1', 'event_robotics_summit_2'];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'rep_1',
        reporterId: 'user_student_3',
        reporterName: 'Rohan Patel',
        eventId: 'event_gaming_lan_6',
        eventTitle: 'Apex Esports Arena: 5v5 Valorant Championship',
        reason: 'Organizer changed venue location from Discord to Student Union without updating ticket link.',
        status: 'pending',
        createdAt: '2026-10-08T12:00:00Z',
      }
    ];
  });

  // Navigation & UI state
  const [activeView, setActiveView] = useState<string>('student_dashboard');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('student');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {
      // safe ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(savedEventIds));
    } catch {}
  }, [savedEventIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch {}
  }, [reports]);

  // Periodic deadline checker (moves expired registrations to registration_closed)
  useEffect(() => {
    const checkDeadlines = () => {
      const now = Date.now();
      setEvents(prev =>
        prev.map(ev => {
          if (ev.verificationStatus === 'published') {
            const deadline = new Date(ev.registrationDeadline).getTime();
            if (deadline <= now) {
              return { ...ev, verificationStatus: 'registration_closed' };
            }
          }
          return ev;
        })
      );
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setActiveView('student_dashboard');
    } else if (user.role === 'organizer') {
      setActiveView('organizer_dashboard');
    } else if (user.role === 'admin') {
      setActiveView('admin_dashboard');
    }
  };

  const switchDemoAccount = (key: 'student1' | 'student2' | 'student3' | 'organizer' | 'admin') => {
    let targetUser: User;
    if (key === 'student1') {
      targetUser = allUsers.find(u => u.id === 'user_student_1') || INITIAL_USERS[0];
    } else if (key === 'student2') {
      targetUser = allUsers.find(u => u.id === 'user_student_2') || INITIAL_USERS[1];
    } else if (key === 'student3') {
      targetUser = allUsers.find(u => u.id === 'user_student_3') || INITIAL_USERS[2];
    } else if (key === 'organizer') {
      targetUser = allUsers.find(u => u.id === 'user_organizer_1') || INITIAL_USERS[3];
    } else {
      targetUser = allUsers.find(u => u.id === 'user_admin_1') || INITIAL_USERS[4];
    }

    setCurrentUser(targetUser);
    if (targetUser.role === 'student') {
      setActiveView('student_dashboard');
    } else if (targetUser.role === 'organizer') {
      setActiveView('organizer_dashboard');
    } else if (targetUser.role === 'admin') {
      setActiveView('admin_dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('landing');
  };

  const registerUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    if (newUser.role === 'student') {
      setActiveView('student_dashboard');
      // Prompt onboarding if student hasn't selected detailed interests
      if (!newUser.interests || newUser.interests.length === 0) {
        setShowOnboardingModal(true);
      }
    } else if (newUser.role === 'organizer') {
      setActiveView('organizer_dashboard');
    } else {
      setActiveView('admin_dashboard');
    }

    return newUser;
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds(prev => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter(id => id !== eventId) : [...prev, eventId];

      // Update event savedCount
      setEvents(evs =>
        evs.map(ev => {
          if (ev.id === eventId) {
            return {
              ...ev,
              savedCount: Math.max(0, ev.savedCount + (exists ? -1 : 1)),
            };
          }
          return ev;
        })
      );

      // If user saved event, send in-app notification confirming reminder active
      if (!exists && currentUser) {
        const ev = events.find(e => e.id === eventId);
        if (ev) {
          const newNotif: NotificationItem = {
            id: `notif_${Date.now()}`,
            recipientId: currentUser.id,
            eventId: ev.id,
            type: 'event_published',
            title: 'Event Bookmarked 📌',
            message: `You saved "${ev.title}". We'll notify you before registration closes on ${new Date(ev.registrationDeadline).toLocaleDateString()}.`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications(n => [newNotif, ...n]);
        }
      }

      return next;
    });
  };

  const isEventSaved = (eventId: string) => savedEventIds.includes(eventId);

  const incrementEventClick = (eventId: string) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? { ...ev, clicksCount: ev.clicksCount + 1 } : ev))
    );
  };

  const createEvent = (eventData: Partial<EventItem>): EventItem => {
    const newEvent: EventItem = {
      id: `event_${Date.now()}`,
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      detailedDescription: eventData.detailedDescription || '',
      organizerId: currentUser?.id || 'unknown',
      organizerName: eventData.organizerName || currentUser?.organizationName || currentUser?.name || 'Organizer',
      organizerType: eventData.organizerType || currentUser?.organizationType || 'Student Club',
      college: eventData.college || currentUser?.college || 'Apex Institute of Technology',
      category: eventData.category || 'Coding',
      tags: eventData.tags || [],
      classification: eventData.classification || 'student_organized',
      verificationStatus: eventData.verificationStatus || 'pending_verification', // New events enter verification queue
      isOrganizerVerified: currentUser?.isVerifiedOrganizer || false,
      eligibleYears: eventData.eligibleYears || ['All'],
      eligibleBranches: eventData.eligibleBranches || ['All'],
      registrationOpenAt: eventData.registrationOpenAt || new Date().toISOString(),
      registrationDeadline: eventData.registrationDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      eventStartAt: eventData.eventStartAt || new Date(Date.now() + 10 * 86400000).toISOString(),
      eventEndAt: eventData.eventEndAt || new Date(Date.now() + 11 * 86400000).toISOString(),
      fee: typeof eventData.fee === 'number' ? eventData.fee : Number(eventData.fee) || 0,
      currency: eventData.currency || 'INR',
      mode: eventData.mode || 'Offline',
      location: eventData.location || 'Campus Auditorium',
      registrationUrl: eventData.registrationUrl || 'https://campuspulse.edu',
      bannerUrl: eventData.bannerUrl || '/src/assets/images/event_ai_hackathon_1791531171162.jpg',
      bannerStoragePath: eventData.bannerStoragePath || '',
      bannerFileName: eventData.bannerFileName || '',
      bannerFileSize: eventData.bannerFileSize || 0,
      contactEmail: eventData.contactEmail || currentUser?.email || 'contact@campus.edu',
      teamSize: eventData.teamSize || 'Individual',
      certificateAvailable: eventData.certificateAvailable ?? true,
      prizes: eventData.prizes || '',
      rules: eventData.rules || '',
      officialAnnouncementUrl: eventData.officialAnnouncementUrl || '',
      maxParticipants: eventData.maxParticipants || 100,
      viewsCount: 0,
      clicksCount: 0,
      savedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents(prev => [newEvent, ...prev]);

    // Notify admins that an event is waiting in verification queue
    const adminNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      recipientId: 'user_admin_1',
      eventId: newEvent.id,
      type: 'verification_update',
      title: 'New Event Awaiting Verification 📋',
      message: `"${newEvent.title}" submitted by ${newEvent.organizerName}. Ready for administrative review.`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [adminNotif, ...prev]);

    return newEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<EventItem>) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const sanitizedUpdates = { ...updates };
          if (sanitizedUpdates.fee !== undefined) {
            sanitizedUpdates.fee = typeof sanitizedUpdates.fee === 'number' ? sanitizedUpdates.fee : Number(sanitizedUpdates.fee) || 0;
            if (!sanitizedUpdates.currency) {
              sanitizedUpdates.currency = 'INR';
            }
          }
          return {
            ...ev,
            ...sanitizedUpdates,
            updatedAt: new Date().toISOString(),
          };
        }
        return ev;
      })
    );
  };

  const verifyEventCurrency = (eventId: string, confirmedFeeINR?: number) => {
    setEvents(prev =>
      prev.map(item => {
        if (item.id === eventId) {
          return {
            ...item,
            fee: confirmedFeeINR !== undefined ? confirmedFeeINR : item.fee,
            currency: 'INR',
            flaggedForCurrencyReview: false,
            currencyReviewReason: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  const approveEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    setEvents(prev =>
      prev.map(item =>
        item.id === eventId
          ? {
              ...item,
              verificationStatus: 'published',
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    // Notify Organizer that event was approved
    const organizerNotif: NotificationItem = {
      id: `notif_org_${Date.now()}`,
      recipientId: ev.organizerId,
      eventId: ev.id,
      type: 'verification_update',
      title: 'Event Approved & Published! 🎉',
      message: `Your event "${ev.title}" was verified and published. It is now matched with eligible students!`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Broadcast notifications to students whose interests match
    const matchingNotifs: NotificationItem[] = allUsers
      .filter(u => u.role === 'student')
      .map((student, idx) => ({
        id: `notif_stu_${Date.now()}_${idx}`,
        recipientId: student.id,
        eventId: ev.id,
        type: 'event_published',
        title: 'New College Event Match 🚀',
        message: `"${ev.title}" just published! Matches your interest profile in ${ev.category}.`,
        read: false,
        createdAt: new Date().toISOString(),
      }));

    setNotifications(prev => [organizerNotif, ...matchingNotifs, ...prev]);
  };

  const rejectEvent = (eventId: string, reason: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    setEvents(prev =>
      prev.map(item =>
        item.id === eventId
          ? {
              ...item,
              verificationStatus: 'rejected',
              verificationReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    const organizerNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      recipientId: ev.organizerId,
      eventId: ev.id,
      type: 'verification_update',
      title: 'Event Needs Revision ⚠️',
      message: `"${ev.title}" was not approved. Feedback: ${reason}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [organizerNotif, ...prev]);
  };

  const toggleOrganizerVerification = (organizerId: string) => {
    setAllUsers(prev =>
      prev.map(u =>
        u.id === organizerId ? { ...u, isVerifiedOrganizer: !u.isVerifiedOrganizer } : u
      )
    );
    setEvents(prev =>
      prev.map(ev =>
        ev.organizerId === organizerId
          ? { ...ev, isOrganizerVerified: !ev.isOrganizerVerified }
          : ev
      )
    );
  };

  const reportEvent = (eventId: string, eventTitle: string, reason: string) => {
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser?.id || 'anonymous',
      reporterName: currentUser?.name || 'Anonymous Student',
      eventId,
      eventTitle,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);

    // Send admin notification
    const adminNotif: NotificationItem = {
      id: `notif_rep_${Date.now()}`,
      recipientId: 'user_admin_1',
      eventId,
      type: 'verification_update',
      title: 'Event Reported by Student 🚨',
      message: `Student reported "${eventTitle}". Reason: ${reason}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [adminNotif, ...prev]);
  };

  const resolveReport = (reportId: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.recipientId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setSavedEventIds(prev => prev.filter(id => id !== eventId));
  };

  const resetAllData = () => {
    localStorage.clear();
    setAllUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setEvents(INITIAL_EVENTS.map(migrateEventToINR));
    setSavedEventIds(['event_ai_hackathon_1', 'event_robotics_summit_2']);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveView('student_dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        events,
        savedEventIds,
        notifications,
        reports,
        activeView,
        setActiveView,
        selectedEventForModal,
        setSelectedEventForModal,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        authDefaultRole,
        setAuthDefaultRole,
        showOnboardingModal,
        setShowOnboardingModal,
        showPreferencesModal,
        setShowPreferencesModal,
        showReportModal,
        setShowReportModal,
        showNotificationDrawer,
        setShowNotificationDrawer,
        showDemoNotice,
        setShowDemoNotice,
        loginAsUser,
        switchDemoAccount,
        logout,
        registerUser,
        updateUserProfile,
        toggleSaveEvent,
        isEventSaved,
        createEvent,
        updateEvent,
        approveEvent,
        rejectEvent,
        toggleOrganizerVerification,
        reportEvent,
        resolveReport,
        markNotificationRead,
        markAllNotificationsRead,
        deleteEvent,
        incrementEventClick,
        verifyEventCurrency,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
