/**
 * F9 Payment Flow: SCR-04 through SCR-08
 * Implements Method Selection, Split customization, Idempotent Review/Confirm,
 * Pending Verification, Printable Official Receipt, and Failure Recovery.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { PaymentService, PaymentPlan } from '../services/paymentService';
import { Function1Service } from '../services/function1';
import { formatSGD, formatDateDDMMYYYY, CONFIG } from '../config';
import { MSG } from '../messages';
import {
  CreditCard,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Download,
  ShieldCheck,
  RefreshCw,
  XCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';

export const PaymentFlow: React.FC = () => {
  const {
    currentParent,
    linkedStudents,
    invoices,
    transactions,
    getStudentEa,
    route,
    navigate,
    today,
    confirmPaymentAction,
  } = usePortal();

  // Find target invoice
  const targetInvoice = invoices.find((inv) => inv.id === route.invoiceId);
  const targetStudent = linkedStudents.find((s) => s.id === (targetInvoice?.studentId || route.studentId));
  const eaAccount = targetStudent ? getStudentEa(targetStudent.id) : undefined;

  // Active step derived from route.path
  // '/fees/pay' -> SCR-04
  // '/fees/review' -> SCR-05
  // '/pay/status' -> SCR-06
  // '/pay/receipt' -> SCR-07
  // '/pay/failed' -> SCR-08

  // Transaction for status/receipt/failed
  const targetTx = transactions.find(
    (t) => t.id === route.txnId || (targetInvoice && t.invoiceId === targetInvoice.id)
  );

  // SCR-04 Form State
  const methods = useMemo(() => {
    if (!targetInvoice || !targetStudent) return null;
    return PaymentService.getAvailableMethods(targetInvoice, targetStudent, eaAccount, today);
  }, [targetInvoice, targetStudent, eaAccount, today]);

  const [selectedMethod, setSelectedMethod] = useState<'EA' | 'ONLINE' | 'SPLIT'>('ONLINE');
  const [customEaCents, setCustomEaCents] = useState<number>(0);
  const [splitError, setSplitError] = useState<string | null>(null);

  // Initialize method defaults when invoice changes
  useEffect(() => {
    if (methods) {
      setSelectedMethod(methods.defaultMethod);
      setCustomEaCents(methods.defaultEaCents);
    }
  }, [methods]);

  // Idempotency key for SCR-05 (generated on mount of review)
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Computed online cents for split mode
  const netCents = targetInvoice?.netCents || 0;
  const computedOnlineCents = Math.max(0, netCents - customEaCents);

  // Validate split changes
  const handleEaPortionChange = (valStr: string) => {
    const num = Math.round(parseFloat(valStr || '0') * 100);
    setCustomEaCents(num);
    if (targetInvoice && eaAccount) {
      const validation = PaymentService.validateSplit(targetInvoice, eaAccount, num, netCents - num);
      setSplitError(validation.valid ? null : validation.error || null);
    }
  };

  // If invoice not found
  if (!targetInvoice || !targetStudent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">Invoice Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested invoice could not be located.</p>
        <button
          onClick={() => navigate('/fees')}
          className="px-4 py-2 bg-[#1d4f91] text-white text-xs font-semibold rounded-lg"
        >
          Return to Fees
        </button>
      </div>
    );
  }

  // ==========================================
  // SCR-04: Select Payment Method
  // ==========================================
  if (route.path === '/fees/pay') {
    const handleContinueToReview = () => {
      if (selectedMethod === 'SPLIT') {
        const validation = PaymentService.validateSplit(
          targetInvoice,
          eaAccount,
          customEaCents,
          computedOnlineCents
        );
        if (!validation.valid) {
          setSplitError(validation.error || MSG.SPLIT_AMOUNT_INVALID);
          return;
        }
      }
      setSplitError(null);
      navigate('/fees/review', {
        invoiceId: targetInvoice.id,
        studentId: targetStudent.id,
      });
    };

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/fees', { studentId: targetStudent.id })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fees</span>
        </button>

        {/* Invoice Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs text-slate-500 font-mono">Step 1 of 2: Method Selection</span>
              <h1 className="text-xl font-extrabold text-slate-900">{targetInvoice.invoiceNumber}</h1>
              <p className="text-xs text-slate-600">Student: {targetStudent.fullName} &bull; {targetInvoice.schoolName}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Amount</span>
              <div className="text-2xl font-black text-[#1d4f91]">{formatSGD(targetInvoice.netCents)}</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Due Date: <strong>{formatDateDDMMYYYY(targetInvoice.dueDate)}</strong></span>
            <span>Items: {targetInvoice.items.length} charge(s)</span>
          </div>
        </div>

        {/* Method Choices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Choose Payment Method
          </h2>

          <div className="space-y-3">
            {/* Option 1: EA Balance */}
            <div
              onClick={() => methods?.eaAllowed && setSelectedMethod('EA')}
              className={`p-4 rounded-xl border transition-all ${
                !methods?.eaAllowed
                  ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  : selectedMethod === 'EA'
                  ? 'border-[#1d4f91] bg-blue-50/50 ring-2 ring-[#1d4f91]/20 cursor-pointer'
                  : 'border-slate-200 hover:border-slate-300 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="method"
                    disabled={!methods?.eaAllowed}
                    checked={selectedMethod === 'EA'}
                    onChange={() => setSelectedMethod('EA')}
                    className="w-4 h-4 text-[#1d4f91]"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#1d4f91]" />
                      <span>Education Account Balance</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay fully from student's available government Edusave / Education Account funds.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {eaAccount ? formatSGD(eaAccount.balanceCents) : 'SGD 0.00'}
                  </span>
                  <div className="text-[10px] text-slate-400">Available</div>
                </div>
              </div>
              {!methods?.eaAllowed && (
                <div className="mt-2 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded">
                  {methods?.eaReason}
                </div>
              )}
            </div>

            {/* Option 2: Online Payment */}
            <div
              onClick={() => methods?.onlineAllowed && setSelectedMethod('ONLINE')}
              className={`p-4 rounded-xl border transition-all ${
                !methods?.onlineAllowed
                  ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  : selectedMethod === 'ONLINE'
                  ? 'border-[#1d4f91] bg-blue-50/50 ring-2 ring-[#1d4f91]/20 cursor-pointer'
                  : 'border-slate-200 hover:border-slate-300 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="method"
                    disabled={!methods?.onlineAllowed}
                    checked={selectedMethod === 'ONLINE'}
                    onChange={() => setSelectedMethod('ONLINE')}
                    className="w-4 h-4 text-[#1d4f91]"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Online Payment (PayNow / Credit Card)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay online via Singapore PayNow QR or credit/debit card gateway.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {formatSGD(targetInvoice.netCents)}
                </span>
              </div>
            </div>

            {/* Option 3: Split Payment (EA + Online) */}
            {methods?.splitAllowed && (
              <div
                onClick={() => setSelectedMethod('SPLIT')}
                className={`p-4 rounded-xl border transition-all ${
                  selectedMethod === 'SPLIT'
                    ? 'border-[#1d4f91] bg-blue-50/50 ring-2 ring-[#1d4f91]/20 cursor-pointer'
                    : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="method"
                      checked={selectedMethod === 'SPLIT'}
                      onChange={() => setSelectedMethod('SPLIT')}
                      className="w-4 h-4 text-[#1d4f91]"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          &frac12;
                        </span>
                        <span>Split Payment (EA Balance + Online Gateway)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Combine available EA balance with online payment for the remainder.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Split Configuration Box */}
                {selectedMethod === 'SPLIT' && (
                  <div className="mt-4 pt-4 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Deduct from EA (SGD):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={(eaAccount?.balanceCents || 0) / 100}
                        value={(customEaCents / 100).toFixed(2)}
                        onChange={(e) => handleEaPortionChange(e.target.value)}
                        className={`w-full text-sm font-mono p-2 border rounded-lg bg-white focus:outline-none ${
                          splitError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                        }`}
                      />
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Max available: {formatSGD(eaAccount?.balanceCents || 0)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Remaining via Online (SGD):
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formatSGD(computedOnlineCents)}
                        className="w-full text-sm font-mono p-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-700 cursor-not-allowed"
                      />
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Calculated automatically
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {splitError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{splitError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/fees', { studentId: targetStudent.id })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleContinueToReview}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCR-05: Review and Confirm Payment
  // ==========================================
  if (route.path === '/fees/review') {
    const plan: PaymentPlan = {
      method: selectedMethod,
      eaCents: selectedMethod === 'EA' ? targetInvoice.netCents : selectedMethod === 'SPLIT' ? customEaCents : 0,
      onlineCents: selectedMethod === 'ONLINE' ? targetInvoice.netCents : selectedMethod === 'SPLIT' ? computedOnlineCents : 0,
    };

    const estRemainingBalanceCents = Math.max(0, (eaAccount?.balanceCents || 0) - plan.eaCents);

    const handleConfirm = () => {
      if (isSubmitting) return; // Prevent double click (BR-F9-04)
      setIsSubmitting(true);
      setConfirmError(null);

      const res = confirmPaymentAction(targetInvoice.id, plan, idempotencyKey);

      if (!res.success) {
        setIsSubmitting(false);
        setConfirmError(res.error || MSG.SYSTEM_ERROR);
        return;
      }

      // If redirect to sandbox requested (Online or Split)
      if (res.redirectSandboxUrl) {
        navigate('/sandbox', {
          sandboxSessionId: res.transaction?.legs.find((l) => l.method === 'OnlineGateway')?.fundingReference,
          txnId: res.transaction?.id,
          invoiceId: targetInvoice.id,
        });
        return;
      }

      // EA only succeeded directly
      if (res.transaction?.status === 'Succeeded') {
        navigate('/pay/receipt', {
          txnId: res.transaction.id,
          invoiceId: targetInvoice.id,
        });
      } else {
        navigate('/pay/failed', {
          txnId: res.transaction?.id,
          invoiceId: targetInvoice.id,
        });
      }
    };

    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/fees/pay', { invoiceId: targetInvoice.id })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Payment Method</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <span className="text-xs text-slate-500 font-mono">Step 2 of 2: Review & Authorize</span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">Confirm Payment</h1>
            <p className="text-xs text-slate-500">Please review invoice charges and payment breakdown before confirming.</p>
          </div>

          {/* Breakdown Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-900">{targetStudent.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-mono font-bold text-slate-900">{targetInvoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">School:</span>
              <span className="text-slate-800">{targetInvoice.schoolName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-900">Total Amount to Pay:</span>
              <span className="font-mono font-black text-slate-900">{formatSGD(targetInvoice.netCents)}</span>
            </div>
          </div>

          {/* Payment Legs Breakdown */}
          <div className="space-y-3 mb-6 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Payment Breakdown
            </h3>

            {plan.eaCents > 0 && (
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#1d4f91]" />
                    <span>Education Account Deduction</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                    Estimated balance after: {formatSGD(estRemainingBalanceCents)} (reference only)
                  </div>
                </div>
                <div className="font-mono font-bold text-blue-900 text-sm">
                  {formatSGD(plan.eaCents)}
                </div>
              </div>
            )}

            {plan.onlineCents > 0 && (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Online Gateway (PayNow / Credit Card)</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    You will be directed to the payment sandbox
                  </div>
                </div>
                <div className="font-mono font-bold text-emerald-900 text-sm">
                  {formatSGD(plan.onlineCents)}
                </div>
              </div>
            )}
          </div>

          {confirmError && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{confirmError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/fees/pay', { invoiceId: targetInvoice.id })}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Pay {formatSGD(targetInvoice.netCents)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCR-06: Pending / Verifying Status Screen
  // ==========================================
  if (route.path === '/pay/status') {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">Payment In Progress</h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
            {targetTx?.status === 'ReconciliationRequired'
              ? 'Your payment is being verified with the bank gateway. Please check back shortly.'
              : MSG.PAYMENT_PENDING}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-slate-900">{targetTx?.transactionReference || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-mono text-slate-800">{targetInvoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-mono font-bold text-slate-900">{formatSGD(targetInvoice.netCents)}</span>
            </div>
            {targetTx?.legs.some((l) => l.method === 'EducationAccount' && l.status === 'Succeeded') && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-blue-900">
                Notice: EA portion was successfully debited. Waiting for online gateway settlement.
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/fees', { studentId: targetStudent.id })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Back to Fees
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCR-07: Payment Receipt (AC-13)
  // ==========================================
  if (route.path === '/pay/receipt') {
    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4 no-print">
          <button
            onClick={() => navigate('/fees', { studentId: targetStudent.id })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fees</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Printable Official Receipt */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 printable-card text-slate-900">
          {/* Official Gov Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 bg-[#1d4f91] text-white text-xs font-bold rounded flex items-center justify-center">
                  MOE
                </span>
                <span className="text-xl font-bold tracking-tight text-[#1d4f91]">
                  MINISTRY OF EDUCATION SINGAPORE
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Official Electronic Payment Receipt
              </h1>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Succeeded</span>
              </span>
            </div>
          </div>

          {/* Receipt Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500">Transaction Reference:</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {targetTx?.transactionReference || 'PAY-20261014-001'}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Paid At (Singapore Time):</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour12: false })}{' '}
                SGT, {formatDateDDMMYYYY(today)}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Invoice Number:</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {targetInvoice.invoiceNumber}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Student:</span>
              <div className="font-bold text-slate-900 mt-0.5">{targetStudent.fullName}</div>
              <div className="text-[11px] text-slate-500 font-mono">{targetStudent.nric}</div>
            </div>
            <div>
              <span className="text-slate-500">School:</span>
              <div className="font-bold text-slate-900 mt-0.5">{targetInvoice.schoolName}</div>
            </div>
            <div>
              <span className="text-slate-500">Payer:</span>
              <div className="font-bold text-slate-900 mt-0.5">{currentParent?.fullName}</div>
            </div>
          </div>

          {/* Itemised Fee Breakdown */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fee Items
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-2">Description</th>
                  <th className="py-2">Fee Type</th>
                  <th className="py-2 text-right">Gross</th>
                  <th className="py-2 text-right">Subsidy</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-medium">{item.description}</td>
                    <td className="py-2.5 text-slate-500">{item.feeType}</td>
                    <td className="py-2.5 text-right font-mono">{formatSGD(item.grossCents)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">SGD 0.00</td>
                    <td className="py-2.5 text-right font-mono font-bold">{formatSGD(item.netCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Legs Settlement Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Funding Settlement Breakdown
            </div>
            {targetTx?.legs.map((leg) => (
              <div key={leg.id} className="flex justify-between items-center text-slate-700">
                <div>
                  <span className="font-semibold">
                    {leg.method === 'EducationAccount' ? 'Education Account' : 'Online Payment (Sandbox)'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    Ref: {leg.fundingReference}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">{formatSGD(leg.settledCents)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Settled:</span>
              <span className="font-mono">{formatSGD(targetInvoice.netCents)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span>Official Government Receipt &bull; Tax Invoice (Inclusive of 9% GST)</span>
            <span className="font-mono">STATUS: SETTLED</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCR-08: Payment Failed / Cancelled Screen
  // ==========================================
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Not Completed</h1>

        {/* Notice if EA portion was reversed */}
        {targetTx?.legs.some((l) => l.status === 'Reversed') ? (
          <p className="text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-200 max-w-sm mx-auto mb-6 leading-relaxed">
            {MSG.PAYMENT_FAILED_EA_RETURNED}
          </p>
        ) : (
          <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
            {MSG.PAYMENT_FAILED}
          </p>
        )}

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction Reference:</span>
            <span className="font-mono font-bold text-slate-900">{targetTx?.transactionReference || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice:</span>
            <span className="font-mono text-slate-800">{targetInvoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount:</span>
            <span className="font-mono font-bold text-slate-900">{formatSGD(targetInvoice.netCents)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/fees', { studentId: targetStudent.id })}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Exit to Fees
          </button>
          <button
            onClick={() => navigate('/fees/pay', { invoiceId: targetInvoice.id })}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
