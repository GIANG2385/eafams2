/**
 * Payment Provider Sandbox Simulator (/sandbox/:sessionId, Section 6.4, F9 DA-01)
 * Simulates PayNow / Credit Card gateway with configurable outcomes, webhooks, and fault injection.
 */

import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { formatSGD } from '../config';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  X,
  Bug,
} from 'lucide-react';

export const SandboxModal: React.FC = () => {
  const {
    route,
    navigate,
    transactions,
    invoices,
    processWebhookAction,
    prototypeTools,
  } = usePortal();

  // Find transaction and leg by fundingReference (sandboxSessionId)
  const targetTx = transactions.find((t) =>
    t.legs.some((l) => l.fundingReference === route.sandboxSessionId)
  );
  const targetLeg = targetTx?.legs.find((l) => l.fundingReference === route.sandboxSessionId);
  const targetInvoice = invoices.find((inv) => inv.id === targetTx?.invoiceId);

  const [tamperSignature, setTamperSignature] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!targetTx || !targetLeg || !targetInvoice) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-2">Sandbox Session Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested payment gateway session ({route.sandboxSessionId}) is invalid or expired.
        </p>
        <button
          onClick={() => navigate('/fees')}
          className="px-4 py-2 bg-[#1d4f91] text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Return to Fees
        </button>
      </div>
    );
  }

  const handleSimulateResult = (eventType: 'payment.success' | 'payment.failed' | 'payment.cancelled') => {
    setIsProcessing(true);
    setFeedback(`Dispatching webhook event: ${eventType}...`);

    setTimeout(() => {
      const payload = {
        fundingReference: targetLeg.fundingReference,
        providerEventId: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventType,
        amountCents: targetLeg.requestedCents,
      };

      const signature = tamperSignature ? 'CORRUPT_TAMPERED_HMAC' : 'VALID_HMAC_SIGNATURE';
      const result = processWebhookAction(payload, signature);

      setIsProcessing(false);

      if (result.status === 'rejected') {
        setFeedback(`Webhook Rejected by Portal: ${result.message}`);
        return;
      }

      // Route based on outcome
      if (eventType === 'payment.success') {
        navigate('/pay/receipt', {
          txnId: targetTx.id,
          invoiceId: targetInvoice.id,
        });
      } else {
        navigate('/pay/failed', {
          txnId: targetTx.id,
          invoiceId: targetInvoice.id,
        });
      }
    }, prototypeTools.webhookDelaySec * 1000);
  };

  const handleCloseBrowser = () => {
    // Simulates user closing checkout browser without sending webhook (EX-09)
    navigate('/pay/status', {
      txnId: targetTx.id,
      invoiceId: targetInvoice.id,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                PG
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">Singapore Payments Gateway (Sandbox)</h1>
                <p className="text-[11px] text-slate-400 font-mono">Ref: {targetLeg.fundingReference}</p>
              </div>
            </div>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Sandbox Live
            </span>
          </div>

          {/* Amount Box */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Merchant: Ministry of Education Singapore</div>
                <div className="text-xs font-semibold text-slate-800">
                  Invoice {targetInvoice.invoiceNumber} &bull; {targetInvoice.schoolName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Charge</span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {formatSGD(targetLeg.requestedCents)}
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Sandbox Provider Actions:</strong> Choose an outcome below to test how the F9 payment engine responds to webhook receipts, signatures, and automatic reversals.
              </div>
            </div>

            {/* Tamper Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-slate-800">
                  Tamper HMAC Webhook Signature (EX-06 / AC-10)
                </span>
              </div>
              <input
                type="checkbox"
                checked={tamperSignature}
                onChange={(e) => setTamperSignature(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>

            {feedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg font-mono">
                {feedback}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pay Successfully */}
              <button
                disabled={isProcessing}
                onClick={() => handleSimulateResult('payment.success')}
                className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay Successfully (Success Webhook)</span>
              </button>

              {/* Payment Fails */}
              <button
                disabled={isProcessing}
                onClick={() => handleSimulateResult('payment.failed')}
                className="p-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Payment Fails (Decline Webhook)</span>
              </button>

              {/* Cancel Payment */}
              <button
                disabled={isProcessing}
                onClick={() => handleSimulateResult('payment.cancelled')}
                className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel Payment (User Abort)</span>
              </button>

              {/* Close Browser (No result EX-09) */}
              <button
                disabled={isProcessing}
                onClick={handleCloseBrowser}
                className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Close Browser (No Webhook EX-09)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
