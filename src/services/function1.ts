/**
 * Function 1 Service: Education Account Lifecycle & Ledger Engine (F1, FS-08)
 */

import {
  StudentProfile,
  EducationAccount,
  EaViewStatus,
  CitizenRecord,
  SyncLog,
  AuditLog,
  SecurityLog,
  EaLedgerEntry,
} from '../types';
import {
  DateTuple,
  reached,
  under16,
  anniversary,
  cmp,
  parseIsoDate,
  formatIsoDate,
  addDays,
} from './clock';
import { formatDateDDMMYYYY } from '../config';
import { MSG } from '../messages';

export interface EaViewResult {
  status: EaViewStatus;
  balanceCents?: number;
  showBalance: boolean;
  showTransactions: boolean;
  displayText?: string;
  badgeVariant: 'green' | 'amber' | 'slate' | 'blue' | 'gray';
  account?: EducationAccount;
  eligibilityReviewBanner?: string;
  financialDisabled: boolean;
  viewOnlyReason?: string;
}

export class Function1Service {
  /**
   * Section 5.2: Evaluate visual display status of Education Account in strict priority order.
   */
  static getEaView(
    student: StudentProfile,
    account: EducationAccount | undefined,
    today: DateTuple
  ): EaViewResult {
    // 1. Not Singapore Citizen
    if (student.citizenship !== 'Citizen') {
      return {
        status: 'Not eligible',
        showBalance: false,
        showTransactions: false,
        displayText: MSG.EA_NOT_ELIGIBLE_TEXT,
        badgeVariant: 'gray',
        financialDisabled: true,
      };
    }

    // 2. Has EA, Closed
    if (account && account.status === 'Closed') {
      const closedDateStr = account.closedAt
        ? formatDateDDMMYYYY(account.closedAt.split('T')[0])
        : '';
      return {
        status: 'Closed',
        account,
        showBalance: false,
        showTransactions: true,
        displayText: closedDateStr ? `Closed on ${closedDateStr}` : 'Closed',
        badgeVariant: 'slate',
        financialDisabled: true,
      };
    }

    // Check age 16 threshold
    const isAtLeast16 = reached(student.dob, 16, today);

    // 3. Has EA, not Closed, reached 16yo -> Due for closure
    if (account && account.status !== 'Closed' && isAtLeast16) {
      return {
        status: 'Due for closure',
        account,
        balanceCents: account.balanceCents,
        showBalance: true,
        showTransactions: true,
        badgeVariant: 'amber',
        financialDisabled: true,
        viewOnlyReason: MSG.CHILD_16_OR_OLDER_TEXT,
        eligibilityReviewBanner: account.eligibilityReviewRequired
          ? MSG.ELIGIBILITY_REVIEW_TEXT
          : undefined,
      };
    }

    // 4. Has EA, Active, under 16yo
    if (account && account.status === 'Active' && !isAtLeast16) {
      return {
        status: 'Active',
        account,
        balanceCents: account.balanceCents,
        showBalance: true,
        showTransactions: true,
        badgeVariant: 'green',
        financialDisabled: !!account.financialLock || !!account.eligibilityReviewRequired,
        eligibilityReviewBanner: account.eligibilityReviewRequired
          ? MSG.ELIGIBILITY_REVIEW_TEXT
          : undefined,
      };
    }

    // 5. No EA, reached 7yo -> To be created
    if (reached(student.dob, 7, today)) {
      return {
        status: 'To be created',
        showBalance: false,
        showTransactions: false,
        displayText: MSG.EA_TO_BE_CREATED_TEXT,
        badgeVariant: 'blue',
        financialDisabled: true,
      };
    }

    // 6. No EA, not yet 7yo -> Not yet 7
    const seventhBirthday = anniversary(student.dob, 7);
    const openDateStr = formatDateDDMMYYYY(seventhBirthday);
    return {
      status: 'Not yet 7',
      showBalance: false,
      showTransactions: false,
      displayText: MSG.EA_NOT_YET_7_TEXT(openDateStr),
      badgeVariant: 'slate',
      financialDisabled: true,
    };
  }

