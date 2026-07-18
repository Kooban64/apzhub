import {
  buildIntegrationSourceEvent,
  createSdkEventId,
  createWebhookProcessingPipeline,
  type IntegrationSourceEvent,
  type WebhookDecoder,
  type WebhookProcessingPipeline,
  type WebhookTranslator,
} from "@apzhub/integration-sdk/events";

import { validateIntegrationSourceEvent } from "../validate-source-event";

/** JSON body decoder for platform webhook ingress. */
export function createJsonWebhookDecoder(): WebhookDecoder {
  return {
    decode(input) {
      const text =
        typeof input.rawBody === "string"
          ? input.rawBody
          : Buffer.from(input.rawBody).toString("utf8");
      try {
        return {
          ok: true,
          payload: JSON.parse(text) as unknown,
          rawBody: input.rawBody,
          headers: input.headers,
          deliveryId:
            input.headers["x-delivery-id"] ?? input.headers["x-apzhub-delivery-id"],
          timestamp:
            input.headers["x-webhook-timestamp"] ??
            input.headers["x-apzhub-webhook-timestamp"],
        };
      } catch {
        return { ok: false, reason: "invalid_json" };
      }
    },
  };
}

/**
 * Translator: prefer a full IntegrationSourceEvent body; otherwise wrap opaque JSON.
 */
export function createPlatformIngressTranslator(): WebhookTranslator {
  return {
    translate(payload, context) {
      const asSource = validateIntegrationSourceEvent(payload);
      if (asSource.ok) {
        const event: IntegrationSourceEvent = {
          ...asSource.event,
          providerId: asSource.event.providerId || context.providerId,
          integrationId: asSource.event.integrationId || context.integrationId,
          correlationId: asSource.event.correlationId || context.correlationId,
          tenantId: asSource.event.tenantId ?? context.tenantId,
          deliveryMechanism: asSource.event.deliveryMechanism || "webhook",
        };
        return { ok: true, event, events: [event] };
      }

      if (payload === null || payload === undefined) {
        return { ok: false, reason: "empty_payload" };
      }

      const record =
        typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : { value: payload };

      const action = typeof record.action === "string" ? record.action : "unknown";
      const resourceType =
        typeof record.resourceType === "string"
          ? record.resourceType
          : typeof record.resource === "string"
            ? record.resource
            : "resource";
      const eventType =
        typeof record.eventType === "string"
          ? record.eventType
          : typeof record.type === "string"
            ? record.type
            : `${resourceType}.${action}`;

      const event = buildIntegrationSourceEvent({
        eventId: createSdkEventId(),
        sourceEventId:
          (typeof record.sourceEventId === "string" && record.sourceEventId) ||
          context.deliveryId ||
          createSdkEventId("src"),
        eventType,
        action,
        resourceType,
        providerId: context.providerId,
        integrationId: context.integrationId,
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        deliveryMechanism: "webhook",
        webhookMetadata: context.deliveryId
          ? { deliveryId: context.deliveryId }
          : undefined,
        safeSourceMetadata: {
          resourceId:
            typeof record.resourceId === "string"
              ? record.resourceId
              : typeof record.id === "string"
                ? record.id
                : undefined,
        },
        canonicalPayload: record,
      });

      return { ok: true, event, events: [event] };
    },
  };
}

export function createPlatformIngressPipeline(options: {
  readonly verifier?: Parameters<typeof createWebhookProcessingPipeline>[0]["verifier"];
  readonly replayProtection?: Parameters<
    typeof createWebhookProcessingPipeline
  >[0]["replayProtection"];
  readonly deduplicationStore?: Parameters<
    typeof createWebhookProcessingPipeline
  >[0]["deduplicationStore"];
  readonly metrics?: Parameters<typeof createWebhookProcessingPipeline>[0]["metrics"];
}): WebhookProcessingPipeline {
  return createWebhookProcessingPipeline({
    decoder: createJsonWebhookDecoder(),
    translator: createPlatformIngressTranslator(),
    verifier: options.verifier,
    replayProtection: options.replayProtection,
    deduplicationStore: options.deduplicationStore,
    metrics: options.metrics,
  });
}
