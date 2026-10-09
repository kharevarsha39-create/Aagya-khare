import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, AcademicYear, Branch, INTEREST_CATEGORIES } from '../types';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    authDefaultRole, 
    setAuthDefaultRole,
    registerUser,
    switchDemoAccount,
    allUsers,
    loginAsUser
  } = useApp();

  const [role, setRole] = useState<UserRole>(authDefaultRole || 'student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('Apex Institute of Technology');
  
  // Student registration fields
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 019-2834');
  const [smsConsent, setSmsConsent] = useState(true);
  const [academicYear, setAcademicYear] = useState<AcademicYear>('First');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [interests, setInterests] = useState<string[]>(['Artificial Intelligence', 'Coding']);
  
  // Organizer registration fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Student Club');
  const [contactInfo, setContactInfo] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authModalMode === 'login') {
      // Find matching user or fallback demo
      const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        loginAsUser(existing);
        setShowAuthModal(false);
      } else {
        setErrorMsg('Email not found in demonstration store. Try one of the quick demo accounts below or register a new profile.');
      }
    } else {
      // Register
      if (!name || !email) {
        return setErrorMsg('Please fill in your name and email.');
      }

      const newUser = registerUser({
        name,
        email,
        phoneNumber: role === 'student' ? phoneNumber : undefined,
        phoneVerified: true,
        emailVerified: true,
        role, // student or organizer only! Admin is protected.
        college,
        academicYear: role === 'student' ? academicYear : undefined,
        branch: role === 'student' ? branch : undefined,
        interests: role === 'student' ? interests : undefined,
        organizationName: role === 'organizer' ? organizationName : undefined,
        organizationType: role === 'organizer' ? organizationType : undefined,
        contactInfo: role === 'organizer' ? contactInfo : undefined,
        isVerifiedOrganizer: false,
        notificationPrefs: {
          inApp: true,
          browserPush: true,
          emailUpdates: true,
          smsAlerts: smsConsent,
          smsConsent: smsConsent,
          filterMode: 'matching_interests',
          remind3Days: true,
          remind24Hours: true,
          remind2Hours: true,
        },
      });

      setShowAuthModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {authModalMode === 'login' ? 'Sign In to CampusPulse' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {authModalMode === 'login' ? 'Access your matched feed and deadlines' : 'Connect with campus opportunities and alerts'}
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Shortcut */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Demonstration Logins</span>
            </span>
            <span className="text-[10px] text-slate-400">1-click switch</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                switchDemoAccount('student1');
                setShowAuthModal(false);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="font-bold text-white text-[11px]">Aarav (Student)</div>
              <div className="text-[10px] text-slate-400">1st Year CSE</div>
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoAccount('organizer');
                setShowAuthModal(false);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="font-bold text-indigo-300 text-[11px]">Priya (Organizer)</div>
              <div className="text-[10px] text-slate-400">Dev Society</div>
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoAccount('admin');
                setShowAuthModal(false);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="font-bold text-purple-300 text-[11px]">Dr. Mehta (Admin)</div>
              <div className="text-[10px] text-slate-400">Dean / Council</div>
            </button>
          </div>
        </div>

        {/* Mode Selector (Student vs Organizer) */}
        {authModalMode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  role === 'student'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🎓 College Student
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  role === 'organizer'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏛️ Event Organizer / Club
              </button>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
              <Info className="w-3 h-3" />
              <span>Administrator roles are strictly protected and assigned by institutional governance.</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {authModalMode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">College Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. maya@university.edu"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {authModalMode === 'register' && role === 'student' && (
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Phone Number (For SMS Alerts) *</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>
                  I consent to receive timely SMS deadline alerts for relevant matching opportunities. You can change this in notification settings anytime.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-1">
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
            </>
          )}

          {authModalMode === 'register' && role === 'organizer' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Club / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. AI & Robotics Student Guild"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Contact Phone / Handle</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. +1 555-0192 or @aiguildu"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            {authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {authModalMode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
