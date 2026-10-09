import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  Bookmark, 
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Calendar,
  Zap,
  Info
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeView, 
    setActiveView, 
    savedEventIds, 
    notifications, 
    setShowAuthModal, 
    setAuthModalMode,
    setAuthDefaultRole,
    setShowNotificationDrawer,
    setShowPreferencesModal,
    switchDemoAccount,
    logout,
    showDemoNotice,
    setShowDemoNotice
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const unreadNotifsCount = currentUser 
    ? notifications.filter(n => n.recipientId === currentUser.id && !n.read).length
    : 0;

  return (
    <>
      {/* Top Demo Banner */}
      {showDemoNotice && (
        <aside aria-label="Prototype environment notice" className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-900/40 text-xs px-4 py-2 flex items-center justify-between text-indigo-200">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <span className="font-semibold text-white">Prototype Mode</span>
            <span aria-hidden="true" className="text-indigo-400">·</span>
            <span className="truncate">Active profile: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role}) — Switch personas anytime via the Demo Switcher.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowDemoNotice(false)}
              className="text-indigo-300 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* Main Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element Brand wordmark */}
          <button 
            onClick={() => setActiveView(currentUser?.role === 'organizer' ? 'organizer_dashboard' : currentUser?.role === 'admin' ? 'admin_dashboard' : 'student_dashboard')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/30" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                CampusPulse
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {currentUser?.role === 'student' && (
              <>
                <button 
                  onClick={() => setActiveView('student_dashboard')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${activeView === 'student_dashboard' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  Explore Events
                </button>
                <button 
                  onClick={() => setActiveView('priority_list')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${activeView === 'priority_list' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  Priority List ⚡
                </button>
                <button 
                  onClick={() => setActiveView('official_events')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${activeView === 'official_events' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  Official Fests
                </button>
                <button 
                  onClick={() => setActiveView('saved_events')}
                  className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeView === 'saved_events' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved</span>
                  {savedEventIds.length > 0 && (
                    <span className="font-mono text-xs text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                      {savedEventIds.length}
                    </span>
                  )}
                </button>
              </>
            )}

            {currentUser?.role === 'organizer' && (
              <>
                <button 
                  onClick={() => setActiveView('organizer_dashboard')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${activeView === 'organizer_dashboard' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  My Events
                </button>
                <button 
                  onClick={() => setActiveView('organizer_create')}
                  className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeView === 'organizer_create' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Event</span>
                </button>
                <button 
                  onClick={() => setActiveView('student_dashboard')}
                  className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 text-slate-500"
                >
                  Student Preview
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button 
                  onClick={() => setActiveView('admin_dashboard')}
                  className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeView === 'admin_dashboard' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verification Console</span>
                </button>
                <button 
                  onClick={() => setActiveView('student_dashboard')}
                  className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 text-slate-500"
                >
                  Public View
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveView('landing')}
              className={`transition-colors whitespace-nowrap shrink-0 ${activeView === 'landing' ? 'text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-200'}`}
            >
              About Platform
            </button>
          </nav>

          {/* Zone 3: 1 primary action & controls cluster */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleMenuOpen(!roleMenuOpen);
                  setProfileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:border-indigo-500/60 transition-all whitespace-nowrap shrink-0"
                title="Switch Demonstration Role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline text-slate-400">Demo Persona:</span>
                <span className="text-white font-semibold capitalize">{currentUser ? currentUser.role : 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                    SWITCH PROTOTYPE PERSONA
                  </div>
                  
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        switchDemoAccount('student1');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                    >
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-300">Aarav Sharma (Student)</div>
                        <div className="text-[11px] text-slate-400">1st Year CSE · AI, Coding, Hackathons</div>
                      </div>
                      {currentUser?.id === 'user_student_1' && <span className="text-emerald-400 text-xs">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoAccount('student2');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                    >
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-300">Ananya Iyer (Student)</div>
                        <div className="text-[11px] text-slate-400">1st Year ECE · Cultural, Dance, Music</div>
                      </div>
                      {currentUser?.id === 'user_student_2' && <span className="text-emerald-400 text-xs">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoAccount('student3');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                    >
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-300">Rohan Patel (Student)</div>
                        <div className="text-[11px] text-slate-400">2nd Year Mech · Startups, Business</div>
                      </div>
                      {currentUser?.id === 'user_student_3' && <span className="text-emerald-400 text-xs">Active</span>}
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => {
                        switchDemoAccount('organizer');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                    >
                      <div>
                        <div className="font-semibold text-indigo-300 group-hover:text-indigo-200">Priya Nair (Organizer)</div>
                        <div className="text-[11px] text-slate-400">Campus Developer Society Lead</div>
                      </div>
                      {currentUser?.role === 'organizer' && <span className="text-emerald-400 text-xs">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoAccount('admin');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                    >
                      <div>
                        <div className="font-semibold text-purple-300 group-hover:text-purple-200">Dr. K. Mehta (Admin)</div>
                        <div className="text-[11px] text-slate-400">Dean of Student Affairs (Approval Council)</div>
                      </div>
                      {currentUser?.role === 'admin' && <span className="text-emerald-400 text-xs">Active</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell with Badge */}
            {currentUser && (
              <button 
                onClick={() => setShowNotificationDrawer(true)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                aria-label="Notification center"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 font-mono text-[10px] font-bold bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-slate-950">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile or Login CTA */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setRoleMenuOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs"
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-semibold text-white">{currentUser.name}</div>
                      <div className="text-slate-400 text-[11px] truncate">{currentUser.email}</div>
                      <div className="text-indigo-400 text-[11px] mt-1">{currentUser.college}</div>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'student' && (
                        <button
                          onClick={() => {
                            setShowPreferencesModal(true);
                            setProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                          <span>My Interests & Preferences</span>
                        </button>
                      )}

                      {currentUser.role === 'organizer' && (
                        <button
                          onClick={() => {
                            setActiveView('organizer_create');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Create New Event</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthDefaultRole('student');
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthDefaultRole('student');
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap shrink-0"
                >
                  Join CampusPulse
                </button>
              </div>
            )}

          </div>

        </div>
      </header>
    </>
  );
};
