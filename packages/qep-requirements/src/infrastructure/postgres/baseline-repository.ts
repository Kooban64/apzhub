import type { DatabaseExecutor } from "@apzhub/config";
import { qepRequirementBaseline, qepRequirementBaselineItem } from "@apzhub/config";
import { and, asc, eq, sql } from "drizzle-orm";

import type { RequirementBaseline } from "../../domain/baseline/requirement-baseline";
import type { RequirementBaselineId } from "../../domain/baseline/requirement-baseline-id";
import { createRequirementBaselineItem } from "../../domain/baseline/requirement-baseline-item";
import type { RequirementBaselineItem } from "../../domain/baseline/requirement-baseline-item";
import type {
  RequirementBaselineListQuery,
  RequirementBaselineRepository,
} from "../../domain/baseline/requirement-baseline-repository";
import {
  QepBaselineArchivedError,
  QepBaselineAlreadyLockedError,
  QepBaselineDuplicateMembershipError,
  QepBaselineInvalidStateError,
  QepBaselineNotFoundError,
  QepConflictError,
} from "../../shared/errors";

type BaselineRow = typeof qepRequirementBaseline.$inferSelect;
type BaselineItemRow = typeof qepRequirementBaselineItem.$inferSelect;

function itemRowId(baselineId: string, contentVersionId: string): string {
  return `${baselineId}:${contentVersionId}`;
}

function mapItemRow(row: BaselineItemRow): RequirementBaselineItem {
  return createRequirementBaselineItem({
    requirementId: row.requirementId,
    contentVersionId: row.contentVersionId,
    contentVersionNumber: row.contentVersionNumber,
    includedAt: row.includedAt.toISOString(),
    includedBy: row.includedBy,
  });
}

