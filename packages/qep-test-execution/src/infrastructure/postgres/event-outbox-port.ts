/**
 * PostgreSQL Event Outbox Port — APZQEP-ENG-100D.
 * Same unit of work as the repository/audit writes (`qep_test_execution_outbox`).
 * Publication/dispatch of enqueued events is out of scope for ENG-100D.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import { qepTestExecutionOutbox } from "@apzhub/config";
import { randomUUID } from "node:crypto";

import type { EventOutboxPort } from "../../application/ports";

export function createPostgresEventOutboxPort(db: DatabaseExecutor): EventOutboxPort {
  return {
    portId: "EventOutboxPort",
    async enqueue(events) {
      if (events.length === 0) return;
      await db.insert(qepTestExecutionOutbox).values(
        events.map((event) => ({
          outboxEventId: event.eventId ?? randomUUID(),
          tenantId: event.tenantId,
          executionId: event.executionId,
          eventType: event.type,
          payload: { ...event },
          ...(event.correlationId ? { correlationId: event.correlationId } : {}),
        })),
      );
    },
  };
}
