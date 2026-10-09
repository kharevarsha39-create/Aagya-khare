import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, ReportItem } from '../types';
import { formatINR } from '../utils/currency';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  UserCheck, 
  Flag, 
  Search, 
  Eye, 
  MessageSquare,
  HelpCircle,
  Building2,
  Trash2,
  IndianRupee
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    events, 
    allUsers, 
    reports, 
    approveEvent, 
    rejectEvent, 
    toggleOrganizerVerification, 
    resolveReport, 
    updateEvent,
    verifyEventCurrency,
    setSelectedEventForModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'organizers' | 'reports' | 'all_events'>('queue');
  const [rejectingEvent, setRejectingEvent] = useState<EventItem | null>(null);
  const [rejectReason, setRejectReason] = useState('Missing required eligibility details or incomplete rules.');
  const [requestInfoEvent, setRequestInfoEvent] = useState<EventItem | null>(null);
  const [infoMessage, setInfoMessage] = useState('Please clarify the external registration form platform and team size limit.');

  // Events pending administrative verification
  const pendingEvents = events.filter(e => e.verificationStatus === 'pending_verification');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleApprove = (id: string) => {
    approveEvent(id);
  };

  const handleConfirmReject = () => {
    if (!rejectingEvent) return;
    rejectEvent(rejectingEvent.id, rejectReason);
    setRejectingEvent(null);
  };

  const handleSendInfoRequest = () => {
    if (!requestInfoEvent) return;
    rejectEvent(requestInfoEvent.id, `Action Required: ${infoMessage}`);
    setRequestInfoEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Verification & Trust Council</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Event Approval & Safety Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review submitted college opportunities, verify organizer credentials, and maintain listing trust.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>Verification Queue</span>
            {pendingEvents.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-extrabold">
                {pendingEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'organizers'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Verified Organizers
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reported Events</span>
            {pendingReports.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-500 text-white">
                {pendingReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all_events')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'all_events'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Listings ({events.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Approvals ({pendingEvents.length})</span>
            <span>Approved events trigger personalized notifications to eligible students.</span>
          </div>

          {pendingEvents.length > 0 ? (
            pendingEvents.map(event => (
              <div
                key={event.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4 shadow-lg shadow-slate-950/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Event Banner / Poster Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
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

                    <div className="space-y-1.5">
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] uppercase font-bold">
                          Pending Verification
                        </span>
                        <span className="text-indigo-400 font-semibold">{event.category}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={event.classification === 'official' ? 'text-sky-300' : 'text-slate-300'}>
                          {event.classification === 'official' ? 'Official Department' : 'Student Club'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {event.title}
                      </h3>

                      <div className="text-xs text-slate-400">
                        Submitted by <strong className="text-slate-200">{event.organizerName}</strong> ({event.organizerType}) · {event.college}
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedEventForModal(event)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Inspect Full Details
                    </button>

                    <button
                      onClick={() => setRequestInfoEvent(event)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Request Info</span>
                    </button>

                    <button
                      onClick={() => setRejectingEvent(event)}
                      className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(event.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>

                {/* Event Specs Inspector Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Registration Fee (₹ INR):</span>
                    <span className="text-emerald-300 font-semibold font-mono">
                      {event.fee === 0 ? 'Free Entry' : formatINR(event.fee)}
                    </span>
                    {event.flaggedForCurrencyReview && (
                      <div className="mt-1 flex items-center gap-1.5 text-amber-300 text-[10px]">
                        <span>⚠️ Unverified</span>
                        <button
                          type="button"
                          onClick={() => verifyEventCurrency(event.id, event.fee)}
                          className="px-1.5 py-0.5 rounded bg-amber-800 hover:bg-amber-700 text-white font-bold"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Registration Deadline:</span>
                    <span className="text-slate-200 font-mono">{new Date(event.registrationDeadline).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Eligible Years & Branches:</span>
                    <span className="text-slate-200">
                      {event.eligibleYears.join(', ')} · {event.eligibleBranches.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">External Registration URL Safety Check:</span>
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline font-mono truncate block"
                    >
                      {event.registrationUrl}
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-400">There are no pending events awaiting verification right now.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORGANIZERS DIRECTORY */}
      {activeTab === 'organizers' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Grant verified trust badges to official clubs, societies, and college departments.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allUsers
              .filter(u => u.role === 'organizer' || u.role === 'admin')
              .map(org => (
                <div
                  key={org.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{org.organizationName || org.name}</h4>
                      {org.isVerifiedOrganizer && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Lead: {org.name} · {org.college}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{org.email}</div>
                  </div>

                  <button
                    onClick={() => toggleOrganizerVerification(org.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      org.isVerifiedOrganizer
                        ? 'bg-slate-800 text-slate-300 hover:bg-rose-950/60 hover:text-rose-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {org.isVerifiedOrganizer ? 'Revoke Badge' : 'Verify Organizer'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTED EVENTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Student reports on broken links, misleading requirements, or invalid listings.
          </div>

          {reports.length > 0 ? (
            reports.map(report => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-bold text-white">{report.eventTitle}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      report.status === 'pending' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Reported by {report.reporterName}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  "{report.reason}"
                </p>

                <div className="flex justify-end gap-2">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => resolveReport(report.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No reported listings.</div>
          )}
        </div>
      )}

      {/* TAB 4: ALL SYSTEM EVENTS */}
      {activeTab === 'all_events' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Organizer</th>
                  <th className="p-3.5">Fee (₹ INR)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-850">
                    <td className="p-3.5 font-semibold text-white max-w-xs truncate">{ev.title}</td>
                    <td className="p-3.5 text-slate-400">{ev.organizerName}</td>
                    <td className="p-3.5 font-mono text-emerald-300 font-semibold">
                      {ev.fee === 0 ? 'Free Entry' : formatINR(ev.fee)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {ev.verificationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">{new Date(ev.registrationDeadline).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedEventForModal(ev)}
                        className="text-indigo-400 hover:underline"
                      >
                        Inspect
                      </button>
                      {ev.verificationStatus === 'published' && (
                        <button
                          onClick={() => updateEvent(ev.id, { verificationStatus: 'registration_closed' })}
                          className="text-rose-400 hover:underline"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECT WITH REASON MODAL */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Reject Event Submission</h3>
            <p className="text-xs text-slate-300">
              Provide feedback for <strong>{rejectingEvent.title}</strong>. This feedback will be sent directly to the organizer so they can revise and re-submit.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST INFO MODAL */}
      {requestInfoEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Request Additional Information</h3>
            <p className="text-xs text-slate-300">
              Specify what additional documentation or clarification is needed from {requestInfoEvent.organizerName}.
            </p>
            <textarea
              rows={3}
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRequestInfoEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInfoRequest}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
