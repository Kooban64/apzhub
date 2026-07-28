/**
 * PostgreSQL Execution History Store — APZQEP-ENG-100D.
 * Backed by the same `qep_test_execution_history` table synced by the
 * repository; provides direct append/list access for consumers that do not
 * go through the full aggregate.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import { qepTestExecutionHistory } from "@apzhub/config";
import { and, asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { ExecutionHistoryStore } from "../../application/ports";
import { mapHistoryRow } from "../mappers/execution-mapper";

export function createPostgresExecutionHistoryStore(
  db: DatabaseExecutor,
): ExecutionHistoryStore {
  return {
    portId: "ExecutionHistoryStore",

    async append(tenantId, executionId, entries) {
      if (entries.length === 0) return;
      const existing = await db
        .select({ sequence: qepTestExecutionHistory.sequence })
        .from(qepTestExecutionHistory)
        .where(
          and(
            eq(qepTestExecutionHistory.tenantId, tenantId),
            eq(qepTestExecutionHistory.executionId, executionId),
          ),
        );
      const existingSequences = new Set(existing.map((row) => row.sequence));
      const missing = entries.filter((entry) => !existingSequences.has(entry.sequence));
      if (missing.length === 0) return;
      await db.insert(qepTestExecutionHistory).values(
        missing.map((entry) => ({
          id: randomUUID(),
          tenantId,
          executionId,
          sequence: entry.sequence,
          occurredAt: new Date(entry.at),
          actorUserId: entry.actorId,
          action: entry.action,
          summary: entry.summary,
          fromStatus: entry.fromStatus ?? null,
          toStatus: entry.toStatus ?? null,
          correlationId: entry.correlationId ?? null,
        })),
      );
    },

    async list(tenantId, executionId) {
      const rows = await db
        .select()
        .from(qepTestExecutionHistory)
        .where(
          and(
            eq(qepTestExecutionHistory.tenantId, tenantId),
            eq(qepTestExecutionHistory.executionId, executionId),
          ),
        )
        .orderBy(asc(qepTestExecutionHistory.sequence));
      return rows.map(mapHistoryRow);
    },
  };
}
