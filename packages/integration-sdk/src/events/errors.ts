import { createIntegrationError } from "../errors/factory";
import type { IntegrationError, IntegrationErrorCategory } from "../errors/types";

export type EventErrorCategory =
  | "validation"
  | "authentication"
  | "authorization"
  | "conflict"
  | "not_found"
  | "not_implemented"
  | "rate_limited"
  | "timeout"
  | "vendor_unavailable"
  | "internal"
  | "replay"
  | "deduplication"
  | "verification"
  | "polling";

export interface EventErrorContext {
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, string>>;
}

export interface EventError {
  readonly category: EventErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, string>>;
}

const CATEGORY_TO_INTEGRATION: Readonly<
  Record<EventErrorCategory, IntegrationErrorCategory>
> = {
  validation: "validation",
  authentication: "authentication",
  authorization: "authorization",
  conflict: "conflict",
  not_found: "not_found",
  not_implemented: "not_implemented",
  rate_limited: "rate_limited",
  timeout: "timeout",
  vendor_unavailable: "vendor_unavailable",
  internal: "internal",
  replay: "conflict",
  deduplication: "conflict",
  verification: "authentication",
  polling: "internal",
};

export function createEventError(
  category: EventErrorCategory,
  code: string,
  message: string,
  context: EventErrorContext,
  retryable = false,
): EventError {
  return {
    category,
    code,
    message,
    retryable,
    correlationId: context.correlationId,
    details: context.details,
  };
}

export function eventErrorToIntegrationError(error: EventError): IntegrationError {
  return createIntegrationError({
    category: CATEGORY_TO_INTEGRATION[error.category],
    code: error.code,
    message: error.message,
    correlationId: error.correlationId,
    retryable: error.retryable,
    details: error.details,
  });
}

export function mapEventErrorCategory(
  category: EventErrorCategory,
): IntegrationErrorCategory {
  return CATEGORY_TO_INTEGRATION[category];
}

export function isEventError(value: unknown): value is EventError {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.category === "string" &&
    typeof record.code === "string" &&
    typeof record.message === "string" &&
    typeof record.correlationId === "string" &&
    typeof record.retryable === "boolean"
  );
}

export function unsupportedWebhookOperationError(
  context: EventErrorContext,
  operation: string,
): EventError {
  return createEventError(
    "not_implemented",
    "integration.events.webhook.unsupported_operation",
    `Webhook operation "${operation}" is not supported by this adapter`,
    { ...context, details: { ...context.details, operation } },
  );
}

export function webhookVerificationFailedError(
  context: EventErrorContext,
  message = "Webhook signature verification failed",
): EventError {
  return createEventError(
    "verification",
    "integration.events.webhook.verification_failed",
    message,
    context,
  );
}

export function webhookReplayRejectedError(
  context: EventErrorContext,
  message = "Webhook delivery rejected by replay protection",
): EventError {
  return createEventError(
    "replay",
    "integration.events.webhook.replay_rejected",
    message,
    context,
  );
}

export function eventDuplicateError(
  context: EventErrorContext,
  deduplicationKey: string,
): EventError {
  return createEventError(
    "deduplication",
    "integration.events.duplicate",
    "Duplicate source event detected",
    { ...context, details: { ...context.details, deduplicationKey } },
  );
}

export function pollingLimitExceededError(
  context: EventErrorContext,
  limit: string,
): EventError {
  return createEventError(
    "polling",
    "integration.events.polling.limit_exceeded",
    `Polling execution limit exceeded: ${limit}`,
    { ...context, details: { ...context.details, limit } },
    true,
  );
}

export function pollingCancelledError(context: EventErrorContext): EventError {
  return createEventError(
    "polling",
    "integration.events.polling.cancelled",
    "Polling execution was cancelled",
    context,
    true,
  );
}

export function pollingStallDetectedError(context: EventErrorContext): EventError {
  return createEventError(
    "polling",
    "integration.events.polling.stall_detected",
    "Polling stall or duplicate page detected",
    context,
    true,
  );
}

export function pollingCheckpointError(
  context: EventErrorContext,
  message: string,
): EventError {
  return createEventError(
    "polling",
    "integration.events.polling.checkpoint_error",
    message,
    context,
  );
}

export function eventValidationError(
  context: EventErrorContext,
  message: string,
): EventError {
  return createEventError(
    "validation",
    "integration.events.validation_failed",
    message,
    context,
  );
}

export function schemaIncompatibleError(
  context: EventErrorContext,
  expected: string,
  actual: string,
): EventError {
  return createEventError(
    "validation",
    "integration.events.schema_incompatible",
    `Event schema incompatible: expected ${expected}, got ${actual}`,
    { ...context, details: { ...context.details, expected, actual } },
  );
}
