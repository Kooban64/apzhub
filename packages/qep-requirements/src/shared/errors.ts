export class QepDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "QepDomainError";
    this.code = code;
  }
}

export class QepInvariantViolation extends QepDomainError {
  constructor(message: string) {
    super("INVARIANT_VIOLATION", message);
    this.name = "QepInvariantViolation";
  }
}

export class QepNotFoundError extends QepDomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "QepNotFoundError";
  }
}

export class QepForbiddenError extends QepDomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
    this.name = "QepForbiddenError";
  }
}

export class QepRevisionConflictError extends QepDomainError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(id: string, expectedRevision: number, actualRevision: number) {
    super(
      "REVISION_CONFLICT",
      `Revision conflict for requirement ${id}: expected ${expectedRevision}, found ${actualRevision}`,
    );
    this.name = "QepRevisionConflictError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export class QepConflictError extends QepDomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "QepConflictError";
  }
}

export class QepRelationshipNotFoundError extends QepDomainError {
  constructor(message: string) {
    super("RELATIONSHIP_NOT_FOUND", message);
    this.name = "QepRelationshipNotFoundError";
  }
}

export class QepLifecycleTransitionError extends QepDomainError {
  constructor(message: string) {
    super("LIFECYCLE_TRANSITION", message);
    this.name = "QepLifecycleTransitionError";
  }
}

export class QepNoContentChangeError extends QepDomainError {
  constructor(message = "Requirement content has not changed") {
    super("NO_CONTENT_CHANGE", message);
    this.name = "QepNoContentChangeError";
  }
}

export class QepVersionNotFoundError extends QepDomainError {
  constructor(message: string) {
    super("VERSION_NOT_FOUND", message);
    this.name = "QepVersionNotFoundError";
  }
}

export class QepVersionIntegrityError extends QepDomainError {
  constructor(message: string) {
    super("VERSION_INTEGRITY", message);
    this.name = "QepVersionIntegrityError";
  }
}

export class QepInvalidChangeReasonError extends QepDomainError {
  constructor(message: string) {
    super("INVALID_CHANGE_REASON", message);
    this.name = "QepInvalidChangeReasonError";
  }
}

export class QepUnsupportedSnapshotSchemaError extends QepDomainError {
  constructor(message: string) {
    super("UNSUPPORTED_SNAPSHOT_SCHEMA", message);
    this.name = "QepUnsupportedSnapshotSchemaError";
  }
}

export class QepInvalidVersionComparisonError extends QepDomainError {
  constructor(message: string) {
    super("INVALID_VERSION_COMPARISON", message);
    this.name = "QepInvalidVersionComparisonError";
  }
}

export class QepBaselineNotFoundError extends QepDomainError {
  constructor(message: string) {
    super("BASELINE_NOT_FOUND", message);
    this.name = "QepBaselineNotFoundError";
  }
}

export class QepBaselineAlreadyLockedError extends QepDomainError {
  constructor(message = "Baseline is already locked") {
    super("BASELINE_ALREADY_LOCKED", message);
    this.name = "QepBaselineAlreadyLockedError";
  }
}

export class QepBaselineArchivedError extends QepDomainError {
  constructor(message = "Baseline is archived") {
    super("BASELINE_ARCHIVED", message);
    this.name = "QepBaselineArchivedError";
  }
}

export class QepBaselineDuplicateMembershipError extends QepDomainError {
  constructor(message: string) {
    super("BASELINE_DUPLICATE_MEMBERSHIP", message);
    this.name = "QepBaselineDuplicateMembershipError";
  }
}

export class QepBaselineIntegrityError extends QepDomainError {
  constructor(message: string) {
    super("BASELINE_INTEGRITY", message);
    this.name = "QepBaselineIntegrityError";
  }
}

export class QepBaselineInvalidStateError extends QepDomainError {
  constructor(message: string) {
    super("BASELINE_INVALID_STATE", message);
    this.name = "QepBaselineInvalidStateError";
  }
}
