import type { IntegrationRequestContext } from "../../types/context";
import type { EventError } from "../errors";
import { unsupportedWebhookOperationError } from "../errors";

export const WEBHOOK_MANAGER_OPERATIONS = [
  "list",
  "get",
  "create",
  "update",
  "enable",
  "disable",
  "delete",
  "validate",
] as const;

export type WebhookManagerOperation = (typeof WEBHOOK_MANAGER_OPERATIONS)[number];

export type WebhookLifecycleStatus =
  "pending" | "active" | "disabled" | "failed" | "deleted" | "unknown";

/** Secret stored by reference only — never raw secret values. */
export interface WebhookSecretRef {
  readonly credentialRef: string;
  readonly algorithm?: string;
}

export interface WebhookEndpointDefinition {
  readonly callbackUrl: string;
  readonly requireHttps?: boolean;
  readonly secretRef?: WebhookSecretRef;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface WebhookDefinition {
  readonly id: string;
  readonly integrationId: string;
  readonly providerId: string;
  readonly name?: string;
  readonly status: WebhookLifecycleStatus;
  readonly eventTypes: readonly string[];
  readonly endpoint: WebhookEndpointDefinition;
  readonly secretPresent: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface WebhookRegistrationRequest {
  readonly callbackUrl: string;
  readonly eventTypes: readonly string[];
  readonly name?: string;
  readonly enabled?: boolean;
  readonly secretRef?: WebhookSecretRef;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface WebhookUpdateRequest {
  readonly callbackUrl?: string;
  readonly eventTypes?: readonly string[];
  readonly name?: string;
  readonly enabled?: boolean;
  readonly secretRef?: WebhookSecretRef;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface WebhookRegistrationResult {
  readonly ok: boolean;
  readonly definition?: WebhookDefinition;
  readonly issues?: readonly string[];
  readonly error?: EventError;
}

export interface WebhookValidationOutcome {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export interface WebhookListOptions {
  readonly status?: WebhookLifecycleStatus;
  readonly limit?: number;
}

/**
 * Vendor-neutral webhook lifecycle management contract.
 * Adapters implement this (or wrap existing services via `asWebhookManager`).
 */
export interface WebhookManager {
  list(
    context: IntegrationRequestContext,
    options?: WebhookListOptions,
  ): Promise<readonly WebhookDefinition[]>;

  get(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<WebhookDefinition>;

  create(
    context: IntegrationRequestContext,
    request: WebhookRegistrationRequest,
  ): Promise<WebhookRegistrationResult>;

  update(
    context: IntegrationRequestContext,
    webhookId: string,
    request: WebhookUpdateRequest,
  ): Promise<WebhookRegistrationResult>;

  enable(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<WebhookDefinition>;

  disable(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<WebhookDefinition>;

  delete(context: IntegrationRequestContext, webhookId: string): Promise<void>;

  validate(
    context: IntegrationRequestContext,
    request: WebhookRegistrationRequest | WebhookUpdateRequest,
  ): Promise<WebhookValidationOutcome>;

  supportedOperations(): readonly WebhookManagerOperation[];
}

export function isWebhookOperationSupported(
  manager: WebhookManager,
  operation: WebhookManagerOperation,
): boolean {
  return manager.supportedOperations().includes(operation);
}

export async function assertWebhookOperationSupported(
  manager: WebhookManager,
  operation: WebhookManagerOperation,
  correlationId: string,
): Promise<void> {
  if (!isWebhookOperationSupported(manager, operation)) {
    throw unsupportedWebhookOperationError({ correlationId }, operation);
  }
}
