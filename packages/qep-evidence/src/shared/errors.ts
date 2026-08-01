export type EvidenceErrorCategory =
  | "validation"
  | "precondition_failed"
  | "conflict"
  | "not_found"
  | "forbidden"
  | "invariant_violation"
  | "integrity_failed";

export class EvidenceDomainError extends Error {
  readonly category: EvidenceErrorCategory;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    category: EvidenceErrorCategory,
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "EvidenceDomainError";
    this.category = category;
    this.code = code;
    this.details = details;
  }
}

export class EvidenceValidationError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("validation", "EVIDENCE_VALIDATION", message, details);
    this.name = "EvidenceValidationError";
  }
}

export class EvidencePreconditionError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("precondition_failed", "EVIDENCE_PRECONDITION", message, details);
    this.name = "EvidencePreconditionError";
  }
}

export class EvidenceConflictError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("conflict", "EVIDENCE_CONFLICT", message, details);
    this.name = "EvidenceConflictError";
  }
}

export class EvidenceConcurrencyError extends EvidenceConflictError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(evidenceId: string, expectedRevision: number, actualRevision: number) {
    super(
      `Revision conflict for Evidence ${evidenceId}: expected ${expectedRevision}, found ${actualRevision}`,
      { evidenceId, expectedRevision, actualRevision },
    );
    this.name = "EvidenceConcurrencyError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export class EvidenceIntegrityFailedError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("integrity_failed", "EVIDENCE_INTEGRITY_FAILED", message, details);
    this.name = "EvidenceIntegrityFailedError";
  }
}

export class EvidenceInvariantViolationError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("invariant_violation", "EVIDENCE_INVARIANT", message, details);
    this.name = "EvidenceInvariantViolationError";
  }
}

export class EvidenceNotFoundError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("not_found", "EVIDENCE_NOT_FOUND", message, details);
    this.name = "EvidenceNotFoundError";
  }
}

/** Structural / command completeness failures at the Application boundary. */
export class EvidenceApplicationValidationError extends EvidenceDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("validation", "EVIDENCE_APPLICATION_VALIDATION", message, details);
    this.name = "EvidenceApplicationValidationError";
  }
}

/** Fail-closed authorisation denial — APZQEP-ENG-110E / L-02. */
export class EvidenceForbiddenError extends EvidenceDomainError {
  readonly outcome: "denied" | "indeterminate" | "unavailable" | "invalid_request";

  constructor(
    message: string,
    details?: Readonly<Record<string, unknown>> & {
      readonly outcome?: "denied" | "indeterminate" | "unavailable" | "invalid_request";
    },
  ) {
    super("forbidden", "EVIDENCE_FORBIDDEN", message, details);
    this.name = "EvidenceForbiddenError";
    this.outcome = details?.outcome ?? "denied";
  }
}

/**
 * Thrown by ENG-110C adapter skeletons — no real persistence authorised.
 * Infrastructure-facing; Application use-cases (ENG-110D+) MUST NOT treat this as success.
 */
export class PersistenceNotImplementedError extends Error {
  readonly code = "EVIDENCE_PERSISTENCE_NOT_IMPLEMENTED" as const;
  readonly adapterId: string;
  readonly operation: string;

  constructor(adapterId: string, operation: string) {
    super(
      `Persistence operation not implemented under ENG-110C: ${adapterId}.${operation}`,
    );
    this.name = "PersistenceNotImplementedError";
    this.adapterId = adapterId;
    this.operation = operation;
  }
}

/**
 * Storage Platform failures — APZQEP-120-S03.
 * Messages MUST NOT leak filesystem paths or provider internals to clients.
 */
export type EvidenceStorageErrorCode =
  | "STORAGE_NOT_FOUND"
  | "STORAGE_INVALID_REQUEST"
  | "STORAGE_CONFLICT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_FORBIDDEN"
  | "STORAGE_LIMIT_EXCEEDED"
  | "STORAGE_PROVIDER_UNKNOWN";

export class EvidenceStorageError extends Error {
  readonly code: EvidenceStorageErrorCode;
  readonly category:
    "not_found" | "validation" | "conflict" | "unavailable" | "forbidden";

  constructor(
    code: EvidenceStorageErrorCode,
    message: string,
    category?: EvidenceStorageError["category"],
  ) {
    super(message);
    this.name = "EvidenceStorageError";
    this.code = code;
    this.category =
      category ??
      (code === "STORAGE_NOT_FOUND"
        ? "not_found"
        : code === "STORAGE_CONFLICT"
          ? "conflict"
          : code === "STORAGE_UNAVAILABLE" || code === "STORAGE_PROVIDER_UNKNOWN"
            ? "unavailable"
            : code === "STORAGE_FORBIDDEN"
              ? "forbidden"
              : "validation");
  }
}
