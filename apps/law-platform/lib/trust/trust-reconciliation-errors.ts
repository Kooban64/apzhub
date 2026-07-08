/** Trust Reconciliation error codes (LAW-015-05). */

export const TRUST_RECONCILIATION_ERROR_CODES = {
  TRUST_RECONCILIATION_ACCOUNT_NOT_FOUND: "TRUST_RECONCILIATION_ACCOUNT_NOT_FOUND",
  TRUST_RECONCILIATION_TENANT_MISMATCH: "TRUST_RECONCILIATION_TENANT_MISMATCH",
  TRUST_RECONCILIATION_RUN_NOT_FOUND: "TRUST_RECONCILIATION_RUN_NOT_FOUND",
  TRUST_RECONCILIATION_FAILED: "TRUST_RECONCILIATION_FAILED",
} as const;

export type TrustReconciliationErrorCode =
  (typeof TRUST_RECONCILIATION_ERROR_CODES)[keyof typeof TRUST_RECONCILIATION_ERROR_CODES];

export class TrustReconciliationError extends Error {
  readonly code: TrustReconciliationErrorCode;

  constructor(code: TrustReconciliationErrorCode, message: string) {
    super(message);
    this.name = "TrustReconciliationError";
    this.code = code;
  }
}

export function isTrustReconciliationError(
  error: unknown,
): error is TrustReconciliationError {
  return error instanceof TrustReconciliationError;
}
