export class VerificationDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "VerificationDomainError";
    this.code = code;
  }
}

export class VerificationInvariantViolation extends VerificationDomainError {
  constructor(message: string) {
    super("INVARIANT_VIOLATION", message);
    this.name = "VerificationInvariantViolation";
  }
}

export class VerificationConflictError extends VerificationDomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "VerificationConflictError";
  }
}

export class VerificationNotFoundError extends VerificationDomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "VerificationNotFoundError";
  }
}

export class VerificationForbiddenError extends VerificationDomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
    this.name = "VerificationForbiddenError";
  }
}

export class VerificationRevisionConflictError extends VerificationDomainError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(id: string, expectedRevision: number, actualRevision: number) {
    super(
      "REVISION_CONFLICT",
      `Revision conflict for Verification ${id}: expected ${expectedRevision}, found ${actualRevision}`,
    );
    this.name = "VerificationRevisionConflictError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}
