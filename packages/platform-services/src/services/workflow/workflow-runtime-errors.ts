import {
  PlatformServiceError,
  type PlatformServiceErrorCode,
} from "@apzhub/platform-service-contracts";

export function workflowAuthorizationError(
  correlationId: string,
  operation: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "authorization",
    code: "FORBIDDEN",
    message: `Missing workflow permission for operation: ${operation}`,
    correlationId,
    retryable: false,
    details: { operation },
  });
}

export function workflowNotFoundError(
  correlationId: string,
  resourceType: string,
  resourceId: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "not_found",
    code: "NOT_FOUND" as PlatformServiceErrorCode,
    message: `${resourceType} not found: ${resourceId}`,
    correlationId,
    retryable: false,
    details: { resourceType, resourceId },
  });
}

export function workflowValidationError(
  correlationId: string,
  message: string,
  details?: Readonly<Record<string, string>>,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "validation",
    code: "VALIDATION_FAILED",
    message,
    correlationId,
    retryable: false,
    details,
  });
}

export function workflowConflictError(
  correlationId: string,
  message: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "conflict",
    code: "CONFLICT",
    message,
    correlationId,
    retryable: false,
  });
}
