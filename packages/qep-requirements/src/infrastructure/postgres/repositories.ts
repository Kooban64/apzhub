import type { DatabaseExecutor } from "@apzhub/config";
import { randomUUID } from "node:crypto";
import {
  qepRequirement,
  qepRequirementAudit,
  qepRequirementLifecycleHistory,
  qepRequirementContentVersion,
} from "@apzhub/config";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

import type { RequirementAuditEntry } from "../../domain/repositories/requirement-audit-repository";
import type {
  AppendRequirementLifecycleHistoryInput,
  RequirementLifecycleHistoryEntry,
} from "../../domain/repositories/requirement-lifecycle-history-repository";
import type {
  RequirementArchiveOptions,
  RequirementListQuery,
  RequirementRepository,
  RequirementSearchQuery,
} from "../../domain/repositories/requirement-repository";
import type { RequirementId } from "../../domain/value-objects/requirement-id";
import type { RequirementContentVersion } from "../../domain/content-version/requirement-content-version";
import type { RequirementContentVersionRepository } from "../../domain/repositories/requirement-content-version-repository";
import {
  QepConflictError,
  QepNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";
import {
  persistedRequirementToRow,
  rowToPersistedRequirement,
} from "../mappers/requirement-mapper";
import type { QepRequirementsRepositories } from "../in-memory/repositories";
import { createPostgresRequirementBaselineRepository } from "./baseline-repository";
import {
  createPostgresRelationshipTaxonomyRepository,
  createPostgresRequirementsRelationshipRepository,
} from "./relationship-repository";

export function createPostgresQepRequirementsRepositories(
  db: DatabaseExecutor,
): QepRequirementsRepositories {
  const requirements: RequirementRepository = {
    async findById(tenantId, id) {
      const rows = await db
        .select()
        .from(qepRequirement)
        .where(and(eq(qepRequirement.tenantId, tenantId), eq(qepRequirement.id, id)))
        .limit(1);
      const row = rows[0];
      return row ? rowToPersistedRequirement(row) : null;
    },

    async findByKey(tenantId, key) {
      const rows = await db
        .select()
        .from(qepRequirement)
        .where(
          and(
            eq(qepRequirement.tenantId, tenantId),
            eq(qepRequirement.key, key.trim()),
            isNull(qepRequirement.archivedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? rowToPersistedRequirement(row) : null;
    },

    async list(tenantId, query: RequirementListQuery) {
      const conditions = [eq(qepRequirement.tenantId, tenantId)];
      if (query.projectId) {
        conditions.push(eq(qepRequirement.projectId, query.projectId));
      }
      if (query.status) {
        conditions.push(eq(qepRequirement.status, query.status));
      }
      if (!query.includeArchived) {
        conditions.push(isNull(qepRequirement.archivedAt));
      }
      const rows = await db
        .select()
        .from(qepRequirement)
        .where(and(...conditions))
        .orderBy(qepRequirement.updatedAt);
      return rows.map(rowToPersistedRequirement);
    },

    async search(tenantId, query: RequirementSearchQuery) {
      const needle = query.q.trim();
      const conditions = [eq(qepRequirement.tenantId, tenantId)];
      if (query.projectId) {
        conditions.push(eq(qepRequirement.projectId, query.projectId));
      }
      if (!query.includeArchived) {
        conditions.push(isNull(qepRequirement.archivedAt));
      }
      if (needle) {
        const pattern = `%${needle}%`;
        conditions.push(
          or(
            ilike(qepRequirement.key, pattern),
            ilike(qepRequirement.title, pattern),
            ilike(qepRequirement.description, pattern),
          )!,
        );
      }
      const rows = await db
        .select()
        .from(qepRequirement)
        .where(and(...conditions))
        .orderBy(qepRequirement.updatedAt);
      return rows.map(rowToPersistedRequirement);
    },

    async create(record) {
      try {
        const [row] = await db
          .insert(qepRequirement)
          .values(persistedRequirementToRow(record))
          .returning();
        if (!row) {
          throw new QepConflictError("Failed to create requirement");
        }
        return rowToPersistedRequirement(row);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new QepConflictError(`Requirement key already exists: ${record.key}`);
        }
        throw error;
      }
    },

    async update(record) {
      const nextRevision = record.revision + 1;
      const [updated] = await db
        .update(qepRequirement)
        .set(persistedRequirementToRow({ ...record, revision: nextRevision }))
        .where(
          and(
            eq(qepRequirement.id, record.id),
            eq(qepRequirement.tenantId, record.tenantId),
            eq(qepRequirement.revision, record.revision),
            isNull(qepRequirement.archivedAt),
          ),
        )
        .returning();
      if (!updated) {
        const existing = await requirements.findById(record.tenantId, record.id);
        if (!existing || existing.archivedAt) {
          throw new QepNotFoundError(`Requirement not found: ${record.id}`);
        }
        throw new QepRevisionConflictError(
          record.id,
          record.revision,
          existing.revision,
        );
      }
      return rowToPersistedRequirement(updated);
    },

    async archive(tenantId, id, options: RequirementArchiveOptions) {
      const conditions = [
        eq(qepRequirement.id, id),
        eq(qepRequirement.tenantId, tenantId),
        isNull(qepRequirement.archivedAt),
      ];
      if (options.expectedRevision !== undefined) {
        conditions.push(eq(qepRequirement.revision, options.expectedRevision));
      }
      const [updated] = await db
        .update(qepRequirement)
        .set({
          status: "archived",
          archivedAt: new Date(options.archivedAt),
          archivedBy: options.archivedBy,
          updatedAt: new Date(options.archivedAt),
          updatedBy: options.archivedBy,
          revision: sql`${qepRequirement.revision} + 1`,
        })
        .where(and(...conditions))
        .returning();
      if (!updated) {
        const existing = await requirements.findById(tenantId, id);
        if (!existing || existing.archivedAt) {
          throw new QepNotFoundError(`Requirement not found: ${id}`);
        }
        if (options.expectedRevision !== undefined) {
          throw new QepRevisionConflictError(
            id,
            options.expectedRevision,
            existing.revision,
          );
        }
        throw new QepNotFoundError(`Requirement not found: ${id}`);
      }
      return rowToPersistedRequirement(updated);
    },
  };

  const audits = {
    async append(entry: RequirementAuditEntry) {
      const [row] = await db
        .insert(qepRequirementAudit)
        .values({
          id: entry.id,
          tenantId: entry.tenantId,
          requirementId: entry.requirementId,
          action: entry.action,
          actorUserId: entry.actorUserId,
          correlationId: entry.correlationId,
          detailsJson: { ...entry.detailsJson },
          createdAt: new Date(entry.createdAt),
        })
        .returning();
      if (!row) {
        throw new Error("Failed to append requirement audit entry");
      }
      return {
        id: row.id,
        tenantId: row.tenantId,
        requirementId: row.requirementId as RequirementId,
        action: row.action,
        actorUserId: row.actorUserId,
        correlationId: row.correlationId,
        detailsJson: row.detailsJson ?? {},
        createdAt: row.createdAt.toISOString(),
      };
    },

    async listByRequirement(tenantId: string, requirementId: RequirementId) {
      const rows = await db
        .select()
        .from(qepRequirementAudit)
        .where(
          and(
            eq(qepRequirementAudit.tenantId, tenantId),
            eq(qepRequirementAudit.requirementId, requirementId),
          ),
        )
        .orderBy(qepRequirementAudit.createdAt);
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        requirementId: row.requirementId as RequirementId,
        action: row.action,
        actorUserId: row.actorUserId,
        correlationId: row.correlationId,
        detailsJson: row.detailsJson ?? {},
        createdAt: row.createdAt.toISOString(),
      }));
    },
  };

  const lifecycleHistory = {
    async append(entry: AppendRequirementLifecycleHistoryInput) {
      const id = entry.id ?? randomUUID();
      const [row] = await db
        .insert(qepRequirementLifecycleHistory)
        .values({
          id,
          tenantId: entry.tenantId,
          requirementId: entry.requirementId,
          previousState: entry.previousState,
          newState: entry.newState,
          action: entry.action,
          actorUserId: entry.actorUserId,
          reason: entry.reason ?? null,
          comments: entry.comments ?? null,
          correlationId: entry.correlationId,
          revision: entry.revision ?? null,
          metadataJson: entry.metadataJson ?? null,
          createdAt: new Date(entry.createdAt ?? new Date().toISOString()),
        })
        .returning();
      if (!row) {
        throw new Error("Failed to append requirement lifecycle history entry");
      }
      return mapLifecycleHistoryRow(row);
    },

    async listByRequirement(tenantId: string, requirementId: RequirementId) {
      const rows = await db
        .select()
        .from(qepRequirementLifecycleHistory)
        .where(
          and(
            eq(qepRequirementLifecycleHistory.tenantId, tenantId),
            eq(qepRequirementLifecycleHistory.requirementId, requirementId),
          ),
        )
        .orderBy(qepRequirementLifecycleHistory.createdAt);
      return rows.map(mapLifecycleHistoryRow);
    },
  };

  const contentVersions: RequirementContentVersionRepository = {
    async append(version) {
      const [row] = await db
        .insert(qepRequirementContentVersion)
        .values({
          id: version.id,
          tenantId: version.tenantId,
          requirementId: version.requirementId,
          versionNumber: version.versionNumber,
          parentVersionNumber: version.parentVersionNumber ?? null,
          parentVersionId: version.parentVersionId ?? null,
          snapshotJson: version.snapshot,
          snapshotSchemaVersion: version.snapshotSchemaVersion,
          hashAlgorithm: version.hashAlgorithm,
          snapshotHash: version.snapshotHash,
          changeReason: version.changeReason,
          actorUserId: version.actorUserId,
          createdAt: new Date(version.createdAt),
          sourceRevision: version.sourceRevision,
          correlationId: version.correlationId,
        })
        .returning();
      if (!row)
        throw new QepConflictError("Failed to append requirement content version");
      return mapContentVersionRow(row);
    },
    async getById(tenantId, id) {
      const [row] = await db
        .select()
        .from(qepRequirementContentVersion)
        .where(
          and(
            eq(qepRequirementContentVersion.tenantId, tenantId),
            eq(qepRequirementContentVersion.id, id),
          ),
        )
        .limit(1);
      return row ? mapContentVersionRow(row) : null;
    },
    async getByRequirementAndNumber(tenantId, requirementId, versionNumber) {
      const [row] = await db
        .select()
        .from(qepRequirementContentVersion)
        .where(
          and(
            eq(qepRequirementContentVersion.tenantId, tenantId),
            eq(qepRequirementContentVersion.requirementId, requirementId),
            eq(qepRequirementContentVersion.versionNumber, versionNumber),
          ),
        )
        .limit(1);
      return row ? mapContentVersionRow(row) : null;
    },
    async getLatest(tenantId, requirementId) {
      const [row] = await db
        .select()
        .from(qepRequirementContentVersion)
        .where(
          and(
            eq(qepRequirementContentVersion.tenantId, tenantId),
            eq(qepRequirementContentVersion.requirementId, requirementId),
          ),
        )
        .orderBy(desc(qepRequirementContentVersion.versionNumber))
        .limit(1);
      return row ? mapContentVersionRow(row) : null;
    },
    async listMetadata(tenantId, requirementId, pagination = {}) {
      const rows = await db
        .select({
          id: qepRequirementContentVersion.id,
          tenantId: qepRequirementContentVersion.tenantId,
          requirementId: qepRequirementContentVersion.requirementId,
          versionNumber: qepRequirementContentVersion.versionNumber,
          parentVersionNumber: qepRequirementContentVersion.parentVersionNumber,
          parentVersionId: qepRequirementContentVersion.parentVersionId,
          snapshotSchemaVersion: qepRequirementContentVersion.snapshotSchemaVersion,
          hashAlgorithm: qepRequirementContentVersion.hashAlgorithm,
          snapshotHash: qepRequirementContentVersion.snapshotHash,
          changeReason: qepRequirementContentVersion.changeReason,
          actorUserId: qepRequirementContentVersion.actorUserId,
          createdAt: qepRequirementContentVersion.createdAt,
          sourceRevision: qepRequirementContentVersion.sourceRevision,
          correlationId: qepRequirementContentVersion.correlationId,
        })
        .from(qepRequirementContentVersion)
        .where(
          and(
            eq(qepRequirementContentVersion.tenantId, tenantId),
            eq(qepRequirementContentVersion.requirementId, requirementId),
          ),
        )
        .orderBy(desc(qepRequirementContentVersion.versionNumber))
        .limit(pagination.limit ?? 100)
        .offset(pagination.offset ?? 0);
      return rows.map((row) => ({
        id: row.id as RequirementContentVersion["id"],
        tenantId: row.tenantId,
        requirementId: row.requirementId as RequirementId,
        versionNumber: row.versionNumber as RequirementContentVersion["versionNumber"],
        ...(row.parentVersionNumber !== null
          ? {
              parentVersionNumber:
                row.parentVersionNumber as RequirementContentVersion["versionNumber"],
            }
          : {}),
        ...(row.parentVersionId
          ? { parentVersionId: row.parentVersionId as RequirementContentVersion["id"] }
          : {}),
        snapshotSchemaVersion:
          row.snapshotSchemaVersion as RequirementContentVersion["snapshotSchemaVersion"],
        hashAlgorithm: row.hashAlgorithm as RequirementContentVersion["hashAlgorithm"],
        snapshotHash: row.snapshotHash,
        changeReason: row.changeReason as RequirementContentVersion["changeReason"],
        actorUserId: row.actorUserId,
        createdAt: row.createdAt.toISOString(),
        sourceRevision: row.sourceRevision,
        correlationId: row.correlationId,
      }));
    },
    async exists(tenantId, requirementId, versionNumber) {
      return (
        (await contentVersions.getByRequirementAndNumber(
          tenantId,
          requirementId,
          versionNumber,
        )) !== null
      );
    },
  };

  const baselines = createPostgresRequirementBaselineRepository(db);
  const relationships = createPostgresRequirementsRelationshipRepository(db);
  const relationshipTaxonomy = createPostgresRelationshipTaxonomyRepository(db);

  return {
    requirements,
    audits,
    lifecycleHistory,
    contentVersions,
    baselines,
    relationships,
    relationshipTaxonomy,
  };
}

