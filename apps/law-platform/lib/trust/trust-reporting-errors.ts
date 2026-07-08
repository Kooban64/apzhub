export const TRUST_REPORTING_ERROR_CODES = {
  TRUST_REPORTING_ACCOUNT_NOT_FOUND: "TRUST_REPORTING_ACCOUNT_NOT_FOUND",
  TRUST_REPORTING_TENANT_MISMATCH: "TRUST_REPORTING_TENANT_MISMATCH",
  TRUST_REPORTING_INVALID_PERIOD: "TRUST_REPORTING_INVALID_PERIOD",
  TRUST_REPORTING_INVALID_TYPE: "TRUST_REPORTING_INVALID_TYPE",
  TRUST_REPORTING_CLIENT_REQUIRED: "TRUST_REPORTING_CLIENT_REQUIRED",
  TRUST_REPORTING_MATTER_REQUIRED: "TRUST_REPORTING_MATTER_REQUIRED",
  TRUST_REPORTING_NOT_FOUND: "TRUST_REPORTING_NOT_FOUND",
  TRUST_REPORTING_FAILED: "TRUST_REPORTING_FAILED",
} as const;

export type TrustReportingErrorCode =
  (typeof TRUST_REPORTING_ERROR_CODES)[keyof typeof TRUST_REPORTING_ERROR_CODES];

export class TrustReportingError extends Error {
  readonly code: TrustReportingErrorCode;

  constructor(code: TrustReportingErrorCode, message: string) {
    super(message);
    this.name = "TrustReportingError";
    this.code = code;
  }
}

export function isTrustReportingError(error: unknown): error is TrustReportingError {
  return error instanceof TrustReportingError;
}
