export class TraceDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TraceDomainError";
    this.code = code;
  }
}

export class TraceInvariantViolation extends TraceDomainError {
  constructor(message: string) {
    super("INVARIANT_VIOLATION", message);
    this.name = "TraceInvariantViolation";
  }
}

export class TraceConflictError extends TraceDomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "TraceConflictError";
  }
}

export class TraceNotFoundError extends TraceDomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "TraceNotFoundError";
  }
}

export class TraceForbiddenError extends TraceDomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
    this.name = "TraceForbiddenError";
  }
}

export class TraceRevisionConflictError extends TraceDomainError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(id: string, expectedRevision: number, actualRevision: number) {
    super(
      "REVISION_CONFLICT",
      `Revision conflict for Trace Link ${id}: expected ${expectedRevision}, found ${actualRevision}`,
    );
    this.name = "TraceRevisionConflictError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}
