import { PlatformServiceError } from "@apzhub/platform-service-contracts";

export function analyticsValidationError(
  correlationId: string,
  message: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "validation",
    code: "INVALID_REQUEST_CONTEXT",
    message,
    correlationId: correlationId || "missing-correlation",
    retryable: false,
  });
}

export function analyticsNotFoundError(
  correlationId: string,
  resource: string,
  id: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "not_found",
    code: "NOT_FOUND",
    message: `${resource} not found: ${id}`,
    correlationId,
    retryable: false,
  });
}

export function analyticsAuthorizationError(
  correlationId: string,
  operation: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "authorization",
    code: "PERMISSION_DENIED",
    message: `Analytics permission denied for operation: ${operation}`,
    correlationId,
    retryable: false,
  });
}

export function analyticsConfigurationError(
  correlationId: string,
  message: string,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "configuration",
    code: "PROVIDER_UNAVAILABLE",
    message,
    correlationId,
    retryable: false,
  });
}
