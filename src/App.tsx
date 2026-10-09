/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EventDetailsModal } from './components/EventDetailsModal';
import { NotificationCenter } from './components/NotificationCenter';
import { OnboardingModal } from './components/OnboardingModal';
import { PreferencesModal } from './components/PreferencesModal';
import { AuthModal } from './components/AuthModal';
import { ReportEventModal } from './components/ReportEventModal';
import { Zap, RotateCcw, X, ExternalLink, Sparkles, Bell } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    activeView, 
    resetAllData, 
    latestNotificationAlert, 
    dismissLatestAlert, 
    events, 
    setSelectedEventForModal 
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {(activeView === 'student_dashboard' || 
          activeView === 'priority_list' || 
          activeView === 'official_events' || 
          activeView === 'saved_events') && <StudentDashboard />}
        {(activeView === 'organizer_dashboard' || activeView === 'organizer_create') && <OrganizerDashboard />}
        {activeView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      {/* Real-Time Floating Smart Notification Toast */}
      {latestNotificationAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-slate-900/95 border border-indigo-700/80 shadow-2xl shadow-indigo-950/70 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{latestNotificationAlert.title}</span>
                </div>
                {latestNotificationAlert.aiPersonalized && (
                  <span className="text-[10px] text-violet-300 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Smart Alert
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={dismissLatestAlert}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {latestNotificationAlert.message}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
            {latestNotificationAlert.eventId && (
              <button
                onClick={() => {
                  const ev = events.find(e => e.id === latestNotificationAlert.eventId);
                  if (ev) setSelectedEventForModal(ev);
                  dismissLatestAlert();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>View & Register</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Modals */}
      <EventDetailsModal />
      <NotificationCenter />
      <OnboardingModal />
      <PreferencesModal />
      <AuthModal />
      <ReportEventModal />

      {/* Site Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 lg:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">CampusPulse</span>
            <span aria-hidden="true">·</span>
            <span>Never Miss an Opportunity Again</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Role-Based Opportunity Matching Engine</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all demonstration events, users, and notifications to default sample data?')) {
                  resetAllData();
                }
              }}
              className="hover:text-indigo-300 flex items-center gap-1 transition-colors"
              title="Reset prototype local state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