function mapBaselineRow(
  row: BaselineRow,
  items: readonly RequirementBaselineItem[],
): RequirementBaseline {
  return {
    id: row.id as RequirementBaselineId,
    tenantId: row.tenantId,
    number: row.baselineNumber as RequirementBaseline["number"],
    name: row.name as RequirementBaseline["name"],
    ...(row.description !== null
      ? { description: row.description as RequirementBaseline["description"] }
      : {}),
    status: row.status as RequirementBaseline["status"],
    items,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    correlationId: row.correlationId,
    ...(row.integrityFingerprint !== null
      ? { integrityFingerprint: row.integrityFingerprint }
      : {}),
    ...(row.integrityAlgorithm !== null ? { integrityAlgorithm: row.integrityAlgorithm } : {}),
    ...(row.integritySchemaVersion !== null
      ? { integritySchemaVersion: row.integritySchemaVersion }
      : {}),
    ...(row.integrityVerificationStatus !== null
      ? {
          integrityVerificationStatus:
            row.integrityVerificationStatus as RequirementBaseline["integrityVerificationStatus"],
        }
      : {}),
    ...(row.integrityVerifiedAt
      ? { integrityVerifiedAt: row.integrityVerifiedAt.toISOString() }
      : {}),
    ...(row.lockedAt ? { lockedAt: row.lockedAt.toISOString() } : {}),
    ...(row.lockedBy ? { lockedBy: row.lockedBy } : {}),
    ...(row.archivedAt ? { archivedAt: row.archivedAt.toISOString() } : {}),
    ...(row.archivedBy ? { archivedBy: row.archivedBy } : {}),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export function createPostgresRequirementBaselineRepository(
  db: DatabaseExecutor,
): RequirementBaselineRepository {
  async function loadItems(
    tenantId: string,
    baselineId: string,
  ): Promise<readonly RequirementBaselineItem[]> {
    const rows = await db
      .select()
      .from(qepRequirementBaselineItem)
      .where(
        and(
          eq(qepRequirementBaselineItem.tenantId, tenantId),
          eq(qepRequirementBaselineItem.baselineId, baselineId),
        ),
      )
      .orderBy(asc(qepRequirementBaselineItem.displayOrder));
    return rows.map(mapItemRow);
  }

  async function loadRow(tenantId: string, id: string): Promise<BaselineRow | null> {
    const rows = await db
      .select()
      .from(qepRequirementBaseline)
      .where(
        and(eq(qepRequirementBaseline.tenantId, tenantId), eq(qepRequirementBaseline.id, id)),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async function loadBaseline(
    tenantId: string,
    id: RequirementBaselineId,
  ): Promise<RequirementBaseline | null> {
    const row = await loadRow(tenantId, id);
    if (!row) return null;
    const items = await loadItems(tenantId, id);
    return mapBaselineRow(row, items);
  }

  async function requireRow(tenantId: string, id: string): Promise<BaselineRow> {
    const row = await loadRow(tenantId, id);
    if (!row) {
      throw new QepBaselineNotFoundError(`Requirement baseline not found: ${id}`);
    }
    return row;
  }

  function assertDraftMutable(row: BaselineRow): void {
    if (row.status === "locked") {
      throw new QepBaselineAlreadyLockedError();
    }
    if (row.status === "archived") {
      throw new QepBaselineArchivedError();
    }
  }

  async function insertItems(
    tenantId: string,
    baselineId: string,
    items: readonly RequirementBaselineItem[],
  ): Promise<readonly RequirementBaselineItem[]> {
    if (items.length === 0) return [];
    await db.insert(qepRequirementBaselineItem).values(
      items.map((item, index) => ({
        id: itemRowId(baselineId, item.contentVersionId),
        tenantId,
        baselineId,
        requirementId: item.requirementId,
        contentVersionId: item.contentVersionId,
        contentVersionNumber: item.contentVersionNumber,
        includedBy: item.includedBy,
        includedAt: new Date(item.includedAt),
        displayOrder: index,
      })),
    );
    return loadItems(tenantId, baselineId);
  }

  return {
    async createBaseline(baseline) {
      try {
        const [row] = await db
          .insert(qepRequirementBaseline)
          .values({
            id: baseline.id,
            tenantId: baseline.tenantId,
            baselineNumber: baseline.number,
            name: baseline.name,
            description: baseline.description ?? null,
            status: baseline.status,
            ownerUserId: baseline.createdBy,
            createdAt: new Date(baseline.createdAt),
            createdBy: baseline.createdBy,
            updatedAt: new Date(baseline.updatedAt),
            updatedBy: baseline.updatedBy,
            correlationId: baseline.correlationId,
          })
          .returning();
        if (!row) {
          throw new QepConflictError("Failed to create requirement baseline");
        }
        const items = await insertItems(baseline.tenantId, baseline.id, baseline.items);
        return mapBaselineRow(row, items);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new QepConflictError(
            `Requirement baseline already exists: ${baseline.id} (or number ${baseline.number} in use)`,
          );
        }
        throw error;
      }
    },

    async getBaseline(tenantId, id) {
      return loadBaseline(tenantId, id);
    },

    async updateDraftBaseline(baseline) {
      const [updated] = await db
        .update(qepRequirementBaseline)
        .set({
          name: baseline.name,
          description: baseline.description ?? null,
          updatedAt: new Date(baseline.updatedAt),
          updatedBy: baseline.updatedBy,
        })
        .where(
          and(
            eq(qepRequirementBaseline.id, baseline.id),
            eq(qepRequirementBaseline.tenantId, baseline.tenantId),
            eq(qepRequirementBaseline.status, "draft"),
          ),
        )
        .returning();
      if (!updated) {
        const existing = await requireRow(baseline.tenantId, baseline.id);
        if (existing.status !== "draft") {
          throw new QepBaselineInvalidStateError(
            "Only draft requirement baselines may be updated",
          );
        }
        throw new QepBaselineNotFoundError(`Requirement baseline not found: ${baseline.id}`);
      }
      const items = await loadItems(baseline.tenantId, baseline.id);
      return mapBaselineRow(updated, items);
    },

    async listBaselines(tenantId, query: RequirementBaselineListQuery = {}) {
      const conditions = [eq(qepRequirementBaseline.tenantId, tenantId)];
      if (query.status) {
        conditions.push(eq(qepRequirementBaseline.status, query.status));
      }
      const rows = await db
        .select()
        .from(qepRequirementBaseline)
        .where(and(...conditions))
        .orderBy(asc(qepRequirementBaseline.baselineNumber))
        .limit(query.limit ?? 1000)
        .offset(query.offset ?? 0);
      return Promise.all(
        rows.map(async (row) => mapBaselineRow(row, await loadItems(tenantId, row.id))),
      );
    },

    async addRequirementVersion(tenantId, id, item, changedAt, changedBy) {
      const existing = await requireRow(tenantId, id);
      assertDraftMutable(existing);
      try {
        const currentCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(qepRequirementBaselineItem)
          .where(
            and(
              eq(qepRequirementBaselineItem.tenantId, tenantId),
              eq(qepRequirementBaselineItem.baselineId, id),
            ),
          );
        const displayOrder = currentCount[0]?.count ?? 0;
        await db.insert(qepRequirementBaselineItem).values({
          id: itemRowId(id, item.contentVersionId),
          tenantId,
          baselineId: id,
          requirementId: item.requirementId,
          contentVersionId: item.contentVersionId,
          contentVersionNumber: item.contentVersionNumber,
          includedBy: item.includedBy,
          includedAt: new Date(item.includedAt),
          displayOrder,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new QepBaselineDuplicateMembershipError(
            "Requirement baseline already contains this requirement or content version",
          );
        }
        throw error;
      }
      await db
        .update(qepRequirementBaseline)
        .set({ updatedAt: new Date(changedAt), updatedBy: changedBy })
        .where(
          and(eq(qepRequirementBaseline.id, id), eq(qepRequirementBaseline.tenantId, tenantId)),
        );
      const items = await loadItems(tenantId, id);
      const [row] = await db
        .select()
        .from(qepRequirementBaseline)
        .where(
          and(eq(qepRequirementBaseline.id, id), eq(qepRequirementBaseline.tenantId, tenantId)),
        )
        .limit(1);
      return mapBaselineRow(row!, items);
    },

    async removeRequirementVersion(tenantId, id, contentVersionId, changedAt, changedBy) {
      const existing = await requireRow(tenantId, id);
      assertDraftMutable(existing);
      const deleted = await db
        .delete(qepRequirementBaselineItem)
        .where(
          and(
            eq(qepRequirementBaselineItem.tenantId, tenantId),
            eq(qepRequirementBaselineItem.baselineId, id),
            eq(qepRequirementBaselineItem.contentVersionId, contentVersionId),
          ),
        )
        .returning();
      if (deleted.length === 0) {
        throw new QepBaselineNotFoundError(
          `Requirement baseline item not found: ${contentVersionId}`,
        );
      }
      const [row] = await db
        .update(qepRequirementBaseline)
        .set({ updatedAt: new Date(changedAt), updatedBy: changedBy })
        .where(
          and(eq(qepRequirementBaseline.id, id), eq(qepRequirementBaseline.tenantId, tenantId)),
        )
        .returning();
      const items = await loadItems(tenantId, id);
      return mapBaselineRow(row!, items);
    },

    async lockBaseline(tenantId, id, integrity, lockedAt, lockedBy) {
      const existing = await requireRow(tenantId, id);
      if (existing.status === "locked") {
        throw new QepBaselineAlreadyLockedError();
      }
      if (existing.status === "archived") {
        throw new QepBaselineArchivedError();
      }
      const existingItems = await loadItems(tenantId, id);
      if (existingItems.length === 0) {
        throw new QepBaselineInvalidStateError(
          "A baseline must contain at least one Requirement Content Version before it can be locked",
        );
      }
      const [row] = await db
        .update(qepRequirementBaseline)
        .set({
          status: "locked",
          integrityFingerprint: integrity.fingerprint,
          integrityAlgorithm: integrity.algorithm,
          integritySchemaVersion: integrity.schemaVersion,
          integrityVerificationStatus: integrity.verificationStatus,
          integrityVerifiedAt: new Date(integrity.verifiedAt),
          lockedAt: new Date(lockedAt),
          lockedBy,
          updatedAt: new Date(lockedAt),
          updatedBy: lockedBy,
        })
        .where(
          and(
            eq(qepRequirementBaseline.id, id),
            eq(qepRequirementBaseline.tenantId, tenantId),
            eq(qepRequirementBaseline.status, "draft"),
          ),
        )
        .returning();
      if (!row) {
        throw new QepBaselineInvalidStateError("Requirement baseline could not be locked");
      }
      return mapBaselineRow(row, existingItems);
    },

    async recordIntegrityVerification(tenantId, id, verification) {
      const existing = await requireRow(tenantId, id);
      if (existing.status === "draft") {
        throw new QepBaselineInvalidStateError(
          "Only locked or archived requirement baselines can be integrity-verified",
        );
      }
      const [row] = await db
        .update(qepRequirementBaseline)
        .set({
          integrityVerificationStatus: verification.verificationStatus,
          integrityVerifiedAt: new Date(verification.verifiedAt),
        })
        .where(
          and(eq(qepRequirementBaseline.id, id), eq(qepRequirementBaseline.tenantId, tenantId)),
        )
        .returning();
      if (!row) {
        throw new QepBaselineNotFoundError(`Requirement baseline not found: ${id}`);
      }
      const items = await loadItems(tenantId, id);
      return mapBaselineRow(row, items);
    },

    async archiveBaseline(tenantId, id, archivedAt, archivedBy) {
      const existing = await requireRow(tenantId, id);
      if (existing.status === "archived") {
        throw new QepBaselineArchivedError();
      }
      if (existing.status !== "locked") {
        throw new QepBaselineInvalidStateError(
          "Only locked requirement baselines may be archived",
        );
      }
      const [row] = await db
        .update(qepRequirementBaseline)
        .set({
          status: "archived",
          archivedAt: new Date(archivedAt),
          archivedBy,
          updatedAt: new Date(archivedAt),
          updatedBy: archivedBy,
        })
        .where(
          and(
            eq(qepRequirementBaseline.id, id),
            eq(qepRequirementBaseline.tenantId, tenantId),
            eq(qepRequirementBaseline.status, "locked"),
          ),
        )
        .returning();
      if (!row) {
        throw new QepBaselineInvalidStateError("Requirement baseline could not be archived");
      }
      const items = await loadItems(tenantId, id);
      return mapBaselineRow(row, items);
    },

    async baselineExists(tenantId, id) {
      const row = await loadRow(tenantId, id);
      return row !== null;
    },

    async baselineNumberExists(tenantId, number) {
      const rows = await db
        .select({ id: qepRequirementBaseline.id })
        .from(qepRequirementBaseline)
        .where(
          and(
            eq(qepRequirementBaseline.tenantId, tenantId),
            eq(qepRequirementBaseline.baselineNumber, number),
          ),
        )
        .limit(1);
      return rows.length > 0;
    },

    async listBaselineItems(tenantId, id) {
      await requireRow(tenantId, id);
      return loadItems(tenantId, id);
    },

    async nextBaselineNumber(tenantId) {
      const rows = await db
        .select({
          max: sql<number>`coalesce(max(${qepRequirementBaseline.baselineNumber}), 0)::int`,
        })
        .from(qepRequirementBaseline)
        .where(eq(qepRequirementBaseline.tenantId, tenantId));
      return (rows[0]?.max ?? 0) + 1;
    },

    async listBaselinesForRequirement(tenantId, requirementId) {
      const rows = await db
        .selectDistinct({ baselineId: qepRequirementBaselineItem.baselineId })
        .from(qepRequirementBaselineItem)
        .where(
          and(
            eq(qepRequirementBaselineItem.tenantId, tenantId),
            eq(qepRequirementBaselineItem.requirementId, requirementId),
          ),
        );
      const baselines = await Promise.all(
        rows.map((row) => loadBaseline(tenantId, row.baselineId as RequirementBaselineId)),
      );
      return baselines
        .filter((row): row is RequirementBaseline => row !== null)
        .sort((a, b) => a.number - b.number);
    },
  };
}
