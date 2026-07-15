import type { WebhookManager } from "@apzhub/integration-sdk/events";
import {
  asWebhookManager,
  fromIntegrationEventEnvelope,
  type IntegrationSourceEvent,
} from "@apzhub/integration-sdk/events";
import type { EventTranslationResult } from "@apzhub/platform-service-contracts";

import { ZAMMAD_INTEGRATION_ID } from "../zammad-error-mapper";
import type { ZammadWebhookService } from "../services/webhook-service";
import { translateZammadWebhookPayload } from "./event-translator";

export const ZAMMAD_PROVIDER_ID = "zammad";

/**
 * Thin SDK WebhookManager wrapper around ZammadWebhookService.
 * Does not change existing ZammadWebhookService method signatures.
 */
export function asZammadWebhookManager(service: ZammadWebhookService): WebhookManager {
  return asWebhookManager(service, {
    integrationId: ZAMMAD_INTEGRATION_ID,
    providerId: ZAMMAD_PROVIDER_ID,
  });
}

export type ZammadWebhookManagerAdapter = WebhookManager;

/**
 * Produce IntegrationSourceEvent from a Zammad webhook payload.
 * Keeps `translateZammadWebhookPayload` returning EventTranslationResult unchanged.
 */
export function translateZammadWebhookToSourceEvent(
  payload: unknown,
  options: {
    readonly deliveryId?: string;
    readonly correlationId?: string;
    readonly tenantId?: string;
  } = {},
): {
  readonly translation: EventTranslationResult;
  readonly sourceEvent?: IntegrationSourceEvent;
} {
  const translation = translateZammadWebhookPayload(payload, {
    deliveryId: options.deliveryId,
    correlationId: options.correlationId,
  });

  if (!translation.event) {
    return { translation };
  }

  const sourceEvent = fromIntegrationEventEnvelope(translation.event, {
    providerId: ZAMMAD_PROVIDER_ID,
    integrationId: ZAMMAD_INTEGRATION_ID,
    deliveryMechanism: "webhook",
    tenantId: options.tenantId,
    sourceEventId: translation.event.deliveryId ?? translation.event.id,
  });

  return { translation, sourceEvent };
}
