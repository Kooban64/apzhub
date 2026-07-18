import type { EventEnvelope } from "@apzhub/event-notification-framework";
import type { OutboxEvent } from "@apzhub/platform-outbox";
import type { IntegrationSourceEvent } from "@apzhub/integration-sdk/events";

import { OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE } from "./constants";
import { mapSourceEventToEnvelope } from "./map-source-event";
import { validateIntegrationSourceEvent } from "./validate-source-event";

export type MapOutboxResult =
  | { readonly ok: true; readonly envelope: EventEnvelope }
  | { readonly ok: false; readonly message: string; readonly permanent?: boolean };

/**
 * Reconstruct EventEnvelope from a durable outbox row for Event Bus relay.
 */
export function mapOutboxEventToEnvelope(event: OutboxEvent): MapOutboxResult {
  if (event.eventType !== OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE) {
    return {
      ok: false,
      message: `unsupported outbox eventType: ${event.eventType}`,
      permanent: true,
    };
  }

  const nested = event.payload.sourceEvent ?? event.payload;
  const validation = validateIntegrationSourceEvent(nested);
  if (!validation.ok) {
    return {
      ok: false,
      message: validation.issues.map((i) => `${i.field}: ${i.message}`).join("; "),
      permanent: true,
    };
  }

  const sourceEvent: IntegrationSourceEvent = validation.event;
  const envelopeId =
    typeof event.payload.envelopeId === "string" ? event.payload.envelopeId : undefined;

  return {
    ok: true,
    envelope: mapSourceEventToEnvelope(sourceEvent, {
      envelopeId,
      timestamp: event.updatedAt,
    }),
  };
}