function mapContentVersionRow(
  row: typeof qepRequirementContentVersion.$inferSelect,
): RequirementContentVersion {
  return {
    id: row.id as RequirementContentVersion["id"],
    tenantId: row.tenantId,
    requirementId: row.requirementId as RequirementId,
    versionNumber: row.versionNumber as RequirementContentVersion["versionNumber"],
    ...(row.parentVersionNumber !== null
      ? {
          parentVersionNumber:
            row.parentVersionNumber as RequirementContentVersion["versionNumber"],
        }
      : {}),
    ...(row.parentVersionId
      ? { parentVersionId: row.parentVersionId as RequirementContentVersion["id"] }
      : {}),
    snapshot: row.snapshotJson as RequirementContentVersion["snapshot"],
    snapshotSchemaVersion:
      row.snapshotSchemaVersion as RequirementContentVersion["snapshotSchemaVersion"],
    hashAlgorithm: row.hashAlgorithm as RequirementContentVersion["hashAlgorithm"],
    snapshotHash: row.snapshotHash,
    changeReason: row.changeReason as RequirementContentVersion["changeReason"],
    actorUserId: row.actorUserId,
    createdAt: row.createdAt.toISOString(),
    sourceRevision: row.sourceRevision,
    correlationId: row.correlationId,
  };
}

function mapLifecycleHistoryRow(
  row: typeof qepRequirementLifecycleHistory.$inferSelect,
): RequirementLifecycleHistoryEntry {
  return {
    id: row.id,
    tenantId: row.tenantId,
    requirementId: row.requirementId as RequirementId,
    previousState:
      row.previousState as RequirementLifecycleHistoryEntry["previousState"],
    newState: row.newState as RequirementLifecycleHistoryEntry["newState"],
    action: row.action,
    actorUserId: row.actorUserId,
    reason: row.reason ?? undefined,
    comments: row.comments ?? undefined,
    correlationId: row.correlationId,
    revision: row.revision ?? undefined,
    metadataJson: row.metadataJson ?? undefined,
    createdAt: row.createdAt.toISOString(),
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
