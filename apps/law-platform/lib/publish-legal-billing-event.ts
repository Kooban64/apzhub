import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalBillingEventVerb =
  "viewed" | "created" | "updated" | "cancelled" | "paid";

export interface LegalBillingEventPayload {
  readonly invoiceId: string;
  readonly invoiceReference: string;
  readonly clientId: string;
  readonly matterId: string;
  readonly invoiceStatus: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly subtotal: number;
  readonly taxTotal: number;
  readonly total: number;
  readonly currency: string;
  readonly commandId?: string;
  readonly query?: string;
  readonly preview?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `bbbbbbbb-bbbb-4bbb-bbbb-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal billing domain event to the Event Bus (LAW-010-01). */
export function publishLegalBillingEvent(
  eventBus: EventBus,
  verb: LegalBillingEventVerb,
  payload: LegalBillingEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("invoice", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-billing",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalBillingEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
