import { createIntegrationError } from "./factory";
import type { IntegrationError } from "./types";

export interface SdkErrorContext {
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, string>>;
}

export function invalidConnectionConfigurationError(
  context: SdkErrorContext,
  message: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.connection.invalid_configuration",
    message,
    correlationId: context.correlationId,
    details: context.details,
  });
}

export function missingCredentialsError(
  context: SdkErrorContext,
  message = "Required credentials are missing",
): IntegrationError {
  return createIntegrationError({
    category: "authentication",
    code: "integration.auth.missing_credentials",
    message,
    correlationId: context.correlationId,
    details: context.details,
  });
}

export function invalidCredentialsError(
  context: SdkErrorContext,
  message = "Credentials failed validation",
): IntegrationError {
  return createIntegrationError({
    category: "authentication",
    code: "integration.auth.invalid_credentials",
    message,
    correlationId: context.correlationId,
    details: context.details,
  });
}

export function duplicateConnectionError(
  context: SdkErrorContext,
  connectionId: string,
): IntegrationError {
  return createIntegrationError({
    category: "conflict",
    code: "integration.connection.duplicate",
    message: `Connection "${connectionId}" is already registered`,
    correlationId: context.correlationId,
    details: { connectionId },
  });
}

export function connectionNotFoundError(
  context: SdkErrorContext,
  connectionId: string,
): IntegrationError {
  return createIntegrationError({
    category: "not_found",
    code: "integration.connection.not_found",
    message: `Connection "${connectionId}" was not found`,
    correlationId: context.correlationId,
    details: { connectionId },
  });
}

export function tenantMismatchError(
  context: SdkErrorContext,
  message: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.connection.tenant_mismatch",
    message,
    correlationId: context.correlationId,
    details: context.details,
  });
}

export function integrationMismatchError(
  context: SdkErrorContext,
  message: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.connection.integration_mismatch",
    message,
    correlationId: context.correlationId,
    details: context.details,
  });
}

export function invalidIntegrationLifecycleTransitionError(
  context: SdkErrorContext,
  from: string,
  to: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.lifecycle.invalid_transition",
    message: `Cannot transition integration lifecycle from "${from}" to "${to}"`,
    correlationId: context.correlationId,
    details: { from, to },
  });
}

export function invalidLifecycleTransitionError(
  context: SdkErrorContext,
  from: string,
  to: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.connection.invalid_lifecycle_transition",
    message: `Cannot transition connection lifecycle from "${from}" to "${to}"`,
    correlationId: context.correlationId,
    details: { from, to },
  });
}

export function authenticationFailedError(
  context: SdkErrorContext,
  message = "Authentication failed",
): IntegrationError {
  return createIntegrationError({
    category: "authentication",
    code: "integration.auth.authentication_failed",
    message,
    correlationId: context.correlationId,
    retryable: false,
    details: context.details,
  });
}

export function secretProviderUnavailableError(
  context: SdkErrorContext,
  message = "Secret provider is unavailable",
): IntegrationError {
  return createIntegrationError({
    category: "internal",
    code: "integration.auth.secret_provider_unavailable",
    message,
    correlationId: context.correlationId,
    retryable: true,
    details: context.details,
  });
}

export function unsupportedAuthenticationModeError(
  context: SdkErrorContext,
  mode: string,
): IntegrationError {
  return createIntegrationError({
    category: "validation",
    code: "integration.auth.unsupported_mode",
    message: `Authentication mode "${mode}" is not supported in this SDK release`,
    correlationId: context.correlationId,
    details: { mode },
  });
}
