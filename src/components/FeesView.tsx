/**
 * Fees & Payments Screen (F9 SCR-02, SCR-03)
 * Displays outstanding invoices by student, EA widget, expandable line items with GST,
 * Pay/View status buttons, SCR-03 empty state, and Recent Payments receipt drawer.
 */

import React, { useState, useMemo } from 'react';
import { usePortal } from '../context/PortalContext';
import { Function1Service } from '../services/function1';
import { formatSGD, formatDateDDMMYYYY } from '../config';
import { MSG } from '../messages';
import { reached, parseIsoDate, cmp } from '../services/clock';
import {
  CreditCard,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Receipt,
  Lock,
} from 'lucide-react';

export const FeesView: React.FC = () => {
  const {
    currentParent,
    linkedStudents,
    getStudentEa,
    getStudentInvoices,
    transactions,
    route,
    navigate,
    today,
    todayIso,
  } = usePortal();

  // Selected student
  const initialStudentId =
    route.studentId || (linkedStudents.length > 0 ? linkedStudents[0].id : '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);

  // Accordion expanded invoices
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});

  // Collapsible recent payments
  const [showRecentPayments, setShowRecentPayments] = useState<boolean>(true);

  // Active student
  const activeStudent = useMemo(() => {
    return linkedStudents.find((s) => s.id === selectedStudentId);
  }, [linkedStudents, selectedStudentId]);

  // Security check: if not in linkedStudents -> FORBIDDEN_CHILD (F9 AC-12, Section 8.2)
  if (!activeStudent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900 mb-2">{MSG.FORBIDDEN_CHILD}</h2>
          <p className="text-xs text-rose-700 mb-6">
            You do not have access to this student's records.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#1d4f91] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const account = getStudentEa(activeStudent.id);
  const eaView = Function1Service.getEaView(activeStudent, account, today);
  const invoices = getStudentInvoices(activeStudent.id);
  const is16OrOlder = reached(activeStudent.dob, 16, today);

  // Outstanding vs Paid
  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === 'Issued' || inv.status === 'PaymentPending'
  );
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');

  // Total outstanding cents
  const totalOutstandingCents = outstandingInvoices.reduce((acc, inv) => acc + inv.netCents, 0);

  const toggleAccordion = (invId: string) => {
    setExpandedInvoices((prev) => ({ ...prev, [invId]: !prev[invId] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Student Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fees & Payments</h1>
          <p className="text-xs text-slate-500">
            Review itemised charges, co-curricular fees, and settle invoices.
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto self-start sm:self-auto">
            {linkedStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedStudentId === s.id
                    ? 'bg-white text-[#1d4f91] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 16+ View-Only Banner */}
      {is16OrOlder && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{MSG.CHILD_16_OR_OLDER_TEXT}</span>
        </div>
      )}

      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Outstanding Total Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Outstanding Fees</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatSGD(totalOutstandingCents)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {outstandingInvoices.length} outstanding invoice{outstandingInvoices.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* EA Balance Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#1d4f91]" />
              <span>Education Account Balance</span>
            </div>
            {eaView.showBalance ? (
              <div className="text-2xl font-black text-[#1d4f91]">
                {formatSGD(eaView.balanceCents || 0)}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic font-medium mt-1">
                {eaView.displayText || 'This student does not have an Education Account.'}
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-1">
              Status: <span className="font-semibold text-slate-700">{eaView.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List / SCR-03 Empty State */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Outstanding Invoices
        </h2>

        {outstandingInvoices.length === 0 ? (
          // SCR-03: No outstanding fees (AC-02)
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">{MSG.FEES_EMPTY_TEXT}</h3>
            <p className="text-xs text-slate-500 mb-6">
              All school fees and co-curricular charges for {activeStudent.fullName} are settled.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {outstandingInvoices.map((inv) => {
              const isExpanded = !!expandedInvoices[inv.id];
              const dueTuple = parseIsoDate(inv.dueDate);
              const isOverdue = cmp(dueTuple, today) < 0;
              const diffDays =
                (new Date(inv.dueDate).getTime() - new Date(todayIso).getTime()) / (1000 * 3600 * 24);
              const isDueSoon = !isOverdue && diffDays <= 30;

              // Find open transaction if PaymentPending
              const openTxn = transactions.find(
                (t) => t.invoiceId === inv.id && t.status === 'Pending'
              );

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Summary Bar */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-base text-slate-900 font-mono">
                          {inv.invoiceNumber}
                        </span>
                        {/* Status Badges */}
                        {inv.status === 'PaymentPending' ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Awaiting Payment
                          </span>
                        ) : isOverdue ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Due soon
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Not due yet
                          </span>
                        )}
                        <span className="text-xs text-slate-500">&bull; {inv.schoolName}</span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Due date: <strong>{formatDateDDMMYYYY(inv.dueDate)}</strong></span>
                        <span>&bull;</span>
                        <span>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">
                          Amount to Pay
                        </div>
                        <div className="text-xl font-extrabold text-slate-900">
                          {formatSGD(inv.netCents)}
                        </div>
                      </div>

                      {/* Pay / View status button (Hidden if child >= 16) */}
                      {!is16OrOlder && (
                        <div>
                          {inv.status === 'PaymentPending' ? (
                            <button
                              onClick={() =>
                                navigate('/pay/status', {
                                  txnId: openTxn?.id,
                                  invoiceId: inv.id,
                                })
                              }
                              className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                            >
                              View status
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                navigate('/fees/pay', {
                                  invoiceId: inv.id,
                                  studentId: activeStudent.id,
                                })
                              }
                              className="px-5 py-2 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Pay now
                            </button>
                          )}
                        </div>
                      )}

                      {/* Accordion Toggle */}
                      <button
                        onClick={() => toggleAccordion(inv.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Itemised Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 border-t border-slate-200 p-5">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        Itemised Charges Breakdown
                      </div>

                      <div className="space-y-3">
                        {inv.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="font-bold text-slate-900">{item.description}</span>
                                <span className="ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1d4f91]">
                                  {item.feeType}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {formatSGD(item.netCents)}
                              </span>
                            </div>

                            {/* Components inclusive of GST */}
                            <div className="space-y-1 pl-3 border-l-2 border-slate-200 my-2 text-[11px] text-slate-600">
                              {item.components.map((comp, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{comp.name}</span>
                                  <span className="font-mono">{formatSGD(comp.amountCents)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Subtotal line: Gross, Subsidy 0.00, Net */}
                            <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
                              <span>Gross: {formatSGD(item.grossCents)}</span>
                              <span>Subsidy (FAS): {formatSGD(item.subsidyCents)}</span>
                              <span className="font-bold text-slate-800">
                                Net: {formatSGD(item.netCents)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Payments Section (AC-13) */}
      {paidInvoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div
            onClick={() => setShowRecentPayments(!showRecentPayments)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#1d4f91]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Payments ({paidInvoices.length})
              </h2>
            </div>
            {showRecentPayments ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {showRecentPayments && (
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {paidInvoices.map((inv) => {
                const paidTx = transactions.find(
                  (t) => t.invoiceId === inv.id && t.status === 'Succeeded'
                );

                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{inv.invoiceNumber}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {inv.items[0]?.description} &bull; Paid on{' '}
                        {inv.paidAt ? formatDateDDMMYYYY(inv.paidAt.split('T')[0]) : '-'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatSGD(inv.netCents)}
                      </div>

                      {/* View Receipt Link (AC-13) */}
                      {paidTx && (
                        <button
                          onClick={() =>
                            navigate('/pay/receipt', {
                              txnId: paidTx.id,
                              invoiceId: inv.id,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-[#1d4f91] hover:text-[#143765] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