  /**
   * Section 5.3: Ensure closure check upon access (F02).
   * Called whenever an EA is read or written.
   */
  static ensureClosureCheck(
    studentId: string,
    state: {
      students: StudentProfile[];
      citizenRecords: CitizenRecord[];
      educationAccounts: EducationAccount[];
      auditLogs: AuditLog[];
      securityLogs: SecurityLog[];
      today: DateTuple;
      govApiDown?: boolean;
      failClosure?: boolean;
      citizenshipOverride?: { studentId: string; citizenship: StudentProfile['citizenship'] };
    }
  ): EducationAccount | undefined {
    const acc = state.educationAccounts.find((a) => a.studentId === studentId);
    if (!acc || acc.status === 'Closed') {
      return acc; // AF02, BR09: Do not re-close, do not modify closedAt
    }

    const student = state.students.find((s) => s.id === studentId);
    if (!student) return acc;

    // EF01: Mock Government API unavailable
    if (state.govApiDown) {
      acc.financialLock = true;
      state.securityLogs.push({
        id: `SEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        parentId: 'SYSTEM',
        event: 'UNKNOWN',
        detail: `GOV_API_UNAVAILABLE for student ${student.id}`,
      });
      return acc;
    }

    // BR03: Read latest citizen record for DOB & citizenship
    let currentCitizenship = student.citizenship;
    if (state.citizenshipOverride && state.citizenshipOverride.studentId === studentId) {
      currentCitizenship = state.citizenshipOverride.citizenship;
      student.citizenship = currentCitizenship;
    }

    // EF02: Citizenship changed before 16
    if (currentCitizenship !== 'Citizen') {
      acc.eligibilityReviewRequired = true;
      acc.financialLock = true;
      return acc;
    }

    // Check age 16 threshold
    if (!reached(student.dob, 16, state.today)) {
      return acc; // Still Active and under 16
    }

    // Age >= 16 reached! Check balance
    if (acc.balanceCents === 0) {
      // EF03: Simulated closure processing failure
      if (state.failClosure) {
        state.securityLogs.push({
          id: `SEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          parentId: 'SYSTEM',
          event: 'UNKNOWN',
          detail: `CLOSURE_FAILED for student ${student.id} (${acc.accountNumber})`,
        });
        return acc;
      }

      // Close immediately (F02-AC02)
      acc.status = 'Closed';
      acc.closedAt = `${formatIsoDate(state.today)}T08:00:00Z`;
      acc.lastUpdatedAt = new Date().toISOString();
      state.auditLogs.push({
        id: `AUD-${Date.now()}`,
        actor: 'F1_CLOSURE_CHECK',
        action: 'EA_CLOSED',
        entity: 'EducationAccount',
        entityId: acc.accountNumber,
        oldValue: 'Active',
        newValue: 'Closed',
        timestamp: new Date().toISOString(),
      });
    } else {
      // EF04: Balance > 0 -> Closure deferred (F02-AC10)
      acc.closureDeferred = true;
      acc.lastUpdatedAt = new Date().toISOString();
    }

