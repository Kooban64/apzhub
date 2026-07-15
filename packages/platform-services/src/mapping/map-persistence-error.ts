import { PlatformServiceError, isPlatformServiceError } from "@apzhub/platform-service-contracts";

function readErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (
      typeof current === "object" &&
      current !== null &&
      "code" in current &&
      typeof (current as { code: unknown }).code === "string"
    ) {
      const code = (current as { code: string }).code;
      if (code.length > 0) {
        return code;
      }
    }
    if (typeof current === "object" && current !== null && "cause" in current) {
      current = (current as { cause: unknown }).cause;
      continue;
    }
    break;
  }
  return undefined;
}

function readErrorMessage(error: unknown): string {
  let current: unknown = error;
  const parts: string[] = [];
  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (current instanceof Error && current.message) {
      parts.push(current.message);
    }
    if (typeof current === "object" && current !== null && "cause" in current) {
      current = (current as { cause: unknown }).cause;
      continue;
    }
    break;
  }
  return parts.join(" | ");
}

/**
 * Translates database / ORM failures into platform mapping error codes.
 * Never leaks SQL, connection strings, table names, or credentials.
 */
export function translateMappingPersistenceError(
  error: unknown,
  operation: string,
): PlatformServiceError {
  if (isPlatformServiceError(error)) {
    return error;
  }

  const pgCode = readErrorCode(error);
  const combinedMessage = readErrorMessage(error);

  // Unique violation (including Drizzle-wrapped pg errors via cause)
  if (
    pgCode === "23505" ||
    /duplicate key value violates unique constraint/i.test(combinedMessage)
  ) {
    return new PlatformServiceError({
      category: "conflict",
      code: "MAPPING_CONFLICT",
      message: "Entity mapping conflicts with an existing binding",
      correlationId: "mapping-store",
      retryable: false,
      details: { operation, classification: "duplicate_mapping" },
    });
  }

  // Check violation / invalid data
  if (pgCode === "23514" || pgCode === "22P02" || pgCode === "23502") {
    return new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: "Invalid entity mapping data",
      correlationId: "mapping-store",
      retryable: false,
      details: { operation, classification: "invalid_mapping_data" },
    });
  }

  // Connection / unavailable
  if (
    pgCode === "57P01" ||
    pgCode === "57P02" ||
    pgCode === "57P03" ||
    pgCode === "08000" ||
    pgCode === "08003" ||
    pgCode === "08006" ||
    pgCode === "ECONNREFUSED" ||
    /ECONNREFUSED|ENOTFOUND|connection terminated|timeout/i.test(combinedMessage)
  ) {
    return new PlatformServiceError({
      category: "temporary_failure",
      code: "PERSISTENCE_UNAVAILABLE",
      message: "Entity mapping persistence is temporarily unavailable",
      correlationId: "mapping-store",
      retryable: true,
      details: { operation, classification: "database_unavailable" },
    });
  }

  // Serialization / transaction abort
  if (pgCode === "40001" || pgCode === "40P01" || pgCode === "25P02") {
    return new PlatformServiceError({
      category: "temporary_failure",
      code: "MAPPING_PERSISTENCE_FAILED",
      message: "Entity mapping transaction failed",
      correlationId: "mapping-store",
      retryable: true,
      details: { operation, classification: "transaction_failure" },
    });
  }

  return new PlatformServiceError({
    category: "system",
    code: "MAPPING_PERSISTENCE_FAILED",
    message: "Entity mapping persistence failed",
    correlationId: "mapping-store",
    retryable: false,
    details: { operation, classification: "persistence_failure" },
  });
}

/** Safe diagnostic cause for structured logging — never includes secrets. */
export function safePersistenceDiagnosticCause(error: unknown): string {
  if (isPlatformServiceError(error)) {
    return `${error.code}:${error.message}`;
  }
  const code = readErrorCode(error);
  if (code) {
    return `pg:${code}`;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return "unknown";
}
