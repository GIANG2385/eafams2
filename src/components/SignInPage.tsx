/**
 * Sign In Page matching eAFAMS Education Portal Login design
 * Provides:
 * - Synchronized with public Header and Footer
 * - Resized "Sign in with Singpass" button (without company subtext)
 * - User ID and Password form with visibility toggle
 * - "Stay signed in for the next 14 days" checkbox
 * - Blue "Sign in" button
 * - Singpass persona modal for selecting test parent profiles
 * - Mother & child education illustration in right dome frame
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { parents, loginWithSingPass, navigate } = usePortal();

  // Form states
  const [userId, setUserId] = useState<string>('S7512345A');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [staySignedIn, setStaySignedIn] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Singpass Persona Modal state
  const [showSingpassModal, setShowSingpassModal] = useState<boolean>(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('P1');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

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

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Look for parent by NRIC or ID or userId, or default to first parent
    const cleanId = userId.trim().toUpperCase();
    const foundParent =
      parents.find(
        (p) =>
          p.nric.toUpperCase() === cleanId ||
          p.id.toUpperCase() === cleanId ||
          (p.userId && p.userId.toUpperCase() === cleanId)
      ) || parents[0];

    const targetId = foundParent ? foundParent.id : 'P1';
    const res = loginWithSingPass(targetId);
    if (res.success) {
      navigate('/home');
    } else {
      setLoginError(res.message || 'Authentication error.');
    }
  };

  const handleExecuteSingpass = () => {
    if (simulateFailure) {
      setLoginError('SingPass authentication failed (simulated MSG-0802). Please try again.');
      setShowSingpassModal(false);
      return;
    }

    const parent = parents.find((p) => p.id === selectedParentId) || parents[0];
    if (!parent) return;

    const res = loginWithSingPass(parent.id);
    if (res.success) {
      setShowSingpassModal(false);
      navigate('/home');
    } else {
      setLoginError(res.message || 'Failed to authenticate');
      setShowSingpassModal(false);
    }
  };

  return (
    <div className="w-full bg-[#f3f8fe] text-slate-800 py-8 lg:py-14 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Main Login Workspace */}
      <div className="max-w-6xl w-full mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Sign in header, Singpass Button, and Credentials Form */}
          <div className="lg:col-span-5 max-w-lg w-full mx-auto lg:mx-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
              Sign in
            </h1>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Resized Singpass Button without company subtext */}
            <button
              type="button"
              onClick={() => setShowSingpassModal(true)}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-red-50/20 hover:border-red-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e22828] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {/* Singpass National Identity Icon */}
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="none">
                    <circle cx="12" cy="7" r="3.2" fill="white" />
                    <path
                      d="M12 12.5C8 12.5 5 15 5 18V19.5H19V18C19 15 16 12.5 12 12.5Z"
                      fill="white"
                    />
                    <path
                      d="M14.5 10L18 7.5L16.5 12.5"
                      stroke="#e22828"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#e22828] transition-colors">
                  Sign in with Singpass
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#e22828] group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Divider "or" */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-[#f3f8fe] px-3 text-xs text-slate-400 font-medium">
                or
              </span>
            </div>

            {/* Standard User ID & Password Form */}
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              {/* User ID Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                  required
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setLoginError(
                        'Demo helper: Any password works for testing. Enter your User ID (e.g. S7512345A) and click Sign in, or use Singpass above.'
                      )
                    }
                    className="text-xs font-semibold text-[#025bd4] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 shadow-2xs pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox: Stay signed in */}
              <div className="pt-1 flex items-center gap-2.5">
                <input
                  id="stay-signed-in"
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#025bd4] focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="stay-signed-in"
                  className="text-xs text-slate-600 cursor-pointer select-none"
                >
                  Stay signed in for the next 14 days
                </label>
              </div>

              {/* Solid Blue Sign in Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-xl text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Sign in
              </button>
            </form>

            {/* Terms and Privacy Footer Note */}
            <p className="text-[11px] text-slate-400 mt-5 leading-normal">
              By continuing, you agree to the Eafams{' '}
              <span className="text-[#025bd4] font-medium hover:underline cursor-pointer">
                Terms of Use
              </span>{' '}
              and{' '}
              <span className="text-[#025bd4] font-medium hover:underline cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* Right Column: Mother & Daughter Educational Artwork with Dome Frame */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            {/* Soft decorative dome glow */}
            <div className="relative w-full max-w-xl aspect-16/10 rounded-[36px] overflow-hidden shadow-md border border-blue-200/50 bg-gradient-to-tr from-sky-100/60 via-white to-blue-50/70 p-1.5 sm:p-2.5">
              <img
                src="/src/assets/images/eafams_login_art_1791961959453.jpg"
                alt="eAFAMS Education Account Family Portal - Mother and child studying together"
                className="w-full h-full object-cover rounded-[30px]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Singpass National Digital Identity Selection Modal */}
      {showSingpassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Singpass Modal Header */}
            <div className="bg-[#e22828] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Singpass Authentication
                  </h3>
                  <p className="text-xs text-red-100">
                    Singapore National Digital Identity &bull; Simulated Environment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSingpassModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Scenario Selection List */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Select Test Scenario
              </div>

              {parents.map((p) => {
                const isSelected = selectedParentId === p.id;
                const meta = parentTestScenarios[p.id];
                if (!meta) return null;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParentId(p.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#025bd4] bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm text-slate-800 leading-snug">
                        <span className="font-semibold text-slate-900">Test scenario: </span>
                        <span>{meta.scenario}</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#025bd4] text-white'
                          : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              {/* Simulation switch: NDI Failure */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Simulate SingPass provider failure (MSG-0802 test)</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSingpassModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSingpass}
                className="bg-[#e22828] hover:bg-[#c91e1e] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Authenticate with Singpass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
