import type { EventBus } from "@apzhub/event-notification-framework";
import { buildEventId } from "@apzhub/legal-business-core";

export type LegalTaskEventVerb =
  "created" | "updated" | "completed" | "archived" | "viewed";

export interface LegalTaskEventPayload {
  readonly taskId: string;
  readonly taskReference: string;
  readonly title: string;
  readonly taskStatus: string;
  readonly taskPriority: string;
  readonly assigneeUserId: string;
  readonly matterId: string;
  readonly documentId?: string;
  readonly dueAt?: string;
  readonly commandId?: string;
  readonly query?: string;
}

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `aaaaaaaa-aaaa-4aaa-aaaa-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Publishes a registered legal task domain event to the Event Bus (LAW-005-01). */
export function publishLegalTaskEvent(
  eventBus: EventBus,
  verb: LegalTaskEventVerb,
  payload: LegalTaskEventPayload,
  options: { readonly correlationId?: string; readonly actorId?: string } = {},
): { readonly ok: boolean; readonly eventId: string } {
  const eventId = buildEventId("task", verb);

  const result = eventBus.publish({
    envelopeId: createEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: options.correlationId ?? createEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "legal-tasks",
    actorId: options.actorId,
    payload: { ...payload },
  });

  return { ok: result.ok, eventId };
}

export function resetLegalTaskEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}
