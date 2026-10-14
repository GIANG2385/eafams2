/**
 * Apply for FAS Placeholder Screen (FS-10, FS-08 6.1)
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import { Sparkles, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

export const ApplyFasModal: React.FC = () => {
  const { navigate } = usePortal();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <button
        onClick={() => navigate('/home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center">
        <div className="w-16 h-16 bg-blue-50 text-[#1d4f91] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          MOE Financial Assistance Scheme (FAS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          Online e-FAS application submission and income assessment will be released in Module FS-10.
        </p>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left text-xs text-slate-700 space-y-2 mb-6">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
            Current Pilot Features:
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Eligible students under MOE FAS (such as Tier 2) display an official granted status badge on the Home dashboard.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>School fee invoices reflect actual payable net amounts.</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2.5 bg-[#1d4f91] hover:bg-[#163e72] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Return to Home Dashboard
        </button>
      </div>
    </div>
  );
};
