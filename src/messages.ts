/**
 * Section 8: Message codes and UI copy strictly according to FS-08 and F9.
 * Kept identical for QA traceability.
 */

export const MSG = {
  // FS-08 Appendix B
  MSG_0001: (field: string) => `Enter your ${field}`,
  MSG_0002: 'Your session has expired. Please log in again.',
  MSG_0003: 'You do not have permission to perform this action.',
  MSG_0801: 'We could not find any student linked to your account. Please contact your child\'s school.',
  MSG_0802: 'Login was not completed. Try again.',
  MSG_0803: 'No transactions found.',
  MSG_0804: 'This student does not have an Education Account.',
  MSG_0805: 'Enter a mobile number in the correct format, like 9123 4567',
  MSG_0806: 'Enter an email address in the correct format, like name@example.com',
  MSG_0807: 'Your details have been updated.',
  MSG_0808: 'We could not update your details. Please try again.',

  // F9 Section 5.1 & Error Codes
  EA_NOT_AVAILABLE: 'This student does not have an Education Account. Please pay online.',
  EA_NOT_ACTIVE: 'The Education Account is not active. Please pay online.',
  EA_INSUFFICIENT_BALANCE: 'Your Education Account balance is not enough for this amount. You can pay the rest online.',
  SPLIT_AMOUNT_INVALID: 'The two amounts must be more than zero and add up to the total.',
  INVOICE_ALREADY_PAID: 'This invoice has already been paid.',
  INVOICE_NOT_PAYABLE: 'This invoice can no longer be paid.',
  PAYMENT_PENDING: 'A payment for this invoice is still being processed.',
  PAYMENT_FAILED: 'Your payment could not be completed. No amount was deducted.',
  PAYMENT_FAILED_EA_RETURNED: 'Your online payment could not be completed. The amount taken from the Education Account has been returned.',
  PAYMENT_CANCELLED: 'The payment was cancelled. No amount was deducted.',
  FORBIDDEN_CHILD: 'You do not have access to this student\'s records.',
  AUTH_REQUIRED: 'Your session has expired. Please sign in again.',
  SYSTEM_ERROR: 'Something went wrong. Please try again later.',

  // Section 8.3 Fixed UI Copy
  EA_TO_BE_CREATED_TEXT: 'Education Account not active yet.',
  EA_NOT_ELIGIBLE_TEXT: 'Education Accounts are for Singapore Citizens',
  EA_NOT_YET_7_TEXT: (openDateDDMMYYYY: string) => `Education Account opens on ${openDateDDMMYYYY} (7th birthday).`,
  HOME_NO_FEES_TEXT: 'Nothing to pay right now.',
  FEES_EMPTY_TEXT: 'No outstanding fees',
  ELIGIBILITY_REVIEW_TEXT: 'Eligibility review in progress. New payments are paused.',
  MY_DETAILS_VIEW_ONLY_TEXT: 'Your details can no longer be edited because all linked students are 16 or older.',
  CHILD_16_OR_OLDER_TEXT: 'This student is 16 or older. You can view fees and transactions only.',
} as const;
