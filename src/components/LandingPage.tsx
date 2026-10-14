/**
 * Parent e-Service Portal Landing Page
 * Clean hero with "start now ->", registration guide, eligibility policy, and footer integration.
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import {
  CheckCircle2,
  Building,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = usePortal();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Hero Section */}
      <section className="bg-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Education accounts<br />
              and school fees,<br />
              <span className="text-[#1a56db]">in one place.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed mb-8">
              Eafams is the official portal by the Ministry of Education for parents and legal guardians to manage your child’s education account, view school charges and settle fees seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => navigate('/singpass')}
                className="bg-[#d82c20] hover:bg-[#b82218] text-white text-base font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Start now</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Registration Guide */}
      <section id="about-section" className="py-16 bg-slate-50/50 border-b border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              How to Register & Get Started
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              No paper registration required. Guardian accounts are provisioned securely via Singapore's National Digital Identity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-xs font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Singpass Login</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in securely using your Singpass credentials. Your verified identity and residential address are retrieved automatically.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-xs font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Child Association</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The portal matches your NRIC against the Ministry of Education student master record. Both parents share access to linked children.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-xs font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Review Fees & EA</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect live balances, overdue notices, upcoming school charges, and detailed fee breakdowns inclusive of GST (9%).
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#1a56db] text-white flex items-center justify-center text-xs font-bold mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">One-Click Settlement</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay using available Education Account balances or pay online. Instant digital receipts with tamper-evident reference IDs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility & Policy Guidelines */}
      <section id="help-section" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-xl text-[#1a56db]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Education Account (EA) Eligibility & Lifecycle (F1 Specification)
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                By Ministry of Education policy:
              </p>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Age 7 Creation:</strong> Education Accounts are automatically created on the student's 7th birthday for Singapore Citizens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Singapore Citizens Only:</strong> Permanent Residents and International students can pay fees online but are not eligible for Education Accounts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Age 16 Closure:</strong> Upon turning 16, accounts with zero balance close immediately. Accounts with remaining balances transition to "Due for closure" until CPF transfer is executed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>16+ View-Only:</strong> Parents can view historical fees and transactions for children aged 16 and older, but new payments are disabled in the parent portal.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
