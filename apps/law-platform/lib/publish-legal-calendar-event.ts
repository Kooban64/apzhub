import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalCalendarEventVerb = "created" | "updated" | "cancelled" | "viewed";

export interface LegalCalendarEventPayload {
  readonly calendarEventId: string;
  readonly calendarEventReference: string;
  readonly title: string;
  readonly eventType: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly matterId: string;
  readonly clientId: string;
  readonly ownerUserId: string;
  readonly calendarEventStatus: string;
  readonly taskId?: string;
  readonly documentId?: string;
  readonly timeEntryId?: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `bbbbbbbb-bbbb-4bbb-bbbb-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal calendar domain event to the Event Bus (LAW-008-01). */
export function publishLegalCalendarEvent(
  eventBus: EventBus,
  verb: LegalCalendarEventVerb,
  payload: LegalCalendarEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("calendar", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-calendar",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalCalendarEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
