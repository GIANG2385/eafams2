/**
 * Home View (FS-08 6.1, F9 SCR-01)
 * Displays overview cards for each linked student, EA balance, need to pay,
 * fee alerts (Overdue / Due soon / Not due yet), "+N more" indicator, and FAS badge.
 */

import React from 'react';
import { usePortal } from '../context/PortalContext';
import { Function1Service } from '../services/function1';
import { formatSGD, formatDateDDMMYYYY } from '../config';
import { MSG } from '../messages';
import { reached, parseIsoDate, cmp } from '../services/clock';
import {
  GraduationCap,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  School,
  FileCheck2,
  Calendar,
  Lock,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentParent,
    linkedStudents,
    getStudentEa,
    getStudentInvoices,
    navigate,
    today,
    todayIso,
  } = usePortal();

  // If no children linked (e.g. P9) -> Empty state MSG-0801 (Section 11 #3)
  if (linkedStudents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-[#1d4f91] rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Linked Students Found</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            {MSG.MSG_0801}
          </p>
          <div className="text-xs text-slate-400 font-mono bg-slate-50 py-2 px-4 rounded-lg inline-block">
            NRIC: {currentParent?.nric} &bull; Account Code: {currentParent?.code}
          </div>
        </div>
      </div>
    );
  }

  // Check if ALL linked students are >= 16yo (used to hide top Apply for FAS button)
  const all16OrOlder = linkedStudents.every((s) => reached(s.dob, 16, today));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {currentParent?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of linked children, Education Account balances, and pending school charges.
          </p>
        </div>

        {/* Apply for FAS button (Hidden if all linked students are >= 16) */}
        {!all16OrOlder && (
          <button
            onClick={() => navigate('/apply-fas')}
            className="inline-flex items-center gap-2 bg-[#1d4f91] hover:bg-[#163e72] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Apply for FAS</span>
          </button>
        )}
      </div>

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {linkedStudents.map((student) => {
          const account = getStudentEa(student.id);
          const eaView = Function1Service.getEaView(student, account, today);
          const invoices = getStudentInvoices(student.id);
          const isStudent16OrOlder = reached(student.dob, 16, today);

          // Outstanding invoices: Issued or PaymentPending
          const outstandingInvoices = invoices.filter(
            (i) => i.status === 'Issued' || i.status === 'PaymentPending'
          );

          // Need to pay total
          const needToPayCents = outstandingInvoices.reduce((acc, inv) => acc + inv.netCents, 0);

          // Sort outstanding invoices by earliest due date
          const sortedInvoices = [...outstandingInvoices].sort((a, b) => {
            const dA = parseIsoDate(a.dueDate);
            const dB = parseIsoDate(b.dueDate);
            return cmp(dA, dB);
          });

          // Show top 3, plus "+N more" (FS-08 AC 19)
          const displayedInvoices = sortedInvoices.slice(0, 3);
          const remainingCount = sortedInvoices.length - displayedInvoices.length;

          return (
            <div
              key={student.id}
              onClick={() => navigate('/ea', { studentId: student.id })}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* 16+ View-Only Notice Banner */}
                {isStudent16OrOlder && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 text-xs text-amber-900 flex items-center gap-2 font-medium">
                    <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{MSG.CHILD_16_OR_OLDER_TEXT}</span>
                  </div>
                )}

                {/* Eligibility review banner */}
                {eaView.eligibilityReviewBanner && (
                  <div className="bg-rose-50 border-b border-rose-200 px-5 py-2 text-xs text-rose-800 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{eaView.eligibilityReviewBanner}</span>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#1d4f91] transition-colors">
                          {student.fullName}
                        </h2>
                        {/* FAS Granted Badge (Section 7.2) */}
                        {student.fasGranted && (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {student.fasGranted}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {student.school} &bull; {student.level} ({student.class})
                      </p>
                    </div>

                    {/* EA Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        eaView.badgeVariant === 'green'
                          ? 'bg-emerald-100 text-emerald-800'
                          : eaView.badgeVariant === 'amber'
                          ? 'bg-amber-100 text-amber-900'
                          : eaView.badgeVariant === 'slate'
                          ? 'bg-slate-100 text-slate-700'
                          : eaView.badgeVariant === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {eaView.status}
                    </span>
                  </div>

                  {/* Financial Overview Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    {/* EA Balance */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1d4f91]" />
                        <span>EA Balance</span>
                      </div>
                      {eaView.showBalance ? (
                        <div className="text-xl font-extrabold text-slate-900">
                          {formatSGD(eaView.balanceCents || 0)}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic leading-snug">
                          {eaView.displayText || 'Not applicable'}
                        </div>
                      )}
                    </div>

                    {/* Need to Pay */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span>Need to Pay</span>
                      </div>
                      <div
                        className={`text-xl font-extrabold ${
                          needToPayCents > 0 ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {formatSGD(needToPayCents)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outstanding Fees Section */}
                <div className="p-6">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Outstanding Invoices ({outstandingInvoices.length})
                  </div>

                  {displayedInvoices.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 italic">
                      {MSG.HOME_NO_FEES_TEXT}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {displayedInvoices.map((inv) => {
                        // Calculate due label based on today
                        const dueTuple = parseIsoDate(inv.dueDate);
                        const isOverdue = cmp(dueTuple, today) < 0;
                        // Within 30 days
                        const diffDays =
                          (new Date(inv.dueDate).getTime() - new Date(todayIso).getTime()) /
                          (1000 * 3600 * 24);
                        const isDueSoon = !isOverdue && diffDays <= 30;

                        return (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs"
                          >
                            <div className="truncate max-w-[200px] sm:max-w-[280px]">
                              <div className="font-semibold text-slate-800 truncate">
                                {inv.items[0]?.description || inv.invoiceNumber}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>Due: {formatDateDDMMYYYY(inv.dueDate)}</span>
                                {isOverdue && (
                                  <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded text-[10px]">
                                    Overdue
                                  </span>
                                )}
                                {isDueSoon && (
                                  <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                                    Due soon
                                  </span>
                                )}
                                {!isOverdue && !isDueSoon && (
                                  <span className="font-medium text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded text-[10px]">
                                    Not due yet
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="font-bold text-slate-900 text-right">
                              {formatSGD(inv.netCents)}
                            </div>
                          </div>
                        );
                      })}

                      {/* +N More row (FS-08 AC 19) */}
                      {remainingCount > 0 && (
                        <div className="text-xs font-semibold text-[#1d4f91] pt-1 pl-1">
                          +{remainingCount} more invoice{remainingCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <span>View Education Account</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening EA view
                    navigate('/fees', { studentId: student.id });
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#1d4f91] hover:text-[#143765] bg-white hover:bg-blue-50 border border-slate-200 rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  All fees &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
