/** Trust Transaction Workflow error codes (LAW-015-03). */

export const TRUST_WORKFLOW_ERROR_CODES = {
  TRUST_DRAFT_NOT_FOUND: "TRUST_DRAFT_NOT_FOUND",
  TRUST_DRAFT_INVALID_STATE: "TRUST_DRAFT_INVALID_STATE",
  TRUST_DRAFT_NOT_VALIDATED: "TRUST_DRAFT_NOT_VALIDATED",
  TRUST_VALIDATION_FAILED: "TRUST_VALIDATION_FAILED",
  TRUST_POST_FAILED: "TRUST_POST_FAILED",
  TRUST_REVERSAL_REQUEST_INVALID: "TRUST_REVERSAL_REQUEST_INVALID",
  TRUST_TENANT_MISMATCH: "TRUST_TENANT_MISMATCH",
} as const;

export type TrustWorkflowErrorCode =
  (typeof TRUST_WORKFLOW_ERROR_CODES)[keyof typeof TRUST_WORKFLOW_ERROR_CODES];

export class TrustWorkflowError extends Error {
  readonly code: TrustWorkflowErrorCode;

  constructor(code: TrustWorkflowErrorCode, message: string) {
    super(message);
    this.name = "TrustWorkflowError";
    this.code = code;
  }
}

export function isTrustWorkflowError(error: unknown): error is TrustWorkflowError {
  return error instanceof TrustWorkflowError;
}
