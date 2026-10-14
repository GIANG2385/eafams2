/**
 * Core Data Models according to FS-08, F1, and F9 Specifications.
 */

export type Citizenship = 'Citizen' | 'PR' | 'Foreigner';
export type Gender = 'Male' | 'Female';

export interface CitizenRecord {
  nric: string;
  fullName: string;
  dob: { y: number; m: number; d: number }; // 1-indexed month
  citizenship: Citizenship;
  gender?: Gender;
  race: string;
  residentialAddress: string;
  fatherNric?: string;
  motherNric?: string;
}

export interface StudentProfile {
  id: string; // Opaque ID, e.g. ST-7K2Q
  nric: string; // S****123A
  fullName: string;
  dob: { y: number; m: number; d: number };
  citizenship: Citizenship;
  gender?: Gender;
  school: string;
  level: string; // e.g. P4, S2
  class: string; // e.g. 4 Charity, 2 Hope
  fatherNric?: string;
  motherNric?: string;
  fasGranted?: string; // e.g. "MOEFAS Tier 2"
}

export type EaStatus = 'Active' | 'Closed';

export interface EducationAccount {
  accountNumber: string;
  studentId: string;
  balanceCents: number;
  status: EaStatus;
  currency: 'SGD';
  createdAt: string; // ISO string
  lastUpdatedAt: string;
  closedAt?: string;
  closureDeferred?: boolean;
  eligibilityReviewRequired?: boolean;
  financialLock?: boolean; // EF01 Gov API unavailable
}

export type EaViewStatus =
  | 'Not eligible'
  | 'Closed'
  | 'Due for closure'
  | 'Active'
  | 'To be created'
  | 'Not yet 7';

export interface EaLedgerEntry {
  id: string;
  accountNumber: string;
  direction: 'in' | 'out';
  amountCents: number;
  type: 'Top-up' | 'Fee payment' | 'Closure transfer' | 'Reversal';
  status: 'Completed' | 'Pending' | 'Failed';
  channel: 'ea' | 'online';
  description: string;
  date: string; // YYYY-MM-DD
  fundingReference?: string;
}

export interface ParentProfile {
  id: string;
  code: string;
  userId: string;
  nric: string; // S****421D
  fullName: string;
  phoneNumber: string; // 8 digits (starts with 6,8,9)
  email: string;
  residentialAddress: string; // Read-only from SingPass
  mailingBlock: string;
  mailingUnit: string;
  mailingStreet: string;
  mailingPostalCode: string; // 6 digits
  mailingCountry: string;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type FeeType = 'School fee' | 'Miscellaneous' | 'Extracurricular' | 'Ad hoc';
export type InvoiceStatus = 'Draft' | 'Issued' | 'PaymentPending' | 'Paid' | 'Cancelled';

export interface InvoiceComponent {
  name: string;
  amountCents: number;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  lineNumber: number;
  studentChargeId: string;
  feeType: FeeType;
  description: string;
  components: InvoiceComponent[];
  grossCents: number;
  subsidyCents: number;
  netCents: number;
  dueDate: string; // YYYY-MM-DD
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  schoolId: string;
  schoolName: string;
  grossCents: number;
  subsidyCents: number; // Defaults to 0
  netCents: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string; // Earliest item due date
  paidAt?: string;
  cancelledAt?: string;
  rowVersion: number;
  items: InvoiceItem[];
}

export type TransactionStatus =
  | 'Pending'
  | 'Succeeded'
  | 'Failed'
  | 'Cancelled'
  | 'ReconciliationRequired';

export type FundingLegMethod = 'EducationAccount' | 'OnlineGateway';
export type FundingLegStatus =
  | 'Pending'
  | 'Succeeded'
  | 'Failed'
  | 'Reversed'
  | 'ReconciliationRequired'
  | 'Cancelled';

export interface FundingLeg {
  id: string;
  transactionId: string;
  sequence: number;
  fundingReference: string;
  method: FundingLegMethod;
  requestedCents: number;
  settledCents: number;
  status: FundingLegStatus;
  walletId?: string;
  eaLedgerId?: string;
  eaReversalLedgerId?: string;
  providerCode?: string;
  providerTransactionId?: string;
  failureCode?: string;
  failureReason?: string;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  studentId: string;
  initiatedByUserId: string;
  transactionReference: string; // PAY-YYYYMMDD-XXXXXX
  idempotencyKey: string;
  requestedCents: number;
  settledCents: number;
  status: TransactionStatus;
  legs: FundingLeg[];
  createdAt: string;
  completedAt?: string;
}

export interface WebhookReceipt {
  providerCode: string;
  providerEventId: string;
  fundingReference: string;
  eventType: string;
  payloadHash: string;
  processingStatus: 'Received' | 'Processed' | 'Ignored' | 'Failed';
  receivedAt: string;
  processedAt?: string;
  payloadData?: any;
}

export interface SyncLog {
  id: string;
  processingRef: string;
  jobName: 'Initial' | 'Daily';
  triggerType: 'System' | 'Manual';
  status: 'Completed' | 'Failed';
  startedAt: string;
  completedAt: string;
  totalRecords: number;
  successful: number;
  failed: number;
  skipped: number;
  failureReasons: string[];
  lastCoveredDate: string; // YYYY-MM-DD
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  parentId: string;
  event: 'FORBIDDEN_CHILD' | 'BAD_WEBHOOK_SIGNATURE' | 'AUTH_REQUIRED' | 'SESSION_TIMEOUT' | 'UNKNOWN';
  detail: string;
}

export interface Session {
  parentId: string;
  startedAt: string;
  lastActivityAt: string;
}

export interface PrototypeToolsState {
  simulatedToday: string; // '2026-10-14'
  sessionIdleMin: number; // 15 by default, 0.5 (30 sec) for testing
  govApiDown: boolean;
  failClosure: boolean;
  citizenshipChangedForStudentId?: string;
  failNextSave: boolean;
  defaultOnlineResult: 'success' | 'fail' | 'cancel' | 'timeout';
  webhookDelaySec: number;
  f1DebitFault: 'none' | 'before_debit' | 'unknown_result';
  f1ReversalFault: boolean;
  govSyncAuthFailure: boolean;
  govSyncTimeout: boolean;
}
