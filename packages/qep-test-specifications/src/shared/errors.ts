export class TestSpecificationDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TestSpecificationDomainError";
    this.code = code;
  }
}

export class TestSpecificationInvariantViolation extends TestSpecificationDomainError {
  constructor(message: string) {
    super("INVARIANT_VIOLATION", message);
    this.name = "TestSpecificationInvariantViolation";
  }
}

export class TestSpecificationConflictError extends TestSpecificationDomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "TestSpecificationConflictError";
  }
}

export class TestSpecificationNotFoundError extends TestSpecificationDomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "TestSpecificationNotFoundError";
  }
}

export class TestSpecificationForbiddenError extends TestSpecificationDomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
    this.name = "TestSpecificationForbiddenError";
  }
}

export class TestSpecificationRevisionConflictError extends TestSpecificationDomainError {
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(id: string, expectedRevision: number, actualRevision: number) {
    super(
      "REVISION_CONFLICT",
      `Revision conflict for Test Specification ${id}: expected ${expectedRevision}, found ${actualRevision}`,
    );
    this.name = "TestSpecificationRevisionConflictError";
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}
