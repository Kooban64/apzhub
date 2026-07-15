import type { IntegrationError, IntegrationErrorCategory } from "./types";

export interface CreateIntegrationErrorInput {
  readonly category: IntegrationErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly correlationId: string;
  readonly retryable?: boolean;
  readonly vendorStatusCode?: number;
  readonly details?: Readonly<Record<string, string>>;
}

export function createIntegrationError(
  input: CreateIntegrationErrorInput,
): IntegrationError {
  return {
    category: input.category,
    code: input.code,
    message: input.message,
    retryable: input.retryable ?? false,
    correlationId: input.correlationId,
    vendorStatusCode: input.vendorStatusCode,
    details: input.details,
  };
}

export function createNotImplementedIntegrationError(
  operation: string,
  correlationId: string,
): IntegrationError {
  return createIntegrationError({
    category: "not_implemented",
    code: "integration.sdk.not_implemented",
    message: `${operation} is not implemented in this SDK release`,
    correlationId,
    retryable: false,
  });
}
