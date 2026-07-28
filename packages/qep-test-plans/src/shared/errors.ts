export class PlanDomainError extends Error {
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "PlanDomainError";
    this.code = code;
    this.details = details;
  }
}

export class InvalidPlanStateError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("INVALID_PLAN_STATE", message, details);
    this.name = "InvalidPlanStateError";
  }
}

export class PlanInvariantViolationError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("PLAN_INVARIANT_VIOLATION", message, details);
    this.name = "PlanInvariantViolationError";
  }
}

export class PlanValidationError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("PLAN_VALIDATION", message, details);
    this.name = "PlanValidationError";
  }
}

export class PlanReadinessError extends PlanDomainError {
  readonly reasons: readonly string[];

  constructor(reasons: readonly string[]) {
    super(
      "PLAN_READINESS",
      `Plan is not ready for execution: ${reasons.join(", ")}`,
      { reasons },
    );
    this.name = "PlanReadinessError";
    this.reasons = reasons;
  }
}

export class PlanConcurrencyError extends PlanDomainError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(planId: string, expectedRevision: number, actualRevision: number) {
    super(
      "PLAN_CONCURRENCY",
      `Revision conflict for Test Plan ${planId}: expected ${expectedRevision}, found ${actualRevision}`,
      { expectedRevision, actualRevision },
    );
    this.name = "PlanConcurrencyError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export class PlanLineageError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("PLAN_LINEAGE", message, details);
    this.name = "PlanLineageError";
  }
}

/**
 * Infrastructure/Application-layer errors (APZQEP-ENG-060B). These are additive
 * error taxonomy for the persistence + orchestration layers — they do not alter
 * certified Domain command/lifecycle behaviour, invariants, or events.
 */
export class PlanNotFoundError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("NOT_FOUND", message, details);
    this.name = "PlanNotFoundError";
  }
}

export class PlanForbiddenError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("FORBIDDEN", message, details);
    this.name = "PlanForbiddenError";
  }
}

export class PlanConflictError extends PlanDomainError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super("CONFLICT", message, details);
    this.name = "PlanConflictError";
  }
}
