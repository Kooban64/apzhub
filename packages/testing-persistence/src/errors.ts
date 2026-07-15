export type PersistenceErrorCode =
  "NOT_FOUND" | "REVISION_CONFLICT" | "TENANT_MISMATCH" | "UNAUTHORIZED" | "VALIDATION";

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: PersistenceErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "PersistenceError";
    this.code = code;
    this.details = details;
  }
}

export function notFoundError(entityKind: string, id: string): PersistenceError {
  return new PersistenceError("NOT_FOUND", `${entityKind} not found: ${id}`, {
    entityKind,
    id,
  });
}

export function revisionConflictError(
  entityKind: string,
  id: string,
  expected: number,
  actual: number,
): PersistenceError {
  return new PersistenceError(
    "REVISION_CONFLICT",
    `${entityKind} revision conflict for ${id}: expected ${expected}, actual ${actual}`,
    { entityKind, id, expected, actual },
  );
}

export function tenantMismatchError(
  entityKind: string,
  id: string,
  tenantId: string,
): PersistenceError {
  return new PersistenceError(
    "TENANT_MISMATCH",
    `${entityKind} tenant mismatch for ${id}`,
    { entityKind, id, tenantId },
  );
}

export function unauthorizedError(
  permission: string,
  actorUserId: string,
): PersistenceError {
  return new PersistenceError(
    "UNAUTHORIZED",
    `Missing permission ${permission} for actor ${actorUserId}`,
    { permission, actorUserId },
  );
}

export function validationError(
  message: string,
  details?: Readonly<Record<string, unknown>>,
): PersistenceError {
  return new PersistenceError("VALIDATION", message, details);
}
