import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalClientEventVerb = "created" | "updated" | "deleted" | "viewed";

export interface LegalClientEventPayload {
  readonly clientId: string;
  readonly clientReference: string;
  readonly displayName: string;
  readonly clientType: string;
  readonly status: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `77777777-7777-4777-8777-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal client domain event to the Event Bus (LAW-002-03). */
export function publishLegalClientEvent(
  eventBus: EventBus,
  verb: LegalClientEventVerb,
  payload: LegalClientEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("client", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-clients",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalClientEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
