/**
 * Lifecycle governance errors — APZQEP-120-S06.
 */

import { EvidenceDomainError } from "./errors";

export type LifecycleErrorCode =
  | "LIFECYCLE_TRANSITION_INVALID"
  | "LIFECYCLE_TRANSITION_FORBIDDEN"
  | "LIFECYCLE_STATE_CONFLICT"
  | "LIFECYCLE_STALE_REVISION"
  | "LIFECYCLE_HOLD_ACTIVE"
  | "LIFECYCLE_RETENTION_NOT_SATISFIED"
  | "LIFECYCLE_INTEGRITY_REQUIREMENT_FAILED"
  | "LIFECYCLE_STORAGE_UNAVAILABLE"
  | "LIFECYCLE_ALREADY_IN_TARGET_STATE"
  | "LIFECYCLE_REASON_REQUIRED"
  | "LIFECYCLE_AUDIT_WRITE_FAILED";

export class EvidenceLifecycleError extends EvidenceDomainError {
  readonly lifecycleCode: LifecycleErrorCode;

  constructor(
    code: LifecycleErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    const category =
      code === "LIFECYCLE_TRANSITION_FORBIDDEN"
        ? "forbidden"
        : code === "LIFECYCLE_STALE_REVISION" ||
            code === "LIFECYCLE_STATE_CONFLICT" ||
            code === "LIFECYCLE_ALREADY_IN_TARGET_STATE"
          ? "conflict"
          : code === "LIFECYCLE_REASON_REQUIRED"
            ? "validation"
            : "precondition_failed";
    super(category, code, message, details);
    this.name = "EvidenceLifecycleError";
    this.lifecycleCode = code;
  }
}
