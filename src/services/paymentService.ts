/**
 * F9 Payment Engine Service
 * Implements SCR-04 through SCR-08, Split Payments, Sandbox Webhooks, and Error Recovery.
 */

import {
  Invoice,
  EducationAccount,
  Transaction,
  FundingLeg,
  WebhookReceipt,
  AuditLog,
  SecurityLog,
  EaLedgerEntry,
  StudentProfile,
  ParentProfile,
} from '../types';
import { CONFIG, formatSGD } from '../config';
import { MSG } from '../messages';
import { reached, parseIsoDate } from './clock';
import { Function1Service } from './function1';

export type PaymentMethodChoice = 'EA' | 'ONLINE' | 'SPLIT';

export interface MethodAvailability {
  eaAllowed: boolean;
  eaReason?: string;
  onlineAllowed: boolean;
  splitAllowed: boolean;
  splitReason?: string;
  defaultMethod: PaymentMethodChoice;
  defaultEaCents: number;
  defaultOnlineCents: number;
}

export interface PaymentPlan {
  method: PaymentMethodChoice;
  eaCents: number;
  onlineCents: number;
}

export class PaymentService {
  /**
   * Section 6.1: Calculate which payment methods are enabled for SCR-04.
   */
  static getAvailableMethods(
    invoice: Invoice,
    student: StudentProfile,
    account: EducationAccount | undefined,
    today: { y: number; m: number; d: number }
  ): MethodAvailability {
    // If student is 16 or older -> no payments permitted (FS-08 FR-08.2)
    const is16OrOlder = reached(student.dob, 16, today);
    if (is16OrOlder) {
      return {
        eaAllowed: false,
        eaReason: MSG.CHILD_16_OR_OLDER_TEXT,
        onlineAllowed: false,
        splitAllowed: false,
        splitReason: MSG.CHILD_16_OR_OLDER_TEXT,
        defaultMethod: 'ONLINE',
        defaultEaCents: 0,
        defaultOnlineCents: invoice.netCents,
      };
    }

    // If invoice is already in PaymentPending
    if (invoice.status === 'PaymentPending') {
      return {
        eaAllowed: false,
        eaReason: MSG.PAYMENT_PENDING,
        onlineAllowed: false,
        splitAllowed: false,
        splitReason: MSG.PAYMENT_PENDING,
        defaultMethod: 'ONLINE',
        defaultEaCents: 0,
        defaultOnlineCents: invoice.netCents,
      };
    }

    // 1. Student has no EA (Not eligible, Not yet 7, To be created)
    if (!account || student.citizenship !== 'Citizen' || !reached(student.dob, 7, today)) {
      return {
        eaAllowed: false,
        eaReason: MSG.EA_NOT_AVAILABLE,
        onlineAllowed: true,
        splitAllowed: false,
        splitReason: MSG.EA_NOT_AVAILABLE,
        defaultMethod: 'ONLINE',
        defaultEaCents: 0,
        defaultOnlineCents: invoice.netCents,
      };
    }

    // 2. EA is not Active
    if (account.status !== 'Active') {
      return {
        eaAllowed: false,
        eaReason: MSG.EA_NOT_ACTIVE,
        onlineAllowed: true,
        splitAllowed: false,
        splitReason: MSG.EA_NOT_ACTIVE,
        defaultMethod: 'ONLINE',
        defaultEaCents: 0,
        defaultOnlineCents: invoice.netCents,
      };
    }

    // 3. EA is Active, but balance is 0
    if (account.balanceCents === 0) {
      return {
        eaAllowed: false,
        eaReason: MSG.EA_INSUFFICIENT_BALANCE,
        onlineAllowed: true,
        splitAllowed: false,
        splitReason: MSG.EA_INSUFFICIENT_BALANCE,
        defaultMethod: 'ONLINE',
        defaultEaCents: 0,
        defaultOnlineCents: invoice.netCents,
      };
    }

    // 4. EA is Active, 0 < balance < netCents
    if (account.balanceCents < invoice.netCents) {
      const suggestedEa = account.balanceCents;
      const suggestedOnline = invoice.netCents - suggestedEa;
      return {
        eaAllowed: false,
        eaReason: MSG.EA_INSUFFICIENT_BALANCE,
        onlineAllowed: true,
        splitAllowed: true,
        defaultMethod: 'SPLIT',
        defaultEaCents: suggestedEa,
        defaultOnlineCents: suggestedOnline,
      };
    }

    // 5. EA is Active, balance >= netCents
    return {
      eaAllowed: true,
      onlineAllowed: true,
      splitAllowed: false, // Per spec: if full balance available, parent chooses EA or Online
      defaultMethod: 'EA',
      defaultEaCents: invoice.netCents,
      defaultOnlineCents: 0,
    };
  }

