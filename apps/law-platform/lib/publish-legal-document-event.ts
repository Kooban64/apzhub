import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalDocumentEventVerb = "created" | "updated" | "archived" | "viewed";

export interface LegalDocumentEventPayload {
  readonly documentId: string;
  readonly documentReference: string;
  readonly title: string;
  readonly documentType: string;
  readonly documentStatus: string;
  readonly documentCategoryId: string;
  readonly matterId: string;
  readonly folderId: string;
  readonly fileName: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `99999999-9999-4999-8999-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal document domain event to the Event Bus (LAW-004-01). */
export function publishLegalDocumentEvent(
  eventBus: EventBus,
  verb: LegalDocumentEventVerb,
  payload: LegalDocumentEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("document", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-documents",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalDocumentEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
