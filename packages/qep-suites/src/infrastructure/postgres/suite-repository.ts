/**
 * PostgreSQL SuiteRepository — APZQEP-151.
 * Production Source of Record for Cap A. Optimistic concurrency via revision.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepSuite } from "@apzhub/config";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import type { SuiteRepository } from "../../application/repository";
import type {
  SuiteAggregate,
  SuiteHistoryEntry,
  SuiteLifecycleState,
  SuiteNode,
} from "../../domain/types";

function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fromDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString();
}

function rowToAggregate(row: typeof qepSuite.$inferSelect): SuiteAggregate {
  const suite: SuiteNode = {
    suiteId: row.id,
    tenantId: row.tenantId,
    ...(row.projectId ? { projectId: row.projectId } : {}),
    ...(row.parentSuiteId ? { parentSuiteId: row.parentSuiteId } : {}),
    folderPath: row.folderPath,
    name: row.name,
    description: row.description,
    ownerId: row.ownerId,
    kind: row.kind as SuiteNode["kind"],
    status: row.status as SuiteLifecycleState,
    version: row.version,
    priority: row.priority as SuiteNode["priority"],
    ...(row.category ? { category: row.category } : {}),
    tags: row.tagsJson ?? [],
    ...(row.risk ? { risk: row.risk } : {}),
    ...(row.businessArea ? { businessArea: row.businessArea } : {}),
    ...(row.application ? { application: row.application } : {}),
    ...(row.component ? { component: row.component } : {}),
    ...(row.classification ? { classification: row.classification } : {}),
    favouriteUserIds: row.favouriteUserIdsJson ?? [],
    pinnedUserIds: row.pinnedUserIdsJson ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(fromDate(row.publishedAt) ? { publishedAt: fromDate(row.publishedAt) } : {}),
    ...(fromDate(row.archivedAt) ? { archivedAt: fromDate(row.archivedAt) } : {}),
    ...(fromDate(row.retiredAt) ? { retiredAt: fromDate(row.retiredAt) } : {}),
    ...(fromDate(row.deletedAt) ? { deletedAt: fromDate(row.deletedAt) } : {}),
    customMetadata: row.customMetadataJson ?? {},
    revision: row.revision,
  };
  return {
    suite,
    history: (row.historyJson ?? []) as SuiteHistoryEntry[],
  };
}

function toValues(aggregate: SuiteAggregate) {
  const s = aggregate.suite;
  return {
    id: s.suiteId,
    tenantId: s.tenantId,
    projectId: s.projectId ?? null,
    parentSuiteId: s.parentSuiteId ?? null,
    folderPath: s.folderPath,
    name: s.name,
    description: s.description,
    ownerId: s.ownerId,
    kind: s.kind,
    status: s.status,
    version: s.version,
    priority: s.priority,
    category: s.category ?? null,
    tagsJson: [...s.tags],
    risk: s.risk ?? null,
    businessArea: s.businessArea ?? null,
    application: s.application ?? null,
    component: s.component ?? null,
    classification: s.classification ?? null,
    favouriteUserIdsJson: [...s.favouriteUserIds],
    pinnedUserIdsJson: [...s.pinnedUserIds],
    publishedAt: toDate(s.publishedAt),
    archivedAt: toDate(s.archivedAt),
    retiredAt: toDate(s.retiredAt),
    deletedAt: toDate(s.deletedAt),
    customMetadataJson: { ...s.customMetadata },
    historyJson: [...aggregate.history],
    revision: s.revision,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
    createdBy: s.ownerId,
    updatedBy: aggregate.history.at(-1)?.actorId ?? s.ownerId,
  };
}

export function createPostgresSuiteRepository(db: DatabaseExecutor): SuiteRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, suiteId) {
      const [row] = await exec()
        .select()
        .from(qepSuite)
        .where(and(eq(qepSuite.tenantId, tenantId), eq(qepSuite.id, suiteId)))
        .limit(1);
      return row ? rowToAggregate(row) : undefined;
    },

    async save(aggregate) {
      const values = toValues(aggregate);
      const expectedPrior = Math.max(0, aggregate.suite.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepSuite.revision })
        .from(qepSuite)
        .where(
          and(
            eq(qepSuite.tenantId, aggregate.suite.tenantId),
            eq(qepSuite.id, aggregate.suite.suiteId),
          ),
        )
        .limit(1);

      if (!existing) {
        if (aggregate.suite.revision !== 1 && expectedPrior !== 0) {
          // allow first insert at revision 1
        }
        await exec().insert(qepSuite).values(values);
        return;
      }

      if (existing.revision !== expectedPrior) {
        throw new Error(
          `suite.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }

      const updated = await exec()
        .update(qepSuite)
        .set(values)
        .where(
          and(
            eq(qepSuite.tenantId, aggregate.suite.tenantId),
            eq(qepSuite.id, aggregate.suite.suiteId),
            eq(qepSuite.revision, expectedPrior),
          ),
        )
        .returning({ id: qepSuite.id });

      if (updated.length === 0) {
        throw new Error(`suite.concurrency.stale_revision:expected=${expectedPrior}`);
      }
    },

    async list(filter) {
      const conditions = [eq(qepSuite.tenantId, filter.tenantId)];
      if (!filter.includeDeleted) {
        conditions.push(ne(qepSuite.status, "deleted"));
      }
      if (filter.projectId) {
        conditions.push(eq(qepSuite.projectId, filter.projectId));
      }
      if (filter.status) {
        conditions.push(eq(qepSuite.status, filter.status));
      }
      if (filter.ownerId) {
        conditions.push(eq(qepSuite.ownerId, filter.ownerId));
      }
      if (filter.parentSuiteId === null) {
        conditions.push(sql`${qepSuite.parentSuiteId} IS NULL`);
      } else if (filter.parentSuiteId) {
        conditions.push(eq(qepSuite.parentSuiteId, filter.parentSuiteId));
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const sortCol =
        sortBy === "name"
          ? qepSuite.name
          : sortBy === "createdAt"
            ? qepSuite.createdAt
            : sortBy === "priority"
              ? qepSuite.priority
              : qepSuite.updatedAt;
      const order = filter.sortDirection === "asc" ? asc(sortCol) : desc(sortCol);

      const rows = await exec()
        .select()
        .from(qepSuite)
        .where(and(...conditions))
        .orderBy(order);

      let nodes = rows.map((r) => rowToAggregate(r).suite);
      if (filter.tags?.length) {
        nodes = nodes.filter((s) => filter.tags!.every((t) => s.tags.includes(t)));
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        nodes = nodes.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }
      return nodes;
    },

    async listChildren(tenantId, parentSuiteId) {
      return this.list({ tenantId, parentSuiteId });
    },
  };
}
