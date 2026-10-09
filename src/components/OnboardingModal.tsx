import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INTEREST_CATEGORIES, AcademicYear, Branch } from '../types';
import { Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { 
    showOnboardingModal, 
    setShowOnboardingModal, 
    currentUser, 
    updateUserProfile 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [college, setCollege] = useState(currentUser?.college || 'Apex Institute of Technology');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(currentUser?.academicYear || 'First');
  const [branch, setBranch] = useState<Branch>(currentUser?.branch || 'CSE');
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || ['Artificial Intelligence', 'Coding', 'Hackathons']);
  const [preferredMode, setPreferredMode] = useState<'Online' | 'Offline' | 'Both'>(currentUser?.preferredMode || 'Both');

  if (!showOnboardingModal) return null;

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFinish = () => {
    updateUserProfile({
      college,
      academicYear,
      branch,
      interests,
      preferredMode,
    });
    setShowOnboardingModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Personalize Your Campus Opportunities · Step {step} of 3</span>
          </div>

          <button
            onClick={() => setShowOnboardingModal(false)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: Academic Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Tell us about your campus</h2>
              <p className="text-xs text-slate-400 mt-1">This helps us filter college-specific eligibility criteria.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">College or University Name</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Academic Year</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['First', 'Second', 'Third', 'Fourth'] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        academicYear === yr
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {yr} Year
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Degree Branch</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'] as Branch[]).map((br) => (
                    <button
                      key={br}
                      type="button"
                      onClick={() => setBranch(br)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        branch === br
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <span>Next: Select Interests</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interests selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">What opportunities excite you?</h2>
              <p className="text-xs text-slate-400 mt-1">Select topics you'd love to participate in. Select multiple.</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 text-xs">
              {INTEREST_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    interests.includes(item)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <span>Next: Mode Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preferred Event Mode & Notifications */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">How do you prefer to attend?</h2>
              <p className="text-xs text-slate-400 mt-1">Pick your preferred format for workshops, hackathons, and symposiums.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['Both', 'Offline', 'Online'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreferredMode(m)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    preferredMode === m
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">{m}</div>
                  <div className="text-[10px] mt-1 opacity-80">
                    {m === 'Both' ? 'Online & In-person' : m === 'Offline' ? 'On campus only' : 'Virtual / Discord'}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
              ✓ Automated reminders (3 days, 24 hours, 2 hours before deadline) are activated for matching opportunities.
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Preferences & Explore</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
