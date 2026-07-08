import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalTimeEventVerb = "created" | "updated" | "deleted" | "viewed";

export interface LegalTimeEventPayload {
  readonly timeEntryId: string;
  readonly timeEntryReference: string;
  readonly narrative: string;
  readonly matterId: string;
  readonly userId: string;
  readonly entryDate: string;
  readonly durationMinutes: number;
  readonly billable: boolean;
  readonly amount: number;
  readonly taskId?: string;
  readonly documentId?: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `aaaaaaaa-aaaa-4aaa-aaaa-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal time domain event to the Event Bus (LAW-006-01). */
export function publishLegalTimeEvent(
  eventBus: EventBus,
  verb: LegalTimeEventVerb,
  payload: LegalTimeEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("time", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-time",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalTimeEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
