import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Flag, CheckCircle2 } from 'lucide-react';

export const ReportEventModal: React.FC = () => {
  const { showReportModal, setShowReportModal, reportEvent } = useApp();
  const [reasonCategory, setReasonCategory] = useState('Suspicious external registration URL or phishing concern');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!showReportModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportEvent(
      showReportModal.eventId,
      showReportModal.eventTitle,
      `${reasonCategory}: ${details}`
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowReportModal(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-white">Report Listing</h3>
          </div>
          <button
            onClick={() => setShowReportModal(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">Report Submitted</div>
            <p className="text-xs text-slate-400">Our administrative safety team will review this listing immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Reporting: <strong>{showReportModal.eventTitle}</strong>
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Primary Reason</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="Suspicious external registration URL or phishing concern">Suspicious external registration URL</option>
                <option value="Misleading rules or prizes">Misleading rules or prizes</option>
                <option value="Event has already passed or cancelled without notice">Event passed or cancelled</option>
                <option value="Organizer impersonating an official college department">Unauthorized impersonation of department</option>
                <option value="Charging unauthorized registration fee">Unauthorized hidden fee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what is inaccurate or suspicious..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
