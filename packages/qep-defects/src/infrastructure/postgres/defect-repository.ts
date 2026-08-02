/**
 * PostgreSQL DefectRepository — APZQEP-151 Cap D.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepDefect } from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type { DefectRepository } from "../../application/repository";
import type {
  DefectAggregate,
  DefectHistoryEntry,
  DefectNode,
} from "../../domain/types";

function rowToAggregate(row: typeof qepDefect.$inferSelect): DefectAggregate {
  return {
    defect: row.defectJson as unknown as DefectNode,
    history: (row.historyJson ?? []) as DefectHistoryEntry[],
  };
}

export function createPostgresDefectRepository(db: DatabaseExecutor): DefectRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, defectId) {
      const [row] = await exec()
        .select()
        .from(qepDefect)
        .where(and(eq(qepDefect.tenantId, tenantId), eq(qepDefect.id, defectId)))
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async save(aggregate) {
      const d = aggregate.defect;
      const values = {
        id: d.defectId,
        tenantId: d.tenantId,
        projectId: d.projectId ?? null,
        title: d.title,
        description: d.description,
        status: d.status,
        severity: d.severity,
        priority: d.priority,
        reporterId: d.reporterId,
        assigneeId: d.assigneeId ?? null,
        sessionId: d.executionOrigin?.sessionId ?? null,
        suiteId: d.executionOrigin?.suiteId ?? null,
        defectJson: d as unknown as Record<string, unknown>,
        historyJson: [...aggregate.history],
        revision: d.revision,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
        createdBy: d.createdBy,
        updatedBy: d.updatedBy,
      };
      const expectedPrior = Math.max(0, d.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepDefect.revision })
        .from(qepDefect)
        .where(and(eq(qepDefect.tenantId, d.tenantId), eq(qepDefect.id, d.defectId)))
        .limit(1);

      if (!existing) {
        await exec().insert(qepDefect).values(values);
        return;
      }
      if (existing.revision !== expectedPrior) {
        throw new Error(
          `defect.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }
      const updated = await exec()
        .update(qepDefect)
        .set(values)
        .where(
          and(
            eq(qepDefect.tenantId, d.tenantId),
            eq(qepDefect.id, d.defectId),
            eq(qepDefect.revision, expectedPrior),
          ),
        )
        .returning({ id: qepDefect.id });
      if (updated.length === 0) {
        throw new Error(`defect.concurrency.stale_revision:expected=${expectedPrior}`);
      }
    },

    async list(filter) {
      const conditions = [eq(qepDefect.tenantId, filter.tenantId)];
      if (filter.projectId) conditions.push(eq(qepDefect.projectId, filter.projectId));
      if (filter.status) conditions.push(eq(qepDefect.status, filter.status));
      const rows = await exec()
        .select()
        .from(qepDefect)
        .where(and(...conditions))
        .orderBy(desc(qepDefect.updatedAt));
      let items = rows.map((r) => rowToAggregate(r).defect);
      if (!filter.includeArchived) {
        items = items.filter((d) => d.status !== "archived");
      }
      if (filter.assigneeId) {
        items = items.filter((d) => d.assigneeId === filter.assigneeId);
      }
      if (filter.severity) {
        items = items.filter((d) => d.severity === filter.severity);
      }
      return items;
    },
  };
}
