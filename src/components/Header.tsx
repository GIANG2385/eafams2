/**
 * Official Singapore MOE Parent Portal Header
 * Features Singapore Gov agency bar, sample data banner, clean ink-blue branding,
 * navigation tabs, and session info. No bell or chatbot (FS-08 v0.3).
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import { Shield, User, LogOut, ChevronRight, AlertCircle, X, CheckCircle, Info } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentParent, logout, route, navigate, bannerMessage, clearBanner, linkedStudents } = usePortal();

  const isPublicRoute = route.path === '/' || route.path === '/singpass';
  const hasNoLinkedChildren = currentParent && linkedStudents.length === 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Singapore Gov Agency Top Bar */}
      <div className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px] px-4 py-1 flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-2.5 bg-red-600 inline-block rounded-xs"></span>
            <span>Singapore Government Agency</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 hidden sm:inline">An Official Singapore Government Agency Website</span>
        </div>
      </div>


      {/* Main Brand Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div
          onClick={() => navigate(currentParent ? '/home' : '/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* MOE Crest / Lion Mark */}
          <div className="w-10 h-10 rounded-lg bg-[#1d4f91] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#163e72] transition-colors">
            MOE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Parent e-Services</span>
              <span className="bg-blue-100 text-[#1d4f91] text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500">Ministry of Education Singapore &bull; Education Accounts & Fees</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {currentParent ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900">{currentParent.fullName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{currentParent.nric}</div>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Sign out of SingPass session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/singpass')}
              className="flex items-center gap-2 bg-[#d82c20] hover:bg-[#b82218] text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Log in with Singpass</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bar when logged in */}
      {currentParent && (
        <nav className="border-t border-slate-200 bg-slate-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => navigate('/home')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                route.path === '/home'
                  ? 'border-[#1d4f91] text-[#1d4f91]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>

            {/* If parent has NO children linked, hide EA and Fees tabs per Section 11 #3 */}
            {!hasNoLinkedChildren && (
              <>
                <button
                  onClick={() => navigate('/ea', { studentId: linkedStudents[0]?.id })}
                  className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    route.path.startsWith('/ea')
                      ? 'border-[#1d4f91] text-[#1d4f91]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Education Account
                </button>
                <button
                  onClick={() => navigate('/fees', { studentId: linkedStudents[0]?.id })}
                  className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    route.path.startsWith('/fees') || route.path.startsWith('/pay')
                      ? 'border-[#1d4f91] text-[#1d4f91]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fees & Payments
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/profile')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                route.path === '/profile'
                  ? 'border-[#1d4f91] text-[#1d4f91]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              My details
            </button>
          </div>
        </nav>
      )}

      {/* Global Banner Notification (e.g. MSG-0002, MSG-0801, MSG-0802) */}
      {bannerMessage && (
        <div
          className={`px-4 py-2.5 text-sm flex items-center justify-between border-b ${
            bannerMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : bannerMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {bannerMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              {bannerMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span className="font-medium">{bannerMessage.text}</span>
              {bannerMessage.code && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/5 font-semibold">
                  [{bannerMessage.code}]
                </span>
              )}
            </div>
            <button
              onClick={clearBanner}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
