export type ExecutionErrorCategory =
  | "validation"
  | "precondition_failed"
  | "conflict"
  | "not_found"
  | "forbidden"
  | "invariant_violation";

export class ExecutionDomainError extends Error {
  readonly category: ExecutionErrorCategory;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    category: ExecutionErrorCategory,
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "ExecutionDomainError";
    this.category = category;
    this.code = code;
    this.details = details;
  }
}

export class ExecutionValidationError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("validation", "EXECUTION_VALIDATION", message, details);
    this.name = "ExecutionValidationError";
  }
}

export class ExecutionPreconditionError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("precondition_failed", "EXECUTION_PRECONDITION", message, details);
    this.name = "ExecutionPreconditionError";
  }
}

export class ExecutionConflictError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("conflict", "EXECUTION_CONFLICT", message, details);
    this.name = "ExecutionConflictError";
  }
}

export class ExecutionNotFoundError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("not_found", "EXECUTION_NOT_FOUND", message, details);
    this.name = "ExecutionNotFoundError";
  }
}

export class ExecutionForbiddenError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("forbidden", "EXECUTION_FORBIDDEN", message, details);
    this.name = "ExecutionForbiddenError";
  }
}

export class ExecutionInvariantViolationError extends ExecutionDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("invariant_violation", "EXECUTION_INVARIANT", message, details);
    this.name = "ExecutionInvariantViolationError";
  }
}

export class ExecutionConcurrencyError extends ExecutionConflictError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(executionId: string, expectedRevision: number, actualRevision: number) {
    super(
      `Revision conflict for Test Execution ${executionId}: expected ${expectedRevision}, found ${actualRevision}`,
      { executionId, expectedRevision, actualRevision },
    );
    this.name = "ExecutionConcurrencyError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}