    return acc;
  }

  /**
   * Section 5.4: Daily Sync Job (F01).
   * Runs daily sync to create EAs for newly turned 7-year-olds.
   */
  static runDailySync(
    today: DateTuple,
    state: {
      citizenRecords: CitizenRecord[];
      students: StudentProfile[];
      educationAccounts: EducationAccount[];
      syncLogs: SyncLog[];
      auditLogs: AuditLog[];
      govSyncAuthFailure?: boolean;
      govSyncTimeout?: boolean;
    }
  ): { createdCount: number; failedCount: number; skippedCount: number; log: SyncLog } {
    const startedAt = new Date().toISOString();
    const lastLog = state.syncLogs[state.syncLogs.length - 1];
    const lastCoveredDateStr = lastLog ? lastLog.lastCoveredDate : '2026-10-13';
    const lastCoveredTuple = parseIsoDate(lastCoveredDateStr);

    // Simulated auth failure or timeout
    if (state.govSyncAuthFailure || state.govSyncTimeout) {
      const errorReason = state.govSyncAuthFailure
        ? 'Government API Authentication Failed (HTTP 401)'
        : 'Government API Gateway Timeout (HTTP 504)';
      const failedLog: SyncLog = {
        id: `SYNC-${Date.now()}`,
        processingRef: `SYNC-REF-${formatIsoDate(today).replace(/-/g, '')}-FAIL`,
        jobName: 'Daily',
        triggerType: 'Manual',
        status: 'Failed',
        startedAt,
        completedAt: new Date().toISOString(),
        totalRecords: 0,
        successful: 0,
        failed: 1,
        skipped: 0,
        failureReasons: [errorReason],
        lastCoveredDate: lastCoveredDateStr,
      };
      state.syncLogs.push(failedLog);
      return { createdCount: 0, failedCount: 1, skippedCount: 0, log: failedLog };
    }

    let createdCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const failureReasons: string[] = [];

    // F1 1.1.5: Process all citizen records who turned 7 between day after lastCoveredDate and today
    for (const citizen of state.citizenRecords) {
      const seventhBday = anniversary(citizen.dob, 7);

      // Check if 7th birthday falls in the window: (lastCoveredDate, today]
      const afterLast = cmp(seventhBday, lastCoveredTuple) > 0;
      const onOrBeforeToday = cmp(seventhBday, today) <= 0;

      if (!afterLast || !onOrBeforeToday) {
        continue; // Not turning 7 in this window
      }

      // 1. Mandatory format validation (NRIC, fullName, dob, citizenship, gender)
      const validNric = citizen.nric && /^[STFG]\d{7}[A-Z]$/.test(citizen.nric);
      const hasName = !!citizen.fullName && citizen.fullName.trim().length > 0;
      const validDob = citizen.dob && citizen.dob.y > 1900 && cmp(citizen.dob, today) < 0;
      const validCitizenship = ['Citizen', 'PR', 'Foreigner'].includes(citizen.citizenship);
      const hasGender = citizen.gender === 'Male' || citizen.gender === 'Female';

      if (!validNric || !hasName || !validDob || !validCitizenship || !hasGender) {
        // E3 Wong Ethan has missing gender! (F1-AC08)
        failedCount++;
        failureReasons.push(
          `Record ${citizen.nric} (${citizen.fullName}): Missing or invalid mandatory fields ${
            !hasGender ? '[gender missing]' : ''
          }`
        );
        continue;
      }

      // AF01: Not Singapore Citizen -> skip
      if (citizen.citizenship !== 'Citizen') {
        skippedCount++;
        continue;
      }

      // BR05: Already 16 or older -> skip
      if (reached(citizen.dob, 16, today)) {
        skippedCount++;
        continue;
      }

      // Find or link student
      let student = state.students.find(
        (s) => s.fullName.toLowerCase() === citizen.fullName.toLowerCase()
      );
      if (!student) {
        student = {
          id: `ST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          nric: citizen.nric.slice(0, 1) + '****' + citizen.nric.slice(5),
          fullName: citizen.fullName,
          dob: citizen.dob,
          citizenship: citizen.citizenship,
          gender: citizen.gender,
          school: 'Primary School (Synced)',
          level: 'Primary 1',
          class: '1 Faith',
          fatherNric: citizen.fatherNric,
          motherNric: citizen.motherNric,
        };
        state.students.push(student);
      }

      // AF03: Already has an EA (active or closed) -> skip
      const existingEa = state.educationAccounts.find((ea) => ea.studentId === student.id);
      if (existingEa) {
        skippedCount++;
        continue;
      }

      // AF04: Missing parent NRIC does NOT block creation
      // Create new EA: Active, SGD 0.00 (F01-AC02)
      const newAccNum = `EA-${citizen.dob.y}-${String(citizen.dob.m).padStart(2, '0')}${String(
        citizen.dob.d
      ).padStart(2, '0')}-${student.id.replace('ST-', '')}`;

      const newAccount: EducationAccount = {
        accountNumber: newAccNum,
        studentId: student.id,
        balanceCents: 0,
        status: 'Active',
        currency: 'SGD',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };

      state.educationAccounts.push(newAccount);
      createdCount++;

      state.auditLogs.push({
        id: `AUD-${Date.now()}-${createdCount}`,
        actor: 'DAILY_SYNC',
        action: 'EA_CREATED',
        entity: 'EducationAccount',
        entityId: newAccNum,
        oldValue: '',
        newValue: `Active, SGD 0.00, Student: ${student.fullName}`,
        timestamp: new Date().toISOString(),
      });
    }

    const log: SyncLog = {
      id: `SYNC-${Date.now()}`,
      processingRef: `SYNC-REF-${formatIsoDate(today).replace(/-/g, '')}`,
      jobName: 'Daily',
      triggerType: 'Manual',
      status: 'Completed',
      startedAt,
      completedAt: new Date().toISOString(),
      totalRecords: createdCount + failedCount + skippedCount,
      successful: createdCount,
      failed: failedCount,
      skipped: skippedCount,
      failureReasons,
      lastCoveredDate: formatIsoDate(today),
    };

    state.syncLogs.push(log);
    return { createdCount, failedCount, skippedCount, log };
  }
}
