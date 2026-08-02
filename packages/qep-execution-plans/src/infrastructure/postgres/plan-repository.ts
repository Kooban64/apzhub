/**
 * PostgreSQL ExecutionPlanRepository — APZQEP-151 Cap B.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepExecutionPlan } from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type { ExecutionPlanRepository } from "../../application/repository";
import type {
  ExecutionPlanAggregate,
  ExecutionPlanHistoryEntry,
  ExecutionPlanNode,
} from "../../domain/types";

function rowToAggregate(
  row: typeof qepExecutionPlan.$inferSelect,
): ExecutionPlanAggregate {
  return {
    plan: row.planJson as unknown as ExecutionPlanNode,
    history: (row.historyJson ?? []) as ExecutionPlanHistoryEntry[],
  };
}

export function createPostgresExecutionPlanRepository(
  db: DatabaseExecutor,
): ExecutionPlanRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, planId) {
      const [row] = await exec()
        .select()
        .from(qepExecutionPlan)
        .where(
          and(eq(qepExecutionPlan.tenantId, tenantId), eq(qepExecutionPlan.id, planId)),
        )
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async save(aggregate) {
      const p = aggregate.plan;
      const values = {
        id: p.planId,
        tenantId: p.tenantId,
        projectId: p.projectId ?? null,
        name: p.name,
        description: p.description,
        ownerId: p.ownerId,
        status: p.status,
        priority: p.priority ?? null,
        risk: p.risk ?? null,
        suiteId: p.suiteRef.suiteId,
        suiteVersion: p.suiteRef.suiteVersion ?? null,
        suiteName: p.suiteRef.suiteName ?? null,
        handoffId: p.handoff?.handoffId ?? null,
        version: p.version,
        planJson: p as unknown as Record<string, unknown>,
        historyJson: [...aggregate.history],
        revision: p.revision,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        createdBy: p.createdBy,
        updatedBy: p.updatedBy,
      };
      const expectedPrior = Math.max(0, p.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepExecutionPlan.revision })
        .from(qepExecutionPlan)
        .where(
          and(
            eq(qepExecutionPlan.tenantId, p.tenantId),
            eq(qepExecutionPlan.id, p.planId),
          ),
        )
        .limit(1);

      if (!existing) {
        await exec().insert(qepExecutionPlan).values(values);
        return;
      }
      if (existing.revision !== expectedPrior) {
        throw new Error(
          `execution_plan.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }
      const updated = await exec()
        .update(qepExecutionPlan)
        .set(values)
        .where(
          and(
            eq(qepExecutionPlan.tenantId, p.tenantId),
            eq(qepExecutionPlan.id, p.planId),
            eq(qepExecutionPlan.revision, expectedPrior),
          ),
        )
        .returning({ id: qepExecutionPlan.id });
      if (updated.length === 0) {
        throw new Error(
          `execution_plan.concurrency.stale_revision:expected=${expectedPrior}`,
        );
      }
    },

    async list(filter) {
      const conditions = [eq(qepExecutionPlan.tenantId, filter.tenantId)];
      if (filter.projectId) {
        conditions.push(eq(qepExecutionPlan.projectId, filter.projectId));
      }
      if (filter.status) {
        conditions.push(eq(qepExecutionPlan.status, filter.status));
      }
      const rows = await exec()
        .select()
        .from(qepExecutionPlan)
        .where(and(...conditions))
        .orderBy(desc(qepExecutionPlan.updatedAt));
      let plans = rows.map((r) => rowToAggregate(r).plan);
      if (!filter.includeArchived) {
        plans = plans.filter((p) => p.status !== "archived");
      }
      if (filter.suiteId) {
        plans = plans.filter((p) => p.suiteRef.suiteId === filter.suiteId);
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        plans = plans.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
        );
      }
      return plans;
    },
  };
}
