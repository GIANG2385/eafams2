/**
 * SingPass Mock Login Screen (FS-08 FR-08.1, Section 5.5, 7.1)
 * Simulates Singapore National Digital Identity SingPass authentication.
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Shield, User, AlertTriangle, ArrowLeft, Check, Users, ShieldAlert } from 'lucide-react';

export const SingpassMockModal: React.FC = () => {
  const { parents, loginWithSingPass, navigate } = usePortal();
  const [selectedParentId, setSelectedParentId] = useState<string>('P1');

  const parentTestScenarios: Record<string, { role: string; children: string; scenario: string }> = {
    P1: {
      role: 'Father',
      children: 'Tan Jun Hao (10yo, EA Active $455.07), Tan Jia Yi (14yo, EA Active $20.00)',
      scenario: 'First-time registration: provisions account, activates user, links children (AC 1)',
    },
    P2: {
      role: 'Mother',
      children: 'Tan Jun Hao (10yo), Tan Jia Yi (14yo)',
      scenario: 'Returning user: already registered, shares linked children with P1 (AC 2, AC 4)',
    },
    P3: {
      role: 'Father',
      children: 'Rahman Irfan (16yo today! Closes on access), Rahman Aisyah (14yo, no invoices)',
      scenario: 'Closure-on-access test: B1 closes immediately to $0.00; B2 has 0 fees (AC 7)',
    },
    P4: {
      role: 'Mother',
      children: 'Siti Nur Hana (16yo with $112.40 balance), Ahmad Danish (13yo, online payment pending)',
      scenario: 'Closure deferred on C1; C2 has PaymentPending online transaction (AC 8, AC 11)',
    },
    P5: {
      role: 'Mother',
      children: 'Faizal Aryan (9yo, PR), Chen Yu (15yo, Foreigner)',
      scenario: 'Non-citizens: Not eligible for EA, online payment only (AC 10, F9 AC-14)',
    },
    P6: {
      role: 'Father',
      children: 'Wong Zi Hao (<7yo), Wong Rachel (7yo today), Wong Ethan (7yo today, missing gender)',
      scenario: 'Daily Sync scenarios: Rachel gets EA after sync; Ethan skipped with exception',
    },
    P7: {
      role: 'Mother',
      children: 'Chen Xin Yi (10yo, EA Active $200.00, Invoice 7001 $38.00)',
      scenario: 'Single child direct shortcut test: Home "All fees" goes direct to Fees (AC-03)',
    },
    P8: {
      role: 'Mother',
      children: 'Ong Wei Ling (16yo, EA Closed)',
      scenario: 'All children >= 16: My details locked in view-only mode (AC 9)',
    },
    P9: {
      role: 'Mother (No linked students in MOE DB)',
      children: 'None',
      scenario: 'Citizen in dataset without linked children: Home empty state with MSG-0801',
    },
  };

  const handleSelectLogin = (parentId: string) => {
    loginWithSingPass(parentId);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        {/* SingPass Simulated Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* SingPass Top Bar */}
          <div className="bg-[#d82c20] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#d82c20] font-black text-sm tracking-tight shadow-xs">
                sp
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Singpass</h1>
                <p className="text-[11px] text-red-100">National Digital Identity &bull; Simulated IdP</p>
              </div>
            </div>
            <span className="bg-red-800/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              Simulation Mode
            </span>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Prototype Verification:</strong> Select an authentic test parent profile to test specific acceptance criteria (FS-08 AC 1–5, F1, F9). No password required.
              </div>
            </div>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Select Parent Profile to Authenticate:
            </h2>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {parents.map((p) => {
                const info = parentTestScenarios[p.id];
                const isSelected = selectedParentId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParentId(p.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1d4f91] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#1d4f91] text-white text-xs font-bold flex items-center justify-center">
                          {p.id}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{p.fullName}</span>
                        <span className="text-xs text-slate-500 font-mono">({p.nric})</span>
                        {!p.isActivate && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                            New User
                          </span>
                        )}
                        {p.isActivate && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                            Returning
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{info?.role}</span>
                    </div>

                    <div className="text-xs text-slate-600 mb-1">
                      <span className="font-medium text-slate-700">Children: </span>
                      {info?.children || 'None'}
                    </div>

                    <div className="text-[11px] text-blue-900 bg-blue-100/60 rounded px-2 py-1">
                      <span className="font-semibold">Test goal: </span>
                      {info?.scenario}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Login Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleSelectLogin(selectedParentId)}
                className="w-full bg-[#d82c20] hover:bg-[#b82218] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Log in as {parents.find((p) => p.id === selectedParentId)?.fullName}</span>
              </button>
            </div>

            {/* Negative / Error Simulation Scenarios */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Simulate Exception / Failure Responses:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => loginWithSingPass('UNLINKED_NRIC')}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center border border-slate-200 transition-colors"
                  title="Simulates SingPass login with NRIC not found in education sync data (MSG-0801)"
                >
                  NRIC not in data (S9999999Z)
                </button>
                <button
                  onClick={() => loginWithSingPass('CANCEL')}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center border border-slate-200 transition-colors"
                  title="Simulates user cancelling SingPass authentication (MSG-0802)"
                >
                  Cancel Authentication
                </button>
                <button
                  onClick={() => loginWithSingPass('ERROR')}
                  className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-center border border-rose-200 transition-colors"
                  title="Simulates gateway/IdP technical fault (MSG-0802)"
                >
                  Simulate Singpass Error
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
