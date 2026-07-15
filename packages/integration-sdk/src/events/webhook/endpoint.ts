import type { WebhookEndpointDefinition, WebhookSecretRef } from "./types";
import { validateWebhookEndpoint } from "./management";

export interface WebhookEndpoint {
  readonly id: string;
  readonly definition: WebhookEndpointDefinition;
  readonly integrationId: string;
  readonly providerId: string;
  readonly active: boolean;
}

export interface CreateWebhookEndpointInput {
  readonly id: string;
  readonly integrationId: string;
  readonly providerId: string;
  readonly callbackUrl: string;
  readonly secretRef?: WebhookSecretRef;
  readonly requireHttps?: boolean;
  readonly active?: boolean;
  readonly headers?: Readonly<Record<string, string>>;
}

export function createWebhookEndpoint(
  input: CreateWebhookEndpointInput,
): WebhookEndpoint {
  const definition: WebhookEndpointDefinition = {
    callbackUrl: input.callbackUrl,
    requireHttps: input.requireHttps ?? true,
    secretRef: input.secretRef,
    headers: input.headers,
  };

  const validation = validateWebhookEndpoint(definition);
  if (!validation.ok) {
    throw new Error(`Invalid webhook endpoint: ${validation.issues.join(", ")}`);
  }

  return {
    id: input.id,
    definition,
    integrationId: input.integrationId,
    providerId: input.providerId,
    active: input.active ?? true,
  };
}

export function isHttpsCallbackUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
