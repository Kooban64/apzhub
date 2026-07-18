import { isIntegrationError } from "@apzhub/integration-sdk/errors";
import {
  PlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
} from "@apzhub/platform-service-contracts";
import type { IntegrationError } from "@apzhub/integration-sdk/errors";
import { IntegrationSdkError } from "@apzhub/integration-sdk/errors";

const INTEGRATION_TO_PLATFORM_CATEGORY: Readonly<
  Record<string, PlatformServiceErrorCategory>
> = {
  authentication: "authentication",
  authorization: "authorization",
  validation: "validation",
  not_found: "not_found",
  conflict: "conflict",
  rate_limited: "temporary_failure",
  vendor_unavailable: "integration",
  timeout: "temporary_failure",
  mapping: "configuration",
  provisioning: "configuration",
  version_incompatible: "configuration",
  not_implemented: "configuration",
  internal: "system",
};

const INTEGRATION_TO_PLATFORM_CODE: Readonly<Record<string, PlatformServiceErrorCode>> =
  {
    authentication: "UNAUTHENTICATED",
    authorization: "FORBIDDEN",
    validation: "VALIDATION_FAILED",
    not_found: "NOT_FOUND",
    conflict: "CONFLICT",
    rate_limited: "TEMPORARY_FAILURE",
    vendor_unavailable: "INTEGRATION_UNAVAILABLE",
    timeout: "TEMPORARY_FAILURE",
    mapping: "CONFIGURATION_ERROR",
    provisioning: "CONFIGURATION_ERROR",
    version_incompatible: "CONFIGURATION_ERROR",
    not_implemented: "CONFIGURATION_ERROR",
    internal: "INTERNAL_ERROR",
  };

function mapIntegrationError(
  error: IntegrationError,
  correlationId: string,
): PlatformServiceError {
  const category = INTEGRATION_TO_PLATFORM_CATEGORY[error.category] ?? "integration";
  const code = INTEGRATION_TO_PLATFORM_CODE[error.category] ?? "CONNECTOR_ERROR";

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: error.retryable,
  });
}

/** Converts adapter/integration failures into vendor-neutral platform service errors. */
export function mapProviderError(error: unknown, correlationId: string): never {
  if (error instanceof PlatformServiceError) {
    throw error;
  }

  if (error instanceof IntegrationSdkError) {
    throw mapIntegrationError(error.integrationError, correlationId);
  }

  if (isIntegrationError(error)) {
    throw mapIntegrationError(error, correlationId);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "object" &&
    (error as { error: IntegrationError }).error !== null &&
    "category" in (error as { error: IntegrationError }).error
  ) {
    throw mapIntegrationError(
      (error as { error: IntegrationError }).error,
      correlationId,
    );
  }

  throw new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Platform service operation failed",
    correlationId,
    retryable: false,
  });
}

/** Wraps provider calls to normalise error propagation. */
export async function withProviderErrorMapping<T>(
  correlationId: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    mapProviderError(error, correlationId);
  }
}

/** Throws when a provider does not yet support an operation. */
export function throwUnsupportedProviderOperation(
  correlationId: string,
  operation: string,
): never {
  throw new PlatformServiceError({
    category: "configuration",
    code: "CONFIGURATION_ERROR",
    message: `Provider does not support operation: ${operation}`,
    correlationId,
    retryable: false,
    details: { operation },
  });
}

/** Throws when no provider is registered for a capability. */
export function throwMissingProvider(correlationId: string, capability: string): never {
  throw new PlatformServiceError({
    category: "configuration",
    code: "CONFIGURATION_ERROR",
    message: `No provider registered for capability: ${capability}`,
    correlationId,
    retryable: false,
    details: { capability },
  });
}