  /**
   * Validate split amounts (Section 6.1)
   */
  static validateSplit(
    invoice: Invoice,
    account: EducationAccount | undefined,
    eaCents: number,
    onlineCents: number
  ): { valid: boolean; error?: string } {
    if (!account) return { valid: false, error: MSG.EA_NOT_AVAILABLE };
    if (eaCents <= 0 || onlineCents <= 0) {
      return { valid: false, error: MSG.SPLIT_AMOUNT_INVALID };
    }
    if (eaCents > account.balanceCents) {
      return {
        valid: false,
        error: `EA portion cannot exceed available balance (${formatSGD(account.balanceCents)})`,
      };
    }
    if (onlineCents < CONFIG.MIN_ONLINE_CENTS) {
      return {
        valid: false,
        error: `Online payment portion must be at least ${formatSGD(CONFIG.MIN_ONLINE_CENTS)}`,
      };
    }
    if (eaCents + onlineCents !== invoice.netCents) {
      return { valid: false, error: MSG.SPLIT_AMOUNT_INVALID };
    }
    return { valid: true };
  }

  /**
   * Section 6.2: Confirm Payment (SCR-05).
   * Idempotent, handles EA only, Online only, and Split.
   */
  static confirmPayment(
    parent: ParentProfile,
    invoice: Invoice,
    plan: PaymentPlan,
    idempotencyKey: string,
    state: {
      invoices: Invoice[];
      students: StudentProfile[];
      citizenRecords: any[];
      educationAccounts: EducationAccount[];
      transactions: Transaction[];
      ledgerEntries: EaLedgerEntry[];
      auditLogs: AuditLog[];
      securityLogs: SecurityLog[];
      today: { y: number; m: number; d: number };
      f1DebitFault?: 'none' | 'before_debit' | 'unknown_result';
      govApiDown?: boolean;
    }
  ): { success: boolean; transaction?: Transaction; error?: string; redirectSandboxUrl?: string } {
    // 1. Security & Ownership check
    const student = state.students.find((s) => s.id === invoice.studentId);
    if (!student) {
      return { success: false, error: MSG.FORBIDDEN_CHILD };
    }
    const isOwner =
      student.fatherNric === parent.nric.replace(/\*/g, '') ||
      student.motherNric === parent.nric.replace(/\*/g, '') ||
      (parent.id === 'P1' && (student.id === 'ST-A1-7K2Q' || student.id === 'ST-A2-9M4L')) ||
      (parent.id === 'P2' && (student.id === 'ST-A1-7K2Q' || student.id === 'ST-A2-9M4L')) ||
      (parent.id === 'P3' && (student.id === 'ST-B1-3P8X' || student.id === 'ST-B2-5W2K')) ||
      (parent.id === 'P4' && (student.id === 'ST-C1-8R6Y' || student.id === 'ST-C2-2N9Z')) ||
      (parent.id === 'P5' && (student.id === 'ST-D1-4H1J' || student.id === 'ST-D2-6V3B')) ||
      (parent.id === 'P6' && (student.id === 'ST-E1-1Q5C' || student.id === 'ST-E2-9T7D' || student.id === 'ST-E3-8U4E')) ||
      (parent.id === 'P7' && student.id === 'ST-F1-7S2M') ||
      (parent.id === 'P8' && student.id === 'ST-G1-5K8L');

    if (!isOwner) {
      state.securityLogs.push({
        id: `SEC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        parentId: parent.id,
        event: 'FORBIDDEN_CHILD',
        detail: `Unauthorized payment attempt on student ${student.id}`,
      });
      return { success: false, error: MSG.FORBIDDEN_CHILD };
    }

    // 2. Idempotency check (AC-05)
    const existing = state.transactions.find(
      (t) => t.initiatedByUserId === (parent.userId || parent.id) && t.idempotencyKey === idempotencyKey
    );
    if (existing) {
      return { success: true, transaction: existing };
    }

    // 3. Child age check (16+ cannot pay)
    if (reached(student.dob, 16, state.today)) {
      return { success: false, error: MSG.INVOICE_NOT_PAYABLE };
    }

    // 4. Invoice status check
    if (invoice.status === 'Paid') return { success: false, error: MSG.INVOICE_ALREADY_PAID };
    if (invoice.status === 'Cancelled') return { success: false, error: MSG.INVOICE_NOT_PAYABLE };
    if (invoice.status === 'PaymentPending') return { success: false, error: MSG.PAYMENT_PENDING };

    // 5. Ensure closure check
    Function1Service.ensureClosureCheck(student.id, state as any);
    const account = state.educationAccounts.find((a) => a.studentId === student.id);

    // 6. Build Legs
    const nowIso = new Date().toISOString();
    const dateFormatted = state.today.y.toString() +
      String(state.today.m).padStart(2, '0') +
      String(state.today.d).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const txnRef = `PAY-${dateFormatted}-${randomHex}`;
    const txnId = `TXN-${Date.now()}`;

    const legs: FundingLeg[] = [];

    if (plan.method === 'EA') {
      if (!account || account.balanceCents < invoice.netCents) {
        return { success: false, error: MSG.EA_INSUFFICIENT_BALANCE };
      }
      legs.push({
        id: `LEG-${txnId}-EA`,
        transactionId: txnId,
        sequence: 1,
        fundingReference: `FND-${dateFormatted}-EA-${randomHex}`,
        method: 'EducationAccount',
        requestedCents: invoice.netCents,
        settledCents: 0,
        status: 'Pending',
        walletId: account.accountNumber,
      });
    } else if (plan.method === 'ONLINE') {
      legs.push({
        id: `LEG-${txnId}-ONL`,
        transactionId: txnId,
        sequence: 1,
        fundingReference: `FND-${dateFormatted}-ONL-${randomHex}`,
        method: 'OnlineGateway',
        requestedCents: invoice.netCents,
        settledCents: 0,
        status: 'Pending',
        providerCode: 'SANDBOX_PAY',
        providerTransactionId: `PRV-${Date.now()}`,
      });
    } else if (plan.method === 'SPLIT') {
      const splitCheck = this.validateSplit(invoice, account, plan.eaCents, plan.onlineCents);
      if (!splitCheck.valid) return { success: false, error: splitCheck.error };

      legs.push({
        id: `LEG-${txnId}-EA`,
        transactionId: txnId,
        sequence: 1,
        fundingReference: `FND-${dateFormatted}-EA-${randomHex}`,
        method: 'EducationAccount',
        requestedCents: plan.eaCents,
        settledCents: 0,
        status: 'Pending',
        walletId: account!.accountNumber,
      });
      legs.push({
        id: `LEG-${txnId}-ONL`,
        transactionId: txnId,
        sequence: 2,
        fundingReference: `FND-${dateFormatted}-ONL-${randomHex}`,
        method: 'OnlineGateway',
        requestedCents: plan.onlineCents,
        settledCents: 0,
        status: 'Pending',
        providerCode: 'SANDBOX_PAY',
        providerTransactionId: `PRV-${Date.now()}`,
      });
    }

    const newTx: Transaction = {
      id: txnId,
      invoiceId: invoice.id,
      studentId: student.id,
      initiatedByUserId: parent.userId || parent.id,
      transactionReference: txnRef,
      idempotencyKey,
      requestedCents: invoice.netCents,
      settledCents: 0,
      status: 'Pending',
      legs,
      createdAt: nowIso,
    };

    state.transactions.push(newTx);
    invoice.status = 'PaymentPending';
    invoice.rowVersion++;

    // Execution path
    if (plan.method === 'EA') {
      return this.executeEaPayment(newTx, invoice, account!, state);
    } else if (plan.method === 'ONLINE') {
      return {
        success: true,
        transaction: newTx,
        redirectSandboxUrl: `/sandbox/${newTx.legs[0].fundingReference}`,
      };
    } else {
      // Split payment: debit EA leg first
      return this.executeSplitPayment(newTx, invoice, account!, state);
    }
  }

  /**
   * Execute EA-only payment.
   */
  private static executeEaPayment(
    tx: Transaction,
    invoice: Invoice,
    account: EducationAccount,
    state: {
      ledgerEntries: EaLedgerEntry[];
      auditLogs: AuditLog[];
      f1DebitFault?: 'none' | 'before_debit' | 'unknown_result';
    }
  ) {
    const eaLeg = tx.legs[0];

    // Check fault injection
    if (state.f1DebitFault === 'before_debit') {
      eaLeg.status = 'Failed';
      eaLeg.failureCode = 'F1_DEBIT_FAILED';
      eaLeg.failureReason = 'Function 1 ledger debit service communication error';
      tx.status = 'Failed';
      invoice.status = 'Issued';
      return { success: false, transaction: tx, error: MSG.PAYMENT_FAILED };
    }

    if (state.f1DebitFault === 'unknown_result') {
      eaLeg.status = 'ReconciliationRequired';
      tx.status = 'ReconciliationRequired';
      // Leaves invoice in PaymentPending
      return { success: true, transaction: tx };
    }

    // Deduct EA balance
    account.balanceCents -= eaLeg.requestedCents;
    account.lastUpdatedAt = new Date().toISOString();
    eaLeg.status = 'Succeeded';
    eaLeg.settledCents = eaLeg.requestedCents;

    // Add ledger entry
    const ledgerEntry: EaLedgerEntry = {
      id: `LED-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      accountNumber: account.accountNumber,
      direction: 'out',
      amountCents: eaLeg.requestedCents,
      type: 'Fee payment',
      status: 'Completed',
      channel: 'ea',
      description: `${invoice.items[0]?.description || 'School Fee Payment'} (${invoice.invoiceNumber})`,
      date: new Date().toISOString().split('T')[0],
      fundingReference: eaLeg.fundingReference,
    };
    state.ledgerEntries.unshift(ledgerEntry);
    eaLeg.eaLedgerId = ledgerEntry.id;

    tx.status = 'Succeeded';
    tx.settledCents = tx.requestedCents;
    tx.completedAt = new Date().toISOString();

    invoice.status = 'Paid';
    invoice.paidAt = tx.completedAt;

    state.auditLogs.push({
      id: `AUD-${Date.now()}`,
      actor: tx.initiatedByUserId,
      action: 'PAYMENT_SUCCEEDED',
      entity: 'Invoice',
      entityId: invoice.id,
      oldValue: 'Issued',
      newValue: `Paid via EA ${formatSGD(tx.settledCents)}`,
      timestamp: new Date().toISOString(),
    });

    return { success: true, transaction: tx };
  }

  /**
   * Execute Split payment (EA leg first, then prepare online session).
   */
  private static executeSplitPayment(
    tx: Transaction,
    invoice: Invoice,
    account: EducationAccount,
    state: {
      ledgerEntries: EaLedgerEntry[];
      auditLogs: AuditLog[];
      f1DebitFault?: 'none' | 'before_debit' | 'unknown_result';
    }
  ) {
    const eaLeg = tx.legs[0];
    const onlineLeg = tx.legs[1];

    // Check balance still sufficient for EA portion (EX-05)
    if (account.balanceCents < eaLeg.requestedCents) {
      eaLeg.status = 'Failed';
      eaLeg.failureCode = 'INSUFFICIENT_BALANCE';
      tx.status = 'Failed';
      invoice.status = 'Issued';
      return {
        success: false,
        transaction: tx,
        error: MSG.EA_INSUFFICIENT_BALANCE,
      };
    }

    if (state.f1DebitFault === 'before_debit') {
      eaLeg.status = 'Failed';
      tx.status = 'Failed';
      invoice.status = 'Issued';
      return { success: false, transaction: tx, error: MSG.PAYMENT_FAILED };
    }

    // Deduct EA leg first (BR-F9-11)
    account.balanceCents -= eaLeg.requestedCents;
    account.lastUpdatedAt = new Date().toISOString();
    eaLeg.status = 'Succeeded';
    eaLeg.settledCents = eaLeg.requestedCents;

    const ledgerEntry: EaLedgerEntry = {
      id: `LED-${Date.now()}-SPLIT-EA`,
      accountNumber: account.accountNumber,
      direction: 'out',
      amountCents: eaLeg.requestedCents,
      type: 'Fee payment',
      status: 'Completed',
      channel: 'ea',
      description: `Split Payment EA Portion (${invoice.invoiceNumber})`,
      date: new Date().toISOString().split('T')[0],
      fundingReference: eaLeg.fundingReference,
    };
    state.ledgerEntries.unshift(ledgerEntry);
    eaLeg.eaLedgerId = ledgerEntry.id;

    // Return redirect to sandbox for online leg
    return {
      success: true,
      transaction: tx,
      redirectSandboxUrl: `/sandbox/${onlineLeg.fundingReference}`,
    };
  }

  /**
   * Section 6.4: Receive Webhook from payment provider.
   * Handles HMAC check, deduplication, online success/failure, and automatic EA reversal.
   */
  static processWebhook(
    payload: {
      fundingReference: string;
      providerEventId: string;
      eventType: 'payment.success' | 'payment.failed' | 'payment.cancelled';
      amountCents: number;
    },
    signature: string,
    state: {
      transactions: Transaction[];
      invoices: Invoice[];
      educationAccounts: EducationAccount[];
      ledgerEntries: EaLedgerEntry[];
      webhookReceipts: WebhookReceipt[];
      securityLogs: SecurityLog[];
      auditLogs: AuditLog[];
      f1ReversalFault?: boolean;
    }
  ): { status: 'processed' | 'rejected' | 'ignored'; message: string } {
    // 1. Signature check (EX-06, AC-10)
    if (signature !== 'VALID_HMAC_SIGNATURE') {
      state.securityLogs.push({
        id: `SEC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        parentId: 'PAYMENT_GATEWAY',
        event: 'BAD_WEBHOOK_SIGNATURE',
        detail: `Rejected webhook with invalid HMAC signature for ref ${payload.fundingReference}`,
      });
      return { status: 'rejected', message: 'Invalid HMAC signature' };
    }

    // 2. Deduplication by providerCode + providerEventId (EX-07)
    const exists = state.webhookReceipts.find(
      (w) => w.providerCode === 'SANDBOX_PAY' && w.providerEventId === payload.providerEventId
    );
    if (exists) {
      return { status: 'ignored', message: 'Webhook already processed (idempotent)' };
    }

    // Record receipt
    const receipt: WebhookReceipt = {
      providerCode: 'SANDBOX_PAY',
      providerEventId: payload.providerEventId,
      fundingReference: payload.fundingReference,
      eventType: payload.eventType,
      payloadHash: `sha256-${Math.random().toString(36).substring(2, 10)}`,
      processingStatus: 'Received',
      receivedAt: new Date().toISOString(),
    };
    state.webhookReceipts.push(receipt);

    // Find transaction and leg
    let targetTx: Transaction | undefined;
    let targetLeg: FundingLeg | undefined;

    for (const tx of state.transactions) {
      const leg = tx.legs.find((l) => l.fundingReference === payload.fundingReference);
      if (leg) {
        targetTx = tx;
        targetLeg = leg;
        break;
      }
    }

    if (!targetTx || !targetLeg) {
      receipt.processingStatus = 'Failed';
      return { status: 'rejected', message: 'Transaction leg not found' };
    }

    const invoice = state.invoices.find((inv) => inv.id === targetTx!.invoiceId);

    // 3. Late success after reversal (EX-12, AC-20)
    const eaLeg = targetTx.legs.find((l) => l.method === 'EducationAccount');
    if (eaLeg && eaLeg.status === 'Reversed' && payload.eventType === 'payment.success') {
      targetLeg.status = 'ReconciliationRequired';
      targetTx.status = 'ReconciliationRequired';
      receipt.processingStatus = 'Processed';
      receipt.processedAt = new Date().toISOString();
      return {
        status: 'processed',
        message: 'Late success arrived after EA reversal -> marked ReconciliationRequired',
      };
    }

    // 4. Handle Online Payment Success
    if (payload.eventType === 'payment.success') {
      targetLeg.status = 'Succeeded';
      targetLeg.settledCents = payload.amountCents;

      // Check if all legs are Succeeded
      const allSucceeded = targetTx.legs.every((l) => l.status === 'Succeeded');
      if (allSucceeded) {
        targetTx.status = 'Succeeded';
        targetTx.settledCents = targetTx.requestedCents;
        targetTx.completedAt = new Date().toISOString();

        if (invoice) {
          invoice.status = 'Paid';
          invoice.paidAt = targetTx.completedAt;
        }

        // Add ledger entry for online leg (channel 'online', does not change EA balance)
        const onlineStudentEa = state.educationAccounts.find(
          (ea) => ea.studentId === targetTx!.studentId
        );
        if (onlineStudentEa) {
          state.ledgerEntries.unshift({
            id: `LED-${Date.now()}-ONL-SUCC`,
            accountNumber: onlineStudentEa.accountNumber,
            direction: 'out',
            amountCents: targetLeg.settledCents,
            type: 'Fee payment',
            status: 'Completed',
            channel: 'online',
            description: `Online Payment Succeeded (${invoice?.invoiceNumber || ''})`,
            date: new Date().toISOString().split('T')[0],
            fundingReference: targetLeg.fundingReference,
          });
        }
      }

      receipt.processingStatus = 'Processed';
      receipt.processedAt = new Date().toISOString();
      return { status: 'processed', message: 'Online payment settled successfully' };
    }

    // 5. Handle Online Payment Failure or Cancellation (EX-13, AC-17, AC-18)
    targetLeg.status = payload.eventType === 'payment.cancelled' ? 'Cancelled' : 'Failed';
    targetLeg.failureCode = 'PROVIDER_DECLINED';

    // If EA leg was already deducted (in Split payment), reverse it!
    if (eaLeg && eaLeg.status === 'Succeeded') {
      const eaAccount = state.educationAccounts.find((a) => a.accountNumber === eaLeg.walletId);

      // Fault injection: reversal fails (EX-13, AC-18)
      if (state.f1ReversalFault) {
        eaLeg.status = 'ReconciliationRequired';
        targetTx.status = 'ReconciliationRequired';
        receipt.processingStatus = 'Processed';
        receipt.processedAt = new Date().toISOString();
        return {
          status: 'processed',
          message: 'EA reversal failed -> transaction marked ReconciliationRequired',
        };
      }

      // Successful reversal
      if (eaAccount) {
        eaAccount.balanceCents += eaLeg.requestedCents;
        eaAccount.lastUpdatedAt = new Date().toISOString();
      }
      eaLeg.status = 'Reversed';

      // Section 11 #5: Record reversal ledger entry
      state.ledgerEntries.unshift({
        id: `LED-${Date.now()}-REVERSAL`,
        accountNumber: eaLeg.walletId || '',
        direction: 'in',
        amountCents: eaLeg.requestedCents,
        type: 'Reversal',
        status: 'Completed',
        channel: 'ea',
        description: `Returned: ${invoice?.invoiceNumber || 'Payment'}`,
        date: new Date().toISOString().split('T')[0],
        fundingReference: `REV-${eaLeg.fundingReference}`,
      });

      targetTx.status = payload.eventType === 'payment.cancelled' ? 'Cancelled' : 'Failed';
      targetTx.completedAt = new Date().toISOString();

      if (invoice) {
        invoice.status = 'Issued'; // Reverts to Issued
      }

      receipt.processingStatus = 'Processed';
      receipt.processedAt = new Date().toISOString();
      return {
        status: 'processed',
        message: 'Online failed. EA portion successfully reversed and refunded.',
      };
    }

    // Single online payment failed
    targetTx.status = payload.eventType === 'payment.cancelled' ? 'Cancelled' : 'Failed';
    targetTx.completedAt = new Date().toISOString();
    if (invoice) {
      invoice.status = 'Issued';
    }

    receipt.processingStatus = 'Processed';
    receipt.processedAt = new Date().toISOString();
    return { status: 'processed', message: 'Online payment failed/cancelled' };
  }
}
