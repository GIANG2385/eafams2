/**
 * React Context coordinating database state, simulated clock, SingPass auth,
 * payment execution, and prototype demo tools.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ParentProfile,
  StudentProfile,
  CitizenRecord,
  EducationAccount,
  Invoice,
  Transaction,
  EaLedgerEntry,
  SyncLog,
  AuditLog,
  SecurityLog,
  WebhookReceipt,
  Session,
  PrototypeToolsState,
} from '../types';
import { createInitialSeed, selfTest } from '../store/seed';
import { parseIsoDate, formatIsoDate, addDays } from '../services/clock';
import { CONFIG } from '../config';
import { MSG } from '../messages';
import { Function1Service } from '../services/function1';
import { PaymentService, PaymentPlan } from '../services/paymentService';

export interface RouteState {
  path: string;
  studentId?: string;
  invoiceId?: string;
  txnId?: string;
  sandboxSessionId?: string;
}

interface PortalContextValue {
  // Navigation & Session
  route: RouteState;
  navigate: (to: string, params?: Partial<RouteState>) => void;
  currentParent: ParentProfile | null;
  session: Session | null;
  bannerMessage: { type: 'error' | 'warning' | 'info'; text: string; code?: string } | null;
  clearBanner: () => void;

  // Actions
  loginWithSingPass: (selection: string) => { success: boolean; message?: string };
  logout: (reason?: string) => void;
  touchActivity: () => void;

  // State access
  today: { y: number; m: number; d: number };
  todayIso: string;
  parents: ParentProfile[];
  students: StudentProfile[];
  linkedStudents: StudentProfile[];
  educationAccounts: EducationAccount[];
  invoices: Invoice[];
  transactions: Transaction[];
  ledgerEntries: EaLedgerEntry[];
  syncLogs: SyncLog[];
  auditLogs: AuditLog[];
  securityLogs: SecurityLog[];
  webhookReceipts: WebhookReceipt[];
  prototypeTools: PrototypeToolsState;
  setPrototypeTools: React.Dispatch<React.SetStateAction<PrototypeToolsState>>;

  // Helper APIs
  getStudentEa: (studentId: string) => EducationAccount | undefined;
  getStudentInvoices: (studentId: string) => Invoice[];
  confirmPaymentAction: (
    invoiceId: string,
    plan: PaymentPlan,
    idempotencyKey: string
  ) => { success: boolean; transaction?: Transaction; error?: string; redirectSandboxUrl?: string };
  processWebhookAction: (
    payload: any,
    signature: string
  ) => { status: 'processed' | 'rejected' | 'ignored'; message: string };
  updateParentDetailsAction: (
    updates: Partial<ParentProfile>
  ) => { success: boolean; errors?: Record<string, string>; message?: string };
  runDailySyncAction: () => { createdCount: number; failedCount: number; skippedCount: number; log: SyncLog };
  resetSeedAction: () => void;
  advanceOneDayAction: () => void;
  setTodayAction: (newDateIso: string) => void;
  adjustEaBalanceAction: (studentId: string, deltaCents: number) => void;
  cancelInvoiceAction: (invoiceId: string) => void;
  issueExtraInvoiceAction: (studentId: string) => void;
  generate1000TransactionsAction: (studentId: string) => void;
  runReconcileJobNowAction: () => number;
  runOrphanSweepNowAction: () => number;
  runSelfTest: () => { valid: boolean; errors: string[] };
}

const PortalContext = createContext<PortalContextValue | null>(null);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with seed data
  const [data, setData] = useState(() => createInitialSeed());
  const [currentParent, setCurrentParent] = useState<ParentProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Router state
  const [route, setRoute] = useState<RouteState>({ path: '/' });
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'error' | 'warning' | 'info';
    text: string;
    code?: string;
  } | null>(null);

  // Prototype Tools State
  const [prototypeTools, setPrototypeTools] = useState<PrototypeToolsState>({
    simulatedToday: CONFIG.DEMO_TODAY,
    sessionIdleMin: CONFIG.SESSION_IDLE_MIN,
    govApiDown: false,
    failClosure: false,
    failNextSave: false,
    defaultOnlineResult: 'success',
    webhookDelaySec: 1,
    f1DebitFault: 'none',
    f1ReversalFault: false,
    govSyncAuthFailure: false,
    govSyncTimeout: false,
  });

  const today = useMemo(() => parseIsoDate(prototypeTools.simulatedToday), [prototypeTools.simulatedToday]);

  const clearBanner = useCallback(() => setBannerMessage(null), []);

  const touchActivity = useCallback(() => {
    if (session) {
      setSession((prev) => (prev ? { ...prev, lastActivityAt: new Date().toISOString() } : null));
    }
  }, [session]);

  const navigate = useCallback(
    (to: string, params?: Partial<RouteState>) => {
      touchActivity();

      // Guarded routes check session
      const publicRoutes = ['/', '/singpass'];
      if (!publicRoutes.includes(to) && !currentParent) {
        setBannerMessage({ type: 'warning', text: MSG.MSG_0002, code: 'MSG-0002' });
        setRoute({ path: '/' });
        return;
      }

      setRoute({
        path: to,
        ...params,
      });
      window.scrollTo(0, 0);
    },
    [currentParent, touchActivity]
  );

  // Session timeout monitor
  useEffect(() => {
    if (!session || !currentParent) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const last = new Date(session.lastActivityAt).getTime();
      const idleMinutes = (now - last) / (1000 * 60);

      if (idleMinutes >= prototypeTools.sessionIdleMin) {
        // Expired!
        setData((prev) => ({
          ...prev,
          securityLogs: [
            ...prev.securityLogs,
            {
              id: `SEC-${Date.now()}`,
              timestamp: new Date().toISOString(),
              parentId: currentParent.id,
              event: 'SESSION_TIMEOUT',
              detail: `Session idle for ${idleMinutes.toFixed(1)}m (limit ${prototypeTools.sessionIdleMin}m)`,
            },
          ],
        }));
        setCurrentParent(null);
        setSession(null);
        setBannerMessage({ type: 'warning', text: MSG.MSG_0002, code: 'MSG-0002' });
        setRoute({ path: '/' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, currentParent, prototypeTools.sessionIdleMin]);

  // SingPass mock login
  const loginWithSingPass = useCallback(
    (selection: string): { success: boolean; message?: string } => {
      clearBanner();

      if (selection === 'CANCEL') {
        setBannerMessage({ type: 'error', text: MSG.MSG_0802, code: 'MSG-0802' });
        navigate('/');
        return { success: false, message: MSG.MSG_0802 };
      }

      if (selection === 'ERROR') {
        setBannerMessage({ type: 'error', text: MSG.MSG_0802, code: 'MSG-0802' });
        navigate('/');
        return { success: false, message: MSG.MSG_0802 };
      }

      if (selection === 'UNLINKED_NRIC') {
        // SingPass returns NRIC not in sync dataset -> MSG-0801, no session
        setBannerMessage({ type: 'error', text: MSG.MSG_0801, code: 'MSG-0801' });
        navigate('/');
        return { success: false, message: MSG.MSG_0801 };
      }

      // Find parent by ID
      const targetParent = data.parents.find((p) => p.id === selection);
      if (!targetParent) {
        setBannerMessage({ type: 'error', text: MSG.MSG_0801, code: 'MSG-0801' });
        navigate('/');
        return { success: false, message: MSG.MSG_0801 };
      }

      const nowIso = new Date().toISOString();

      // Check first-time login (AC 1)
      if (!targetParent.isActivate) {
        targetParent.isActivate = true;
        targetParent.userId = `USR-${targetParent.id}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        targetParent.updatedAt = nowIso;
        targetParent.updatedBy = 'SINGPASS_AUTH';

        data.auditLogs.push({
          id: `AUD-${Date.now()}`,
          actor: targetParent.userId,
          action: 'PARENT_REGISTERED',
          entity: 'ParentProfile',
          entityId: targetParent.id,
          oldValue: 'Unregistered',
          newValue: `Activated with userId ${targetParent.userId}`,
          timestamp: nowIso,
        });
      }

      // Establish session
      const newSession: Session = {
        parentId: targetParent.id,
        startedAt: nowIso,
        lastActivityAt: nowIso,
      };

      data.auditLogs.push({
        id: `AUD-${Date.now()}-LOGIN`,
        actor: targetParent.userId || targetParent.id,
        action: 'SINGPASS_LOGIN',
        entity: 'Session',
        entityId: targetParent.id,
        oldValue: '',
        newValue: 'Session Started',
        timestamp: nowIso,
      });

      setCurrentParent(targetParent);
      setSession(newSession);

      // Perform closure checks on all children upon entering portal
      for (const st of data.students) {
        Function1Service.ensureClosureCheck(st.id, {
          students: data.students,
          citizenRecords: data.citizenRecords,
          educationAccounts: data.educationAccounts,
          auditLogs: data.auditLogs,
          securityLogs: data.securityLogs,
          today,
          govApiDown: prototypeTools.govApiDown,
          failClosure: prototypeTools.failClosure,
        });
      }

      navigate('/home');
      return { success: true };
    },
    [data, navigate, clearBanner, today, prototypeTools.govApiDown, prototypeTools.failClosure]
  );

  const logout = useCallback(
    (reason?: string) => {
      if (currentParent) {
        data.auditLogs.push({
          id: `AUD-${Date.now()}-LOGOUT`,
          actor: currentParent.userId || currentParent.id,
          action: 'LOGOUT',
          entity: 'Session',
          entityId: currentParent.id,
          oldValue: 'Active',
          newValue: reason || 'User Logout',
          timestamp: new Date().toISOString(),
        });
      }
      setCurrentParent(null);
      setSession(null);
      navigate('/');
    },
    [currentParent, data.auditLogs, navigate]
  );

  // Linked students calculation
  const linkedStudents = useMemo(() => {
    if (!currentParent) return [];
    const parentId = currentParent.id;
    // P9 has no children linked
    if (parentId === 'P9') return [];

    // Map parent to students according to seed
    if (parentId === 'P1' || parentId === 'P2') {
      return data.students.filter((s) => s.id === 'ST-A1-7K2Q' || s.id === 'ST-A2-9M4L');
    }
    if (parentId === 'P3') {
      return data.students.filter((s) => s.id === 'ST-B1-3P8X' || s.id === 'ST-B2-5W2K');
    }
    if (parentId === 'P4') {
      return data.students.filter((s) => s.id === 'ST-C1-8R6Y' || s.id === 'ST-C2-2N9Z');
    }
    if (parentId === 'P5') {
      return data.students.filter((s) => s.id === 'ST-D1-4H1J' || s.id === 'ST-D2-6V3B');
    }
    if (parentId === 'P6') {
      return data.students.filter(
        (s) => s.id === 'ST-E1-1Q5C' || s.id === 'ST-E2-9T7D' || s.id === 'ST-E3-8U4E'
      );
    }
    if (parentId === 'P7') {
      return data.students.filter((s) => s.id === 'ST-F1-7S2M');
    }
    if (parentId === 'P8') {
      return data.students.filter((s) => s.id === 'ST-G1-5K8L');
    }

    return [];
  }, [currentParent, data.students]);

  const getStudentEa = useCallback(
    (studentId: string) => {
      // Always run closure check on access
      Function1Service.ensureClosureCheck(studentId, {
        students: data.students,
        citizenRecords: data.citizenRecords,
        educationAccounts: data.educationAccounts,
        auditLogs: data.auditLogs,
        securityLogs: data.securityLogs,
        today,
        govApiDown: prototypeTools.govApiDown,
        failClosure: prototypeTools.failClosure,
      });
      return data.educationAccounts.find((a) => a.studentId === studentId);
    },
    [data, today, prototypeTools.govApiDown, prototypeTools.failClosure]
  );

  const getStudentInvoices = useCallback(
    (studentId: string) => {
      return data.invoices.filter((inv) => inv.studentId === studentId);
    },
    [data.invoices]
  );

  // Confirm payment
  const confirmPaymentAction = useCallback(
    (invoiceId: string, plan: PaymentPlan, idempotencyKey: string) => {
      if (!currentParent) return { success: false, error: MSG.AUTH_REQUIRED };

      const invoice = data.invoices.find((i) => i.id === invoiceId);
      if (!invoice) return { success: false, error: MSG.SYSTEM_ERROR };

      const res = PaymentService.confirmPayment(currentParent, invoice, plan, idempotencyKey, {
        invoices: data.invoices,
        students: data.students,
        citizenRecords: data.citizenRecords,
        educationAccounts: data.educationAccounts,
        transactions: data.transactions,
        ledgerEntries: data.ledgerEntries,
        auditLogs: data.auditLogs,
        securityLogs: data.securityLogs,
        today,
        f1DebitFault: prototypeTools.f1DebitFault,
        govApiDown: prototypeTools.govApiDown,
      });

      setData({ ...data });
      return res;
    },
    [currentParent, data, today, prototypeTools.f1DebitFault, prototypeTools.govApiDown]
  );

  // Webhook action
  const processWebhookAction = useCallback(
    (payload: any, signature: string) => {
      const res = PaymentService.processWebhook(payload, signature, {
        transactions: data.transactions,
        invoices: data.invoices,
        educationAccounts: data.educationAccounts,
        ledgerEntries: data.ledgerEntries,
        webhookReceipts: data.webhookReceipts,
        securityLogs: data.securityLogs,
        auditLogs: data.auditLogs,
        f1ReversalFault: prototypeTools.f1ReversalFault,
      });
      setData({ ...data });
      return res;
    },
    [data, prototypeTools.f1ReversalFault]
  );

  // Update profile
  const updateParentDetailsAction = useCallback(
    (updates: Partial<ParentProfile>) => {
      if (!currentParent) return { success: false, message: MSG.AUTH_REQUIRED };

      // Prototype tool: fail next save simulation
      if (prototypeTools.failNextSave) {
        setPrototypeTools((prev) => ({ ...prev, failNextSave: false }));
        return { success: false, message: MSG.MSG_0808 };
      }

      const errors: Record<string, string> = {};

      // Mandatory fields: mobile, email, street, postalCode, country (MSG-0001)
      if (!updates.phoneNumber?.trim()) {
        errors.phoneNumber = MSG.MSG_0001('mobile number');
      } else {
        // Mobile format: 8 digits starting with 6, 8, 9, spaces allowed
        const cleanMobile = updates.phoneNumber.replace(/\s+/g, '');
        if (!/^[689]\d{7}$/.test(cleanMobile)) {
          errors.phoneNumber = MSG.MSG_0805;
        }
      }

      if (!updates.email?.trim()) {
        errors.email = MSG.MSG_0001('email');
      } else {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email) || updates.email.length > 150) {
          errors.email = MSG.MSG_0806;
        }
      }

      if (!updates.mailingStreet?.trim()) {
        errors.mailingStreet = MSG.MSG_0001('mailing street');
      }
      if (!updates.mailingPostalCode?.trim()) {
        errors.mailingPostalCode = MSG.MSG_0001('postal code');
      } else if (!/^\d{6}$/.test(updates.mailingPostalCode.replace(/\s+/g, ''))) {
        errors.mailingPostalCode = 'Enter a valid 6-digit postal code';
      }
      if (!updates.mailingCountry?.trim()) {
        errors.mailingCountry = MSG.MSG_0001('country');
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      // Record audit logs for each changed field
      const nowIso = new Date().toISOString();
      const parentInStore = data.parents.find((p) => p.id === currentParent.id)!;

      const trackChange = (field: keyof ParentProfile, label: string) => {
        if (updates[field] !== undefined && updates[field] !== parentInStore[field]) {
          data.auditLogs.push({
            id: `AUD-${Date.now()}-${field}`,
            actor: currentParent.userId || currentParent.id,
            action: 'UPDATE_PARENT_DETAILS',
            entity: 'ParentProfile',
            entityId: currentParent.id,
            oldValue: String(parentInStore[field] || ''),
            newValue: String(updates[field] || ''),
            timestamp: nowIso,
          });
          (parentInStore as any)[field] = updates[field];
        }
      };

      trackChange('phoneNumber', 'Mobile Number');
      trackChange('email', 'Email Address');
      trackChange('mailingBlock', 'Mailing Block');
      trackChange('mailingUnit', 'Mailing Unit');
      trackChange('mailingStreet', 'Mailing Street');
      trackChange('mailingPostalCode', 'Mailing Postal Code');
      trackChange('mailingCountry', 'Mailing Country');

      parentInStore.updatedAt = nowIso;
      parentInStore.updatedBy = currentParent.userId || currentParent.id;

      setCurrentParent({ ...parentInStore });
      setData({ ...data });

      return { success: true, message: MSG.MSG_0807 };
    },
    [currentParent, data, prototypeTools.failNextSave]
  );

  // Daily sync
  const runDailySyncAction = useCallback(() => {
    const res = Function1Service.runDailySync(today, {
      citizenRecords: data.citizenRecords,
      students: data.students,
      educationAccounts: data.educationAccounts,
      syncLogs: data.syncLogs,
      auditLogs: data.auditLogs,
      govSyncAuthFailure: prototypeTools.govSyncAuthFailure,
      govSyncTimeout: prototypeTools.govSyncTimeout,
    });
    setData({ ...data });
    return res;
  }, [data, today, prototypeTools.govSyncAuthFailure, prototypeTools.govSyncTimeout]);

  // Reset seed
  const resetSeedAction = useCallback(() => {
    const fresh = createInitialSeed();
    setData(fresh);
    if (currentParent) {
      const refreshedParent = fresh.parents.find((p) => p.id === currentParent.id) || null;
      setCurrentParent(refreshedParent);
    }
  }, [currentParent]);

  // Advance 1 day
  const advanceOneDayAction = useCallback(() => {
    const nextDate = addDays(today, 1);
    const nextIso = formatIsoDate(nextDate);
    setPrototypeTools((prev) => ({ ...prev, simulatedToday: nextIso }));
  }, [today]);

  const setTodayAction = useCallback((newDateIso: string) => {
    setPrototypeTools((prev) => ({ ...prev, simulatedToday: newDateIso }));
  }, []);

  // Adjust EA balance
  const adjustEaBalanceAction = useCallback(
    (studentId: string, deltaCents: number) => {
      const acc = data.educationAccounts.find((a) => a.studentId === studentId);
      if (acc) {
        acc.balanceCents = Math.max(0, acc.balanceCents + deltaCents);
        acc.lastUpdatedAt = new Date().toISOString();
        data.auditLogs.push({
          id: `AUD-${Date.now()}`,
          actor: 'PROTOTYPE_TOOLS',
          action: 'MANUAL_BALANCE_ADJUST',
          entity: 'EducationAccount',
          entityId: acc.accountNumber,
          oldValue: '',
          newValue: `Adjusted by ${deltaCents} cents. New balance: ${acc.balanceCents}`,
          timestamp: new Date().toISOString(),
        });
        setData({ ...data });
      }
    },
    [data]
  );

  // Cancel invoice (Simulate Admin cancellation EX-14)
  const cancelInvoiceAction = useCallback(
    (invoiceId: string) => {
      const inv = data.invoices.find((i) => i.id === invoiceId);
      if (inv) {
        inv.status = 'Cancelled';
        inv.cancelledAt = new Date().toISOString();
        data.auditLogs.push({
          id: `AUD-${Date.now()}`,
          actor: 'ADMIN_SIMULATION',
          action: 'CANCEL_INVOICE',
          entity: 'Invoice',
          entityId: inv.id,
          oldValue: 'Issued',
          newValue: 'Cancelled',
          timestamp: new Date().toISOString(),
        });
        setData({ ...data });
      }
    },
    [data]
  );

  // Issue extra invoice
  const issueExtraInvoiceAction = useCallback(
    (studentId: string) => {
      const student = data.students.find((s) => s.id === studentId);
      if (!student) return;
      const count = data.invoices.filter((i) => i.studentId === studentId).length + 1;
      const newInvId = `INV-${studentId.replace('ST-', '')}-${1000 + count}`;
      const newInv: Invoice = {
        id: newInvId,
        invoiceNumber: `INV-2026-${1000 + count}`,
        studentId,
        schoolId: 'SCH-GENERIC',
        schoolName: student.school,
        grossCents: 2500,
        subsidyCents: 0,
        netCents: 2500,
        status: 'Issued',
        issuedAt: new Date().toISOString(),
        dueDate: '2026-11-28',
        rowVersion: 1,
        items: [
          {
            id: `ITEM-${newInvId}-1`,
            invoiceId: newInvId,
            lineNumber: 1,
            studentChargeId: `CHG-${newInvId}-1`,
            feeType: 'Miscellaneous',
            description: 'Mathematics Olympiad Training Workshop',
            components: [{ name: 'Workshop registration', amountCents: 2500 }],
            grossCents: 2500,
            subsidyCents: 0,
            netCents: 2500,
            dueDate: '2026-11-28',
          },
        ],
      };
      data.invoices.push(newInv);
      setData({ ...data });
    },
    [data]
  );

  // Generate 1,000 transactions for performance test
  const generate1000TransactionsAction = useCallback(
    (studentId: string) => {
      const ea = data.educationAccounts.find((a) => a.studentId === studentId);
      if (!ea) return;
      for (let i = 1; i <= 1000; i++) {
        data.ledgerEntries.push({
          id: `LED-PERF-${studentId}-${i}`,
          accountNumber: ea.accountNumber,
          direction: 'out',
          amountCents: 100,
          type: 'Fee payment',
          status: 'Completed',
          channel: 'ea',
          description: `Performance Benchmark Batch Item #${i}`,
          date: '2026-05-01',
          fundingReference: `FND-PERF-${i}`,
        });
      }
      setData({ ...data });
    },
    [data]
  );

  // Reconcile job
  const runReconcileJobNowAction = useCallback(() => {
    let reconciledCount = 0;
    for (const tx of data.transactions) {
      if (tx.status === 'Pending') {
        const pendingOnlineLeg = tx.legs.find(
          (l) => l.method === 'OnlineGateway' && l.status === 'Pending'
        );
        if (pendingOnlineLeg) {
          // If transaction age > threshold -> ReconciliationRequired
          pendingOnlineLeg.status = 'ReconciliationRequired';
          tx.status = 'ReconciliationRequired';
          reconciledCount++;
        }
      }
    }
    setData({ ...data });
    return reconciledCount;
  }, [data]);

  // Orphan sweep
  const runOrphanSweepNowAction = useCallback(() => {
    let swept = 0;
    for (const tx of data.transactions) {
      if (tx.status === 'Pending') {
        const eaLeg = tx.legs.find((l) => l.method === 'EducationAccount');
        const onlineLeg = tx.legs.find((l) => l.method === 'OnlineGateway');
        if (eaLeg && eaLeg.status === 'Succeeded' && (!onlineLeg || onlineLeg.status === 'Pending')) {
          // Refund EA
          const eaAccount = data.educationAccounts.find((a) => a.accountNumber === eaLeg.walletId);
          if (eaAccount) {
            eaAccount.balanceCents += eaLeg.requestedCents;
          }
          eaLeg.status = 'Reversed';
          tx.status = 'Failed';
          const inv = data.invoices.find((i) => i.id === tx.invoiceId);
          if (inv) inv.status = 'Issued';
          swept++;
        }
      }
    }
    setData({ ...data });
    return swept;
  }, [data]);

  const runSelfTest = useCallback(() => {
    return selfTest(data);
  }, [data]);

  const value: PortalContextValue = {
    route,
    navigate,
    currentParent,
    session,
    bannerMessage,
    clearBanner,
    loginWithSingPass,
    logout,
    touchActivity,
    today,
    todayIso: prototypeTools.simulatedToday,
    parents: data.parents,
    students: data.students,
    linkedStudents,
    educationAccounts: data.educationAccounts,
    invoices: data.invoices,
    transactions: data.transactions,
    ledgerEntries: data.ledgerEntries,
    syncLogs: data.syncLogs,
    auditLogs: data.auditLogs,
    securityLogs: data.securityLogs,
    webhookReceipts: data.webhookReceipts,
    prototypeTools,
    setPrototypeTools,
    getStudentEa,
    getStudentInvoices,
    confirmPaymentAction,
    processWebhookAction,
    updateParentDetailsAction,
    runDailySyncAction,
    resetSeedAction,
    advanceOneDayAction,
    setTodayAction,
    adjustEaBalanceAction,
    cancelInvoiceAction,
    issueExtraInvoiceAction,
    generate1000TransactionsAction,
    runReconcileJobNowAction,
    runOrphanSweepNowAction,
    runSelfTest,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
};
