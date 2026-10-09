import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Check,
  Zap,
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Mail,
  Smartphone
} from 'lucide-react';
import { NotificationFilterMode } from '../types';

export const NotificationCenter: React.FC = () => {
  const { 
    showNotificationDrawer, 
    setShowNotificationDrawer, 
    currentUser, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    events,
    setSelectedEventForModal,
    simulateUrgentNotification,
    updateNotificationPreferences,
    setShowPreferencesModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'high_match' | 'urgent'>('all');
  const [pushStatus, setPushStatus] = useState<'default' | 'granted'>('default');
  const [testAlertSent, setTestAlertSent] = useState(false);

  if (!showNotificationDrawer) return null;

  const userNotifs = currentUser 
    ? notifications.filter(n => n.recipientId === currentUser.id || n.recipientId === 'all')
    : [];

  const displayNotifs = userNotifs.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'high_match') return (n.matchScore || 0) >= 75;
    if (activeTab === 'urgent') return n.urgencyLevel === 'critical' || n.urgencyLevel === 'high';
    return true;
  });

  const handlePushTest = () => {
    setPushStatus('granted');
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 3500);
  };

  const handleSimulateUrgent = () => {
    simulateUrgentNotification();
  };

  const handleNotifClick = (notif: typeof userNotifs[0]) => {
    markNotificationRead(notif.id);
    if (notif.eventId) {
      const ev = events.find(e => e.id === notif.eventId);
      if (ev) {
        setSelectedEventForModal(ev);
        setShowNotificationDrawer(false);
      }
    }
  };

  const currentFilterMode: NotificationFilterMode = currentUser?.notificationPrefs?.filterMode || 'matching_interests';

  const handleModeChange = (mode: NotificationFilterMode) => {
    updateNotificationPreferences({ filterMode: mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Smart Notification Center</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Personalized deadline countdowns & match alerts</p>
            </div>
          </div>

          <button
            onClick={() => setShowNotificationDrawer(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/60 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({userNotifs.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({userNotifs.filter(n => !n.read).length})
            </button>
            <button
              onClick={() => setActiveTab('high_match')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'high_match' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>High Match</span>
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'urgent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Urgent</span>
            </button>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
        </div>

        {/* Student Notification Preference Mode Banner */}
        {currentUser?.role === 'student' && (
          <div className="px-5 py-3 bg-indigo-950/30 border-b border-indigo-900/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Notification Filter Mode:
              </span>
              <button
                onClick={() => {
                  setShowNotificationDrawer(false);
                  setShowPreferencesModal(true);
                }}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Configure Interests
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleModeChange('all_eligible')}
                className={`py-1 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                  currentFilterMode === 'all_eligible'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Hear about all eligible events regardless of matching interests"
              >
                All Eligible
              </button>
              <button
                onClick={() => handleModeChange('matching_interests')}
                className={`py-1 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                  currentFilterMode === 'matching_interests'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Only receive alerts for events matching your selected interests"
              >
                Matching Only
              </button>
              <button
                onClick={() => handleModeChange('high_priority_only')}
                className={`py-1 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                  currentFilterMode === 'high_priority_only'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Only 75%+ match or urgent countdowns closing within 48h"
              >
                High Priority
              </button>
            </div>
          </div>
        )}

        {/* Live Simulation Action Strip */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Interactive AI Simulators:</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSimulateUrgent}
              className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900/90 border border-rose-700/80 text-rose-200 text-[11px] font-bold transition-all shadow-sm"
              title="Test the Last 3 Hours Urgent Deadline Alert"
            >
              🚨 Test 3h Urgent Alert
            </button>

            <button
              onClick={handlePushTest}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                pushStatus === 'granted'
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                  : 'bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300'
              }`}
            >
              {pushStatus === 'granted' ? 'Push ✓' : '🔔 Test Push'}
            </button>
          </div>
        </div>

        {testAlertSent && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold">Simulated Browser Push Alert Sent</div>
              <div className="text-[11px] text-emerald-300/80">"🚨 Last 3 hours! Your 95% match event closes soon. Don't miss it!"</div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayNotifs.length > 0 ? (
            displayNotifs.map(notif => {
              const ev = notif.eventId ? events.find(e => e.id === notif.eventId) : null;
              const isClosed = ev?.verificationStatus === 'registration_closed';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2.5 ${
                    notif.read
                      ? 'bg-slate-900/70 border-slate-800/80 text-slate-400 hover:bg-slate-800/70'
                      : notif.urgencyLevel === 'critical'
                        ? 'bg-rose-950/30 border-rose-800/60 text-slate-200 hover:bg-rose-950/45 shadow-lg shadow-rose-950/30'
                        : notif.matchScore && notif.matchScore >= 80
                          ? 'bg-indigo-950/40 border-indigo-700/60 text-slate-200 hover:bg-indigo-950/60 shadow-lg shadow-indigo-950/30'
                          : 'bg-slate-900 border-indigo-900/50 text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {/* Top Badges Strip */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Urgency Badge */}
                      {notif.urgencyLevel === 'critical' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-950 border border-rose-700 text-rose-300 font-extrabold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          URGENT DEADLINE
                        </span>
                      )}

                      {/* Match Score Badge */}
                      {typeof notif.matchScore === 'number' && (
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                          notif.matchScore >= 80 
                            ? 'bg-indigo-950 border-indigo-700 text-indigo-300' 
                            : notif.matchScore >= 50
                              ? 'bg-purple-950 border-purple-800 text-purple-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {notif.matchScore}% Match
                        </span>
                      )}

                      {/* Dynamic Time Remaining Pill */}
                      {notif.timeRemainingText && !isClosed && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {notif.timeRemainingText}
                        </span>
                      )}

                      {/* AI-Personalized Badge */}
                      {notif.aiPersonalized && (
                        <span className="px-1.5 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300 text-[9px] font-bold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Personalized
                        </span>
                      )}
                    </div>

                    {!notif.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shrink-0 ring-4 ring-indigo-950" />
                    )}
                  </div>

                  {/* Notification Title */}
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{notif.title}</span>
                  </div>

                  {/* Personalized Message */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {notif.message}
                  </p>

                  {/* Footer with Timestamp & CTA Button */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                      {notif.emailDeliveryStatus === 'sent' && (
                        <span className="flex items-center gap-0.5 text-emerald-400" title="Email dispatched">
                          <Mail className="w-3 h-3" />
                          <span>Email ✓</span>
                        </span>
                      )}
                      {notif.smsDeliveryStatus === 'sent' && (
                        <span className="flex items-center gap-0.5 text-sky-400" title="SMS alert sent">
                          <Smartphone className="w-3 h-3" />
                          <span>SMS ✓</span>
                        </span>
                      )}
                    </div>

                    {notif.eventId && (
                      <span className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                        <span>{isClosed ? 'View Details' : 'View Opportunity & Register'}</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-400">No notifications in this view.</p>
                <p className="text-[11px] text-slate-500 mt-1">New approved events matching your interests will automatically show up here!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Multi-Channel Delivery Status & Preferences Link */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300">Active Delivery Channels:</span>
            <span className="text-emerald-400 font-mono text-[10px]">Multi-Channel Synced</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>In-App Feed</span>
              <span className="text-emerald-400 font-bold">Active ✓</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>Email Alerts</span>
              <span className={currentUser?.notificationPrefs?.emailUpdates ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {currentUser?.notificationPrefs?.emailUpdates ? 'Active ✓' : 'Off'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>SMS Direct</span>
              <span className={currentUser?.notificationPrefs?.smsAlerts ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {currentUser?.notificationPrefs?.smsAlerts ? 'Active ✓' : 'Off'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
