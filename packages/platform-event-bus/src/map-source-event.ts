import type { EventEnvelope } from "@apzhub/event-notification-framework";
import type { IntegrationSourceEvent } from "@apzhub/integration-sdk/events";

import {
  PLATFORM_EVENT_BUS_PUBLISHER,
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
  PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION,
} from "./constants";
import { createUuid } from "./uuid";

/**
 * Map validated IntegrationSourceEvent → ENF EventEnvelope.
 * Payload carries the SDK event as a nested object (no secrets assumed).
 */
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuidCausation(value: string | undefined): string | undefined {
  if (value && UUID_V4_PATTERN.test(value)) {
    return value;
  }
  return undefined;
}

export function mapSourceEventToEnvelope(
  sourceEvent: IntegrationSourceEvent,
  options: {
    readonly envelopeId?: string;
    readonly timestamp?: string;
  } = {},
): EventEnvelope {
  const causationId = asUuidCausation(sourceEvent.causationId);

  return {
    envelopeId: options.envelopeId ?? createUuid(),
    eventId: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
    eventVersion: PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION,
    category: "integration",
    correlationId: sourceEvent.correlationId,
    ...(causationId ? { causationId } : {}),
    timestamp: options.timestamp ?? new Date().toISOString(),
    publisher: PLATFORM_EVENT_BUS_PUBLISHER,
    sourceService: "platform-event-bus",
    tenantId: sourceEvent.tenantId,
    actorId:
      typeof sourceEvent.canonicalPayload?.actorId === "string"
        ? sourceEvent.canonicalPayload.actorId
        : undefined,
    payload: {
      sourceEvent: sourceEvent as unknown as Record<string, unknown>,
      providerId: sourceEvent.providerId,
      integrationId: sourceEvent.integrationId,
      eventType: sourceEvent.eventType,
      action: sourceEvent.action,
      resourceType: sourceEvent.resourceType,
      sourceEventId: sourceEvent.sourceEventId,
      deliveryMechanism: sourceEvent.deliveryMechanism,
    },
  };
}
