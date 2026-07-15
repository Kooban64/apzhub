import type { WebhookManager } from "@apzhub/integration-sdk/events";
import {
  asWebhookManager,
  fromIntegrationEventEnvelope,
  type IntegrationSourceEvent,
} from "@apzhub/integration-sdk/events";
import type { EventTranslationResult } from "@apzhub/platform-service-contracts";

import { PLANE_INTEGRATION_ID } from "../plane-error-mapper";
import type { PlaneWebhookService } from "../services/webhook-service";
import { translatePlaneWebhookPayload } from "./event-translator";

export const PLANE_PROVIDER_ID = "plane";

/**
 * Thin SDK WebhookManager wrapper around PlaneWebhookService.
 * Does not change existing PlaneWebhookService method signatures.
 */
export function asPlaneWebhookManager(service: PlaneWebhookService): WebhookManager {
  return asWebhookManager(service, {
    integrationId: PLANE_INTEGRATION_ID,
    providerId: PLANE_PROVIDER_ID,
  });
}

export type PlaneWebhookManagerAdapter = WebhookManager;

/**
 * Produce IntegrationSourceEvent from a Plane webhook payload.
 * Keeps `translatePlaneWebhookPayload` returning EventTranslationResult unchanged.
 */
export function translatePlaneWebhookToSourceEvent(
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
  const translation = translatePlaneWebhookPayload(payload, {
    deliveryId: options.deliveryId,
    correlationId: options.correlationId,
  });

  if (!translation.event) {
    return { translation };
  }

  const sourceEvent = fromIntegrationEventEnvelope(translation.event, {
    providerId: PLANE_PROVIDER_ID,
    integrationId: PLANE_INTEGRATION_ID,
    deliveryMechanism: "webhook",
    tenantId: options.tenantId,
    sourceEventId: translation.event.deliveryId ?? translation.event.id,
  });

  return { translation, sourceEvent };
}
