/** Platform service error categories — aligned with API gateway error standard (010). */

export type PlatformServiceErrorCategory =
  | "validation"
  | "authentication"
  | "authorization"
  | "not_found"
  | "conflict"
  | "business_rule"
  | "configuration"
  | "integration"
  | "connector"
  | "temporary_failure"
  | "system";

/** Stable machine-readable error codes for platform service failures. */
export type PlatformServiceErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_VIOLATION"
  | "CONFIGURATION_ERROR"
  | "INTEGRATION_UNAVAILABLE"
  | "CONNECTOR_ERROR"
  | "TEMPORARY_FAILURE"
  | "INTERNAL_ERROR"
  | "MAPPING_NOT_FOUND"
  | "MAPPING_CONFLICT"
  | "MAPPING_TYPE_MISMATCH"
  | "MAPPING_INACTIVE"
  | "MAPPING_PERSISTENCE_FAILED"
  | "MAPPING_REVISION_CONFLICT"
  | "RECONCILIATION_REQUIRED"
  | "INVALID_GLOBAL_ID"
  | "INVALID_REQUEST_CONTEXT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_CAPABILITY_UNSUPPORTED"
  | "PROVIDER_ENTITY_NOT_FOUND"
  | "PERSISTENCE_UNAVAILABLE"
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_ACTOR"
  | "INACTIVE_ACTOR"
  | "TENANT_MEMBERSHIP_REQUIRED"
  | "ORGANISATION_SCOPE_MISMATCH"
  | "PERMISSION_DENIED"
  | "POLICY_DENIED"
  | "IMPERSONATION_DENIED"
  | "AUTHORIZATION_UNAVAILABLE"
  | "INVALID_AUTHORIZATION_CONFIGURATION"
  | "INVALID_STATE_TRANSITION"
  | "APPROVAL_ORDER_VIOLATION"
  | "EVIDENCE_INCOMPLETE"
  | "CERTIFICATION_GATE_FAILURE"
  | "CERTIFICATION_NOT_READY"
  | "DUPLICATE_AUTOMATION_IMPORT"
  | "INVALID_AUTOMATION_RESULT"
  | "UNSUPPORTED_AUTOMATION_FORMAT"
  | "TENANT_MISMATCH"
  | "ORGANISATION_MISMATCH"
  | "CONFIGURATION_INVALID"
  | "CAPABILITY_UNSUPPORTED"
  | "REPOSITORY_FAILURE";

/** Vendor-neutral service error contract — never exposes backend details. */
export interface PlatformServiceErrorContract {
  readonly category: PlatformServiceErrorCategory;
  readonly code: PlatformServiceErrorCode;
  readonly message: string;
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly retryable: boolean;
}

/** Thrown by platform service implementations; mapped to API envelope at gateway. */
export class PlatformServiceError extends Error implements PlatformServiceErrorContract {
  readonly category: PlatformServiceErrorCategory;
  readonly code: PlatformServiceErrorCode;
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly retryable: boolean;

  constructor(input: PlatformServiceErrorContract) {
    super(input.message);
    this.name = "PlatformServiceError";
    this.category = input.category;
    this.code = input.code;
    this.correlationId = input.correlationId;
    this.details = input.details;
    this.retryable = input.retryable;
  }
}

export function isPlatformServiceError(error: unknown): error is PlatformServiceError {
  return error instanceof PlatformServiceError;
}
