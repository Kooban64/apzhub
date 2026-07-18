import { createIntegrationError } from "../errors/factory";
import type { IntegrationError } from "../errors/types";
import type { MappingError } from "./types";

export interface MappingErrorContext {
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, string>>;
}

function toMappingError(
  category: MappingError["category"],
  code: string,
  message: string,
  context: MappingErrorContext,
  retryable = false,
): MappingError {
  return {
    category,
    code,
    message,
    retryable,
    correlationId: context.correlationId,
    details: context.details,
  };
}

export function createMappingError(
  code: string,
  message: string,
  context: MappingErrorContext,
  options: {
    readonly category?: MappingError["category"];
    readonly retryable?: boolean;
  } = {},
): MappingError {
  return toMappingError(
    options.category ?? "mapping",
    code,
    message,
    context,
    options.retryable ?? false,
  );
}

export function mappingValidationError(
  context: MappingErrorContext,
  message: string,
): MappingError {
  return toMappingError(
    "validation",
    "integration.mapping.validation_failed",
    message,
    context,
  );
}

export function mappingProviderNotFoundError(
  context: MappingErrorContext,
  providerId: string,
): MappingError {
  return toMappingError(
    "mapping",
    "integration.mapping.provider_not_found",
    `Mapping provider "${providerId}" was not found`,
    { ...context, details: { ...context.details, providerId } },
  );
}

export function mappingDefinitionNotFoundError(
  context: MappingErrorContext,
  entityType: string,
  profile: string,
  direction: string,
): MappingError {
  return toMappingError(
    "mapping",
    "integration.mapping.definition_not_found",
    `No mapping definition for entity "${entityType}" profile "${profile}" direction "${direction}"`,
    {
      ...context,
      details: { ...context.details, entityType, profile, direction },
    },
  );
}

export function mappingDuplicateProviderError(
  context: MappingErrorContext,
  providerId: string,
): MappingError {
  return toMappingError(
    "validation",
    "integration.mapping.duplicate_provider",
    `Mapping provider "${providerId}" is already registered`,
    { ...context, details: { ...context.details, providerId } },
  );
}

export function mappingEnumUnknownError(
  context: MappingErrorContext,
  value: string,
): MappingError {
  return toMappingError(
    "mapping",
    "integration.mapping.unknown_enum_value",
    "Unknown enum value could not be mapped",
    { ...context, details: { ...context.details, value } },
  );
}

export function mappingExecutionError(
  context: MappingErrorContext,
  message = "Mapping execution failed",
): MappingError {
  return toMappingError(
    "mapping",
    "integration.mapping.execution_failed",
    message,
    context,
  );
}

/** Convert MappingError → IntegrationError (category "mapping" or "validation"). */
export function mappingErrorToIntegrationError(error: MappingError): IntegrationError {
  return createIntegrationError({
    category: error.category === "validation" ? "validation" : "mapping",
    code: error.code,
    message: error.message,
    correlationId: error.correlationId,
    retryable: error.retryable,
    details: error.details,
  });
}

/** Safely map unknown thrown values to MappingError — no provider internals leaked. */
export function mapUnknownToMappingError(
  error: unknown,
  correlationId: string,
): MappingError {
  if (
    typeof error === "object" &&
    error !== null &&
    "category" in error &&
    "code" in error &&
    "message" in error &&
    "correlationId" in error
  ) {
    const candidate = error as MappingError;
    if (
      (candidate.category === "mapping" || candidate.category === "validation") &&
      typeof candidate.code === "string" &&
      typeof candidate.message === "string"
    ) {
      return {
        category: candidate.category,
        code: candidate.code,
        message: candidate.message,
        retryable: candidate.retryable ?? false,
        correlationId: candidate.correlationId || correlationId,
        details: candidate.details,
      };
    }
  }

  if (error instanceof Error) {
    const safe =
      error.message.includes("plane") ||
      error.message.includes("zammad") ||
      error.message.includes("vendor")
        ? "Mapping execution failed"
        : sanitizeMappingMessage(error.message);
    return mappingExecutionError({ correlationId }, safe);
  }

  return mappingExecutionError({ correlationId });
}

function sanitizeMappingMessage(message: string, maxLength = 200): string {
  return message
    .trim()
    .slice(0, maxLength)
    .replace(/[^\u0020-\u007E]/g, " ");
}

export function isMappingError(value: unknown): value is MappingError {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<MappingError>;
  return (
    (candidate.category === "mapping" || candidate.category === "validation") &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    typeof candidate.correlationId === "string"
  );
}
