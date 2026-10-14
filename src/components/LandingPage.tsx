/**
 * Parent e-Service Portal Landing Page
 * Introduces the platform and facilitates secure account registration for all guardian users via SingPass.
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import {
  Shield,
  CreditCard,
  GraduationCap,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = usePortal();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1d4f91] via-[#1a4682] to-[#163b6e] text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-6 backdrop-blur-xs border border-white/15">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span>Singapore National Digital Identity &bull; Singpass Enabled</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mb-6">
            Parent e-Services for Education Accounts & School Fees
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-2xl leading-relaxed mb-8">
            The official Ministry of Education portal for Singapore parents and legal guardians.
            Manage your child's Education Account, view itemised school charges, and settle fees seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => navigate('/singpass')}
              className="flex items-center justify-center gap-3 bg-[#d82c20] hover:bg-[#b82218] text-white text-base font-bold px-6 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#d82c20] font-black text-xs">
                sp
              </div>
              <span>Log in with Singpass</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-xs text-blue-200/90 flex items-center gap-2 px-2">
              <Lock className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Instant registration on first login &bull; Automatic child linking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1d4f91] flex items-center justify-center mb-4 font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Education Account Balances</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track government annual Edusave top-ups, disbursements, and check live balances for every Singapore Citizen child aged 7 to 16.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Itemised Invoices & Split Pay</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consolidate school fees, textbooks, learning journeys, and miscellaneous charges. Pay with EA funds, online gateway, or smart split.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Financial Assistance (FAS)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Check active subsidies (such as MOE FAS tiers) and obtain official electronic PDF statements and receipts with Singapore timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works & Registration Guide */}
      <section className="py-12 bg-white border-y border-slate-200 px-4 sm:px-6">
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
            <div className="relative p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#1d4f91] text-white flex items-center justify-center text-xs font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Singpass Login</h4>
              <p className="text-xs text-slate-600">
                Log in securely using your Singpass credentials. Your verified identity and residential address are retrieved automatically.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#1d4f91] text-white flex items-center justify-center text-xs font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Child Association</h4>
              <p className="text-xs text-slate-600">
                The portal matches your NRIC against the Ministry of Education student master record. Both parents share access to linked children.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#1d4f91] text-white flex items-center justify-center text-xs font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Review Fees & EA</h4>
              <p className="text-xs text-slate-600">
                Inspect live balances, overdue notices, upcoming school charges, and detailed fee breakdowns inclusive of GST (9%).
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#1d4f91] text-white flex items-center justify-center text-xs font-bold mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">One-Click Settlement</h4>
              <p className="text-xs text-slate-600">
                Pay using available Education Account balances or pay online. Instant digital receipts with tamper-evident reference IDs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility & Policy Guidelines */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 bg-blue-100 rounded-xl text-[#1d4f91]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Education Account (EA) Eligibility & Lifecycle (F1 Specification)
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                By Ministry of Education policy:
              </p>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2">
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

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to manage your child's education account?</h3>
            <p className="text-xs text-slate-400">
              Log in with Singpass now. No pre-registration necessary.
            </p>
          </div>
          <button
            onClick={() => navigate('/singpass')}
            className="bg-[#d82c20] hover:bg-[#b82218] text-white text-sm font-bold px-5 py-3 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            Log in with Singpass
          </button>
        </div>
      </section>
    </div>
  );
};
