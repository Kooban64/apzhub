import type { DatabaseExecutor } from "@apzhub/config";
import { lawOutboxEvent } from "@apzhub/config";
import { createEntityId } from "@apzhub/legal-business-core";

import type { LawPersistenceContext } from "./law-persistence-context";

export type OutboxAggregateType =
  "client" | "matter" | "document" | "task" | "calendar" | "time" | "invoice" | "trust";

export interface OutboxEventDraft {
  readonly aggregateType: OutboxAggregateType;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
}

/**
 * Records durable outbox events for PCv2-02 worker delivery
 * (`@apzhub/platform-outbox`). Write path only — do not drain here.
 */
export async function recordOutboxEvent(
  context: LawPersistenceContext,
  db: DatabaseExecutor,
  draft: OutboxEventDraft,
): Promise<void> {
  await db.insert(lawOutboxEvent).values({
    outboxEventId: createEntityId("ob"),
    tenantId: context.tenantId,
    aggregateType: draft.aggregateType,
    aggregateId: draft.aggregateId,
    eventType: draft.eventType,
    payload: draft.payload,
  });
}
