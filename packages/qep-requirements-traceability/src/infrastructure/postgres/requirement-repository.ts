/**
 * PostgreSQL RequirementRepository — APZQEP-151 Cap E.
 * Coverage/traceability remain derived — not persisted as SoR.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepEnterpriseRequirement } from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type { RequirementRepository } from "../../application/repository";
import type {
  RequirementAggregate,
  RequirementHistoryEntry,
  RequirementNode,
} from "../../domain/types";

function rowToAggregate(
  row: typeof qepEnterpriseRequirement.$inferSelect,
): RequirementAggregate {
  return {
    requirement: row.requirementJson as unknown as RequirementNode,
    history: (row.historyJson ?? []) as RequirementHistoryEntry[],
  };
}

export function createPostgresRequirementRepository(
  db: DatabaseExecutor,
): RequirementRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, requirementId) {
      const [row] = await exec()
        .select()
        .from(qepEnterpriseRequirement)
        .where(
          and(
            eq(qepEnterpriseRequirement.tenantId, tenantId),
            eq(qepEnterpriseRequirement.id, requirementId),
          ),
        )
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async save(aggregate) {
      const r = aggregate.requirement;
      const values = {
        id: r.requirementId,
        tenantId: r.tenantId,
        projectId: r.projectId ?? null,
        title: r.title,
        description: r.description,
        status: r.status,
        category: r.category ?? null,
        priority: r.priority ?? null,
        criticality: r.criticality ?? null,
        risk: r.risk ?? null,
        ownerId: r.ownerId,
        version: r.version,
        requirementJson: r as unknown as Record<string, unknown>,
        historyJson: [...aggregate.history],
        revision: r.revision,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        createdBy: r.createdBy,
        updatedBy: r.updatedBy,
      };
      const expectedPrior = Math.max(0, r.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepEnterpriseRequirement.revision })
        .from(qepEnterpriseRequirement)
        .where(
          and(
            eq(qepEnterpriseRequirement.tenantId, r.tenantId),
            eq(qepEnterpriseRequirement.id, r.requirementId),
          ),
        )
        .limit(1);

      if (!existing) {
        await exec().insert(qepEnterpriseRequirement).values(values);
        return;
      }
      if (existing.revision !== expectedPrior) {
        throw new Error(
          `requirement.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }
      const updated = await exec()
        .update(qepEnterpriseRequirement)
        .set(values)
        .where(
          and(
            eq(qepEnterpriseRequirement.tenantId, r.tenantId),
            eq(qepEnterpriseRequirement.id, r.requirementId),
            eq(qepEnterpriseRequirement.revision, expectedPrior),
          ),
        )
        .returning({ id: qepEnterpriseRequirement.id });
      if (updated.length === 0) {
        throw new Error(
          `requirement.concurrency.stale_revision:expected=${expectedPrior}`,
        );
      }
    },

    async list(filter) {
      const conditions = [eq(qepEnterpriseRequirement.tenantId, filter.tenantId)];
      if (filter.projectId) {
        conditions.push(eq(qepEnterpriseRequirement.projectId, filter.projectId));
      }
      if (filter.status) {
        conditions.push(eq(qepEnterpriseRequirement.status, filter.status));
      }
      const rows = await exec()
        .select()
        .from(qepEnterpriseRequirement)
        .where(and(...conditions))
        .orderBy(desc(qepEnterpriseRequirement.updatedAt));
      let items = rows.map((r) => rowToAggregate(r).requirement);
      if (!filter.includeArchived) {
        items = items.filter((r) => r.status !== "archived");
      }
      return items;
    },
  };
}
