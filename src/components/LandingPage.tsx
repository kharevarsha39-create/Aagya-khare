import React from 'react';
import { useApp } from '../context/AppContext';
import { EventCard } from './EventCard';
import { 
  Zap, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Calendar,
  Layers,
  TrendingUp,
  Award,
  BellRing,
  Filter
} from 'lucide-react';
import { INTEREST_CATEGORIES } from '../types';

export const LandingPage: React.FC = () => {
  const { 
    events, 
    setActiveView, 
    setShowAuthModal, 
    setAuthModalMode, 
    setAuthDefaultRole,
    currentUser,
    switchDemoAccount 
  } = useApp();

  const activeEvents = events.filter(e => e.verificationStatus === 'published');
  const previewEvents = activeEvents.slice(0, 3);
  const closingSoonEvents = activeEvents
    .filter(e => {
      const diffHours = (new Date(e.registrationDeadline).getTime() - Date.now()) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 72;
    })
    .slice(0, 2);

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 pb-16 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Never Miss an Opportunity Again</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
            Your Next Opportunity Is Waiting.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Discover events that match your interests. Get notified before registration closes. Never miss out again.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveView('student_dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'organizer') {
                  setActiveView('organizer_dashboard');
                } else {
                  setAuthDefaultRole('organizer');
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              I'm an Event Organizer
            </button>
          </div>

          {/* Quick Demo Jump pills for evaluation */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Fast Demo Jump:</span>
            <button 
              onClick={() => switchDemoAccount('student1')} 
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition-colors"
            >
              First-Year CSE Student (AI & Coding)
            </button>
            <button 
              onClick={() => switchDemoAccount('student2')} 
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition-colors"
            >
              Cultural & Dance Student
            </button>
            <button 
              onClick={() => switchDemoAccount('organizer')} 
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 transition-colors"
            >
              Club Organizer Console
            </button>
            <button 
              onClick={() => switchDemoAccount('admin')} 
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-purple-300 transition-colors"
            >
              Admin Verification Queue
            </button>
          </div>

        </div>
      </section>

      {/* 3-Step Core Workflow */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <div className="text-xs uppercase font-bold tracking-wider text-indigo-400">How CampusPulse Works</div>
          <h2 className="text-3xl font-extrabold text-white">Three steps to never missing out</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Connecting organizers and students into one unified campus opportunities network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center font-mono text-lg font-bold text-indigo-400">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Organizers Publish Events</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student clubs, departments, and societies submit their hackathons, workshops, and fests once with explicit eligibility rules and registration deadlines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center font-mono text-lg font-bold text-purple-400">
              02
            </div>
            <h3 className="text-lg font-bold text-white">CampusPulse Matches Students</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our matching engine cross-references academic year, branch, personal interests, and preferred mode (online/offline) to compute customized relevance scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center font-mono text-lg font-bold text-sky-400">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Students Receive Timely Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Urgent countdown tickers and in-app alerts fire 3 days, 24 hours, and 2 hours before registrations lock, guaranteeing you never miss a registration window.
            </p>
          </div>

        </div>
      </section>

      {/* Registration Deadlines Section (Priority Preview) */}
      {closingSoonEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-900/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>REGISTRATION CLOSING SOON</span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">Don't Miss These Approaching Deadlines</h3>
              </div>
              <button
                onClick={() => setActiveView('priority_list')}
                className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors self-start sm:self-auto"
              >
                View Full Priority List ⚡
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {closingSoonEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Preview */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-indigo-400">Curated Feed</div>
            <h2 className="text-3xl font-extrabold text-white mt-1">Featured Campus Opportunities</h2>
          </div>
          <button
            onClick={() => setActiveView('student_dashboard')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse All {activeEvents.length} Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Benefits Dual Matrix: Students vs Organizers */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* For Students */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">For College Students</h3>
              <p className="text-xs text-slate-400 mt-1">Built to end FOMO and scattered WhatsApp announcement chaos.</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Noise:</strong> Get recommended only for hackathons, workshops, and competitions you are actually eligible for.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Live Countdown Clocks:</strong> See exactly how many hours and minutes remain before registration links lock.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Official vs Student Club clarity:</strong> Easily distinguish accredited college events from community tournaments.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Smart Priority List:</strong> Automatically ranks upcoming events by your interest score and closing urgency.</span>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">For Event Organizers</h3>
              <p className="text-xs text-slate-400 mt-1">Target students genuinely interested without spamming group chats.</p>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Targeted Reach:</strong> Your event automatically lands on the priority feeds of interested students.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Verified Trust Badge:</strong> Get your student club or university department verified to build trust.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Live Engagement Metrics:</strong> Track student views, registration link clicks, and bookmark counts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Deadline Management:</strong> Extend deadlines or close registration early with a single click.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Popular Event Categories */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-indigo-400">Discover by Interest</div>
          <h2 className="text-2xl font-bold text-white">Explore 20+ Opportunity Domains</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {INTEREST_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveView('student_dashboard')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-700/60 text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Never Miss Out Again?</h2>
            <p className="text-sm text-indigo-200 max-w-xl mx-auto">
              Join students across campus discovering tailored hackathons, summits, and workshops before spots fill up.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthDefaultRole('student');
                setAuthModalMode('register');
                setShowAuthModal(true);
              }}
              className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg"
            >
              Create Free Student Account
            </button>
            <button
              onClick={() => setActiveView('student_dashboard')}
              className="px-6 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              Explore Without Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
