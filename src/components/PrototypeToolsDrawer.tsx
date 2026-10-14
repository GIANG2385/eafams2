/**
 * Reset Mock Data Control
 * Replaces the complex prototype tools drawer with a clean, focused Reset Mock Data action.
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export const PrototypeToolsDrawer: React.FC = () => {
  const { resetSeedAction } = usePortal();
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleReset = () => {
    resetSeedAction();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <>
      {/* Floating Reset Mock Data Button */}
      <div className="fixed bottom-4 left-4 z-50 no-print flex items-center gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-slate-700/80 text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer hover:shadow-xl active:scale-95"
          title="Reset all student, invoice, and ledger data to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset mock data</span>
        </button>

        {/* Confirmation Toast */}
        {showToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-full shadow-lg animate-in fade-in slide-in-from-left duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Mock data reset</span>
          </div>
        )}
      </div>
    </>
  );
};
