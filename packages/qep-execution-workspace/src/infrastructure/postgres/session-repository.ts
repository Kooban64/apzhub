/**
 * PostgreSQL ExecutionSessionRepository — APZQEP-151 Cap C.
 * Completed results are persisted immutably as part of session_json;
 * amendments append without overwriting prior step outcomes in history.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepExecutionSession } from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type { ExecutionSessionRepository } from "../../application/repository";
import type {
  ExecutionSessionAggregate,
  ExecutionSessionHistoryEntry,
  ExecutionSessionNode,
} from "../../domain/types";

function rowToAggregate(
  row: typeof qepExecutionSession.$inferSelect,
): ExecutionSessionAggregate {
  return {
    session: row.sessionJson as unknown as ExecutionSessionNode,
    history: (row.historyJson ?? []) as ExecutionSessionHistoryEntry[],
  };
}

export function createPostgresExecutionSessionRepository(
  db: DatabaseExecutor,
): ExecutionSessionRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, sessionId) {
      const [row] = await exec()
        .select()
        .from(qepExecutionSession)
        .where(
          and(
            eq(qepExecutionSession.tenantId, tenantId),
            eq(qepExecutionSession.id, sessionId),
          ),
        )
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async findByHandoff(tenantId, handoffId) {
      const [row] = await exec()
        .select()
        .from(qepExecutionSession)
        .where(
          and(
            eq(qepExecutionSession.tenantId, tenantId),
            eq(qepExecutionSession.handoffId, handoffId),
          ),
        )
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async save(aggregate) {
      const s = aggregate.session;
      const values = {
        id: s.sessionId,
        tenantId: s.tenantId,
        projectId: s.projectId ?? null,
        name: s.name,
        ownerId: s.ownerId,
        status: s.status,
        planId: s.planning.planId ?? null,
        handoffId: s.planning.handoffId ?? null,
        suiteId: s.planning.suiteId ?? null,
        sessionJson: s as unknown as Record<string, unknown>,
        historyJson: [...aggregate.history],
        revision: s.revision,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        createdBy: s.createdBy,
        updatedBy: s.updatedBy,
      };
      const expectedPrior = Math.max(0, s.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepExecutionSession.revision })
        .from(qepExecutionSession)
        .where(
          and(
            eq(qepExecutionSession.tenantId, s.tenantId),
            eq(qepExecutionSession.id, s.sessionId),
          ),
        )
        .limit(1);

      if (!existing) {
        await exec().insert(qepExecutionSession).values(values);
        return;
      }
      if (existing.revision !== expectedPrior) {
        throw new Error(
          `execution_session.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }
      const updated = await exec()
        .update(qepExecutionSession)
        .set(values)
        .where(
          and(
            eq(qepExecutionSession.tenantId, s.tenantId),
            eq(qepExecutionSession.id, s.sessionId),
            eq(qepExecutionSession.revision, expectedPrior),
          ),
        )
        .returning({ id: qepExecutionSession.id });
      if (updated.length === 0) {
        throw new Error(
          `execution_session.concurrency.stale_revision:expected=${expectedPrior}`,
        );
      }
    },

    async list(filter) {
      const conditions = [eq(qepExecutionSession.tenantId, filter.tenantId)];
      if (filter.projectId) {
        conditions.push(eq(qepExecutionSession.projectId, filter.projectId));
      }
      if (filter.status) {
        conditions.push(eq(qepExecutionSession.status, filter.status));
      }
      const rows = await exec()
        .select()
        .from(qepExecutionSession)
        .where(and(...conditions))
        .orderBy(desc(qepExecutionSession.updatedAt));
      let sessions = rows.map((r) => rowToAggregate(r).session);
      if (!filter.includeArchived) {
        sessions = sessions.filter((s) => s.status !== "archived");
      }
      if (filter.ownerId) {
        sessions = sessions.filter((s) => s.ownerId === filter.ownerId);
      }
      return sessions;
    },
  };
}
