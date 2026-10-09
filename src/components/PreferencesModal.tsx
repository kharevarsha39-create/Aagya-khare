import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INTEREST_CATEGORIES, AcademicYear, Branch, NotificationFilterMode, NotificationPreferences } from '../types';
import { X, Check, SlidersHorizontal, Bell, Mail, Smartphone, ShieldCheck } from 'lucide-react';

export const PreferencesModal: React.FC = () => {
  const { 
    showPreferencesModal, 
    setShowPreferencesModal, 
    currentUser, 
    updateUserProfile 
  } = useApp();

  const [college, setCollege] = useState(currentUser?.college || 'Apex Institute of Technology');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(currentUser?.academicYear || 'First');
  const [branch, setBranch] = useState<Branch>(currentUser?.branch || 'CSE');
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [preferredMode, setPreferredMode] = useState<'Online' | 'Offline' | 'Both'>(currentUser?.preferredMode || 'Both');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');

  // Notification Preferences State
  const defaultPrefs: NotificationPreferences = currentUser?.notificationPrefs || {
    inApp: true,
    browserPush: true,
    emailUpdates: true,
    smsAlerts: false,
    smsConsent: false,
    filterMode: 'matching_interests',
    remind3Days: true,
    remind24Hours: true,
    remind2Hours: true,
  };

  const [filterMode, setFilterMode] = useState<NotificationFilterMode>(defaultPrefs.filterMode);
  const [inApp, setInApp] = useState(defaultPrefs.inApp);
  const [browserPush, setBrowserPush] = useState(defaultPrefs.browserPush);
  const [emailUpdates, setEmailUpdates] = useState(defaultPrefs.emailUpdates);
  const [smsAlerts, setSmsAlerts] = useState(defaultPrefs.smsAlerts);
  const [remind3Days, setRemind3Days] = useState(defaultPrefs.remind3Days);
  const [remind24Hours, setRemind24Hours] = useState(defaultPrefs.remind24Hours);
  const [remind2Hours, setRemind2Hours] = useState(defaultPrefs.remind2Hours);

  if (!showPreferencesModal) return null;

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = () => {
    updateUserProfile({
      college,
      academicYear,
      branch,
      interests,
      preferredMode,
      phoneNumber: phoneNumber.trim() || undefined,
      notificationPrefs: {
        inApp,
        browserPush,
        emailUpdates,
        smsAlerts,
        smsConsent: smsAlerts,
        filterMode,
        remind3Days,
        remind24Hours,
        remind2Hours,
      },
    });
    setShowPreferencesModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Student Match & Notification Preferences</h2>
          </div>
          <button
            onClick={() => setShowPreferencesModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs">
          
          {/* SECTION 1: SMART NOTIFICATION PREFERENCES (USER REQUIREMENT 1) */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Bell className="w-4 h-4" />
              <span>Smart Event Notification Delivery</span>
            </div>
            <p className="text-[11px] text-slate-400">
              CampusPulse automatically checks which registered students match newly published events. Choose when and how you want to be notified.
            </p>

            {/* Filter Mode Selector */}
            <div className="space-y-2 pt-1">
              <label className="font-semibold text-slate-200 block">Choose Event Alert Scope:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode('all_eligible')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filterMode === 'all_eligible'
                      ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>All Eligible</span>
                    {filterMode === 'all_eligible' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-[10px] mt-1 opacity-80 leading-tight">
                    Every event you qualify for by year & branch.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('matching_interests')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filterMode === 'matching_interests'
                      ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Matching Interests</span>
                    {filterMode === 'matching_interests' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-[10px] mt-1 opacity-80 leading-tight">
                    Only events aligning with your selected tags.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('high_priority_only')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filterMode === 'high_priority_only'
                      ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>High-Priority Only</span>
                    {filterMode === 'high_priority_only' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-[10px] mt-1 opacity-80 leading-tight">
                    Only 75%+ match or closing within 48h.
                  </div>
                </button>
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="pt-2 border-t border-indigo-900/40 space-y-2">
              <label className="font-semibold text-slate-200 block">Notification Delivery Channels:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inApp}
                    onChange={(e) => setInApp(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[11px] text-slate-300">In-App Feed</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={browserPush}
                    onChange={(e) => setBrowserPush(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[11px] text-slate-300">Browser Push</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[11px] text-slate-300">Email Digest</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[11px] text-slate-300">SMS Urgent</span>
                </label>
              </div>

              {smsAlerts && (
                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mobile Phone for SMS Reminders:</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              )}
            </div>

            {/* Reminder Cadences */}
            <div className="pt-2 border-t border-indigo-900/40">
              <label className="font-semibold text-slate-200 block mb-1.5">Deadline Countdown Alerts:</label>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind3Days}
                    onChange={(e) => setRemind3Days(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>3 Days Prior</span>
                </label>
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind24Hours}
                    onChange={(e) => setRemind24Hours(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>24 Hours Prior</span>
                </label>
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind2Hours}
                    onChange={(e) => setRemind2Hours(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>2-3 Hours Prior (Urgent)</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC & PROFILE DETAILS */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="First">First Year</option>
                  <option value="Second">Second Year</option>
                  <option value="Third">Third Year</option>
                  <option value="Fourth">Fourth Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Preferred Event Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Both', 'Offline', 'Online'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreferredMode(m)}
                    className={`py-1.5 rounded-lg border text-xs font-semibold ${
                      preferredMode === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Selected Interests ({interests.length})</label>
                <span className="text-[11px] text-slate-500">Powers smart matching & notifications</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                {INTEREST_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                      interests.includes(cat)
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowPreferencesModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Check className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
