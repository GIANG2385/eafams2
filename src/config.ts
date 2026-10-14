/**
 * Section 5.7: Configuration Constants.
 * Centralized constant store as required by build spec.
 */

export const CONFIG = {
  // Session configuration (FS-08 D-22: 15 minutes)
  SESSION_IDLE_MIN: 15,

  // Provider session timeout (F9 EX-02, NQ-18: 10 minutes)
  PROVIDER_SESSION_MIN: 10,

  // Scheduled job intervals and thresholds (F9 F9.6, EX-08, NQ-10, EX-11)
  RECONCILE_POLL_SEC: 15,
  RECONCILE_THRESHOLD_MIN: 30,
  ORPHAN_SWEEP_MIN: 5,

  // Minimum transaction legs (F9 NQ-13)
  MIN_ONLINE_CENTS: 100, // SGD 1.00
  MIN_EA_LEG_CENTS: 1, // SGD 0.01

  // Pagination for transaction history (FS-08 6.2: 20 rows/page)
  PAGE_SIZE_TX: 20,

  // Default baseline demo date
  DEMO_TODAY: '2026-10-14',

  // Time zone for displays and receipts
  TZ: 'Asia/Singapore',
  CURRENCY: 'SGD',
} as const;

export function formatSGD(cents: number): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = (abs / 100).toFixed(2);
  const parts = dollars.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${isNegative ? '-' : ''}SGD ${parts.join('.')}`;
}

export function parseDate(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d };
}

export function formatDateDDMMYYYY(dateStrOrObj: string | { y: number; m: number; d: number }): string {
  if (typeof dateStrOrObj === 'string') {
    const parts = dateStrOrObj.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return dateStrOrObj;
  }
  return `${String(dateStrOrObj.d).padStart(2, '0')}/${String(dateStrOrObj.m).padStart(2, '0')}/${dateStrOrObj.y}`;
}
