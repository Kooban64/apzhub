import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalSearchEventVerb = "executed" | "result.opened" | "filtered";

export interface LegalSearchEventPayload {
  readonly query: string;
  readonly resultCount?: number;
  readonly entityType?: string;
  readonly entityTypeFilter?: string;
  readonly documentId?: string;
  readonly title?: string;
  readonly reference?: string;
  readonly route?: string;
  readonly commandId?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly status?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `aaaaaaaa-aaaa-4aaa-aaaa-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal search domain event to the Event Bus (LAW-007-01). */
export function publishLegalSearchEvent(
  eventBus: EventBus,
  verb: LegalSearchEventVerb,
  payload: LegalSearchEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("search", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-search",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalSearchEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
