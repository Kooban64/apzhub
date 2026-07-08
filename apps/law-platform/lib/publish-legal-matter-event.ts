import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalMatterEventVerb =
  "created" | "updated" | "archived" | "viewed" | "workspace.opened";

export interface LegalMatterEventPayload {
  readonly matterId: string;
  readonly matterReference: string;
  readonly title: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly matterStatus: string;
  readonly practiceAreaId: string;
  readonly priority: string;
  readonly leadAttorneyId: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `88888888-8888-4888-8888-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal matter domain event to the Event Bus (LAW-003-01). */
export function publishLegalMatterEvent(
  eventBus: EventBus,
  verb: LegalMatterEventVerb,
  payload: LegalMatterEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("matter", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-matters",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalMatterEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
