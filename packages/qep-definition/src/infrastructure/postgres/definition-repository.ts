import {
  getDatabaseExecutor,
  qepAcceptanceCriterion,
  qepAcceptanceCriterionVerification,
  qepDefinitionKeyCounter,
  qepRequirementAudit,
  qepUserStory,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, asc, desc, eq, isNull } from "drizzle-orm";

import type {
  CriterionListFilter,
  DefinitionRepository,
  StoryListFilter,
} from "../../application/repository";
import type {
  CriterionStatus,
  DefinitionAuditEntry,
  OriginType,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  QepUserStory,
  StoryPriority,
  StoryStatus,
  StoryType,
  VerificationAssetKind,
  VerificationResult,
} from "../../domain/types";

function toStory(row: typeof qepUserStory.$inferSelect): QepUserStory {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    requirementId: row.requirementId,
    storyKey: row.storyKey,
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    storyType: row.storyType as StoryType,
    status: row.status as StoryStatus,
    priority: row.priority as StoryPriority,
    ...(typeof row.estimatePoints === "number"
      ? { estimatePoints: row.estimatePoints }
      : {}),
    ...(row.ownerUserId ? { ownerUserId: row.ownerUserId } : {}),
    originType: row.originType as OriginType,
    ...(row.originReference ? { originReference: row.originReference } : {}),
    ...(row.acceptedBy ? { acceptedBy: row.acceptedBy } : {}),
    ...(row.acceptedAt ? { acceptedAt: row.acceptedAt.toISOString() } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    ...(row.archivedAt ? { archivedAt: row.archivedAt.toISOString() } : {}),
    ...(row.archivedBy ? { archivedBy: row.archivedBy } : {}),
  };
}

function toCriterion(
  row: typeof qepAcceptanceCriterion.$inferSelect,
): QepAcceptanceCriterion {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    requirementId: row.requirementId,
    ...(row.userStoryId ? { userStoryId: row.userStoryId } : {}),
    criterionKey: row.criterionKey,
    text: row.text,
    required: row.required,
    status: row.status as CriterionStatus,
    sortOrder: row.sortOrder,
    originType: row.originType as OriginType,
    ...(row.originReference ? { originReference: row.originReference } : {}),
    ...(row.acceptedBy ? { acceptedBy: row.acceptedBy } : {}),
    ...(row.acceptedAt ? { acceptedAt: row.acceptedAt.toISOString() } : {}),
    ...(row.legacySourceKind
      ? {
          legacySourceKind: row.legacySourceKind,
          legacySourceIndex: row.legacySourceIndex ?? undefined,
        }
      : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    ...(row.archivedAt ? { archivedAt: row.archivedAt.toISOString() } : {}),
    ...(row.archivedBy ? { archivedBy: row.archivedBy } : {}),
  };
}

function toLink(
  row: typeof qepAcceptanceCriterionVerification.$inferSelect,
): QepCriterionVerificationLink {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    requirementId: row.requirementId,
    criterionId: row.criterionId,
    assetKind: row.assetKind as VerificationAssetKind,
    assetId: row.assetId,
    ...(row.latestResult
      ? { latestResult: row.latestResult as VerificationResult }
      : {}),
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

export function createPostgresDefinitionRepository(
  db: DatabaseExecutor,
): DefinitionRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const existing = await exec()
        .select()
        .from(qepDefinitionKeyCounter)
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        )
        .limit(1);
      if (!existing[0]) {
        await exec().insert(qepDefinitionKeyCounter).values({
          tenantId,
          applicationId,
          kind,
          nextValue: 1,
        });
        return 1;
      }
      const next = existing[0].nextValue + 1;
      await exec()
        .update(qepDefinitionKeyCounter)
        .set({ nextValue: next })
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        );
      return next;
    },

    async getStory(tenantId, storyId) {
      const rows = await exec()
        .select()
        .from(qepUserStory)
        .where(and(eq(qepUserStory.tenantId, tenantId), eq(qepUserStory.id, storyId)))
        .limit(1);
      return rows[0] ? toStory(rows[0]) : undefined;
    },

    async listStories(filter: StoryListFilter) {
      const rows = await exec()
        .select()
        .from(qepUserStory)
        .where(eq(qepUserStory.tenantId, filter.tenantId))
        .orderBy(desc(qepUserStory.updatedAt));
      return rows
        .map(toStory)
        .filter((row) =>
          filter.applicationId ? row.applicationId === filter.applicationId : true,
        )
        .filter((row) =>
          filter.requirementId ? row.requirementId === filter.requirementId : true,
        )
        .filter((row) => (filter.includeArchived ? true : row.status !== "archived"));
    },

    async saveStory(story) {
      const values = {
        id: story.id,
        tenantId: story.tenantId,
        applicationId: story.applicationId,
        requirementId: story.requirementId,
        storyKey: story.storyKey,
        title: story.title,
        description: story.description ?? null,
        storyType: story.storyType,
        status: story.status,
        priority: story.priority,
        estimatePoints: story.estimatePoints ?? null,
        ownerUserId: story.ownerUserId ?? null,
        originType: story.originType,
        originReference: story.originReference ?? null,
        acceptedBy: story.acceptedBy ?? null,
        acceptedAt: story.acceptedAt ? new Date(story.acceptedAt) : null,
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt),
        createdBy: story.createdBy,
        updatedBy: story.updatedBy,
        archivedAt: story.archivedAt ? new Date(story.archivedAt) : null,
        archivedBy: story.archivedBy ?? null,
      };
      const existing = await exec()
        .select({ id: qepUserStory.id })
        .from(qepUserStory)
        .where(eq(qepUserStory.id, story.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepUserStory)
          .set(values)
          .where(eq(qepUserStory.id, story.id));
        return;
      }
      await exec().insert(qepUserStory).values(values);
    },

    async getCriterion(tenantId, criterionId) {
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterion)
        .where(
          and(
            eq(qepAcceptanceCriterion.tenantId, tenantId),
            eq(qepAcceptanceCriterion.id, criterionId),
          ),
        )
        .limit(1);
      return rows[0] ? toCriterion(rows[0]) : undefined;
    },

    async getCriterionByLegacySource(tenantId, requirementId, sourceKind, sourceIndex) {
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterion)
        .where(
          and(
            eq(qepAcceptanceCriterion.tenantId, tenantId),
            eq(qepAcceptanceCriterion.requirementId, requirementId),
            eq(qepAcceptanceCriterion.legacySourceKind, sourceKind),
            eq(qepAcceptanceCriterion.legacySourceIndex, sourceIndex),
          ),
        )
        .limit(1);
      return rows[0] ? toCriterion(rows[0]) : undefined;
    },

    async listCriteria(filter: CriterionListFilter) {
      const clauses = [eq(qepAcceptanceCriterion.tenantId, filter.tenantId)];
      if (filter.applicationId) {
        clauses.push(eq(qepAcceptanceCriterion.applicationId, filter.applicationId));
      }
      if (filter.requirementId) {
        clauses.push(eq(qepAcceptanceCriterion.requirementId, filter.requirementId));
      }
      if (filter.userStoryId === null) {
        clauses.push(isNull(qepAcceptanceCriterion.userStoryId));
      } else if (filter.userStoryId) {
        clauses.push(eq(qepAcceptanceCriterion.userStoryId, filter.userStoryId));
      }
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterion)
        .where(and(...clauses))
        .orderBy(
          asc(qepAcceptanceCriterion.sortOrder),
          asc(qepAcceptanceCriterion.criterionKey),
        );
      return rows
        .map(toCriterion)
        .filter((row) => (filter.includeArchived ? true : row.status !== "archived"));
    },

    async saveCriterion(criterion) {
      const values = {
        id: criterion.id,
        tenantId: criterion.tenantId,
        applicationId: criterion.applicationId,
        requirementId: criterion.requirementId,
        userStoryId: criterion.userStoryId ?? null,
        criterionKey: criterion.criterionKey,
        text: criterion.text,
        required: criterion.required,
        status: criterion.status,
        sortOrder: criterion.sortOrder,
        originType: criterion.originType,
        originReference: criterion.originReference ?? null,
        acceptedBy: criterion.acceptedBy ?? null,
        acceptedAt: criterion.acceptedAt ? new Date(criterion.acceptedAt) : null,
        legacySourceKind: criterion.legacySourceKind ?? null,
        legacySourceIndex: criterion.legacySourceIndex ?? null,
        createdAt: new Date(criterion.createdAt),
        updatedAt: new Date(criterion.updatedAt),
        createdBy: criterion.createdBy,
        updatedBy: criterion.updatedBy,
        archivedAt: criterion.archivedAt ? new Date(criterion.archivedAt) : null,
        archivedBy: criterion.archivedBy ?? null,
      };
      const existing = await exec()
        .select({ id: qepAcceptanceCriterion.id })
        .from(qepAcceptanceCriterion)
        .where(eq(qepAcceptanceCriterion.id, criterion.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepAcceptanceCriterion)
          .set(values)
          .where(eq(qepAcceptanceCriterion.id, criterion.id));
        return;
      }
      await exec().insert(qepAcceptanceCriterion).values(values);
    },

    async listVerification(tenantId, criterionId) {
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterionVerification)
        .where(
          and(
            eq(qepAcceptanceCriterionVerification.tenantId, tenantId),
            eq(qepAcceptanceCriterionVerification.criterionId, criterionId),
          ),
        );
      return rows.map(toLink);
    },

    async getVerification(tenantId, linkId) {
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterionVerification)
        .where(
          and(
            eq(qepAcceptanceCriterionVerification.tenantId, tenantId),
            eq(qepAcceptanceCriterionVerification.id, linkId),
          ),
        )
        .limit(1);
      return rows[0] ? toLink(rows[0]) : undefined;
    },

    async saveVerification(link) {
      await exec()
        .insert(qepAcceptanceCriterionVerification)
        .values({
          id: link.id,
          tenantId: link.tenantId,
          applicationId: link.applicationId,
          requirementId: link.requirementId,
          criterionId: link.criterionId,
          assetKind: link.assetKind,
          assetId: link.assetId,
          latestResult: link.latestResult ?? null,
          createdAt: new Date(link.createdAt),
          createdBy: link.createdBy,
        });
    },

    async deleteVerification(tenantId, linkId) {
      await exec()
        .delete(qepAcceptanceCriterionVerification)
        .where(
          and(
            eq(qepAcceptanceCriterionVerification.tenantId, tenantId),
            eq(qepAcceptanceCriterionVerification.id, linkId),
          ),
        );
    },

    async appendAudit(entry: DefinitionAuditEntry) {
      await exec()
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
        });
    },

    async listAudit(tenantId, requirementId) {
      const rows = await exec()
        .select()
        .from(qepRequirementAudit)
        .where(
          and(
            eq(qepRequirementAudit.tenantId, tenantId),
            eq(qepRequirementAudit.requirementId, requirementId),
          ),
        )
        .orderBy(asc(qepRequirementAudit.createdAt));
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        requirementId: row.requirementId,
        action: row.action,
        actorUserId: row.actorUserId,
        correlationId: row.correlationId,
        detailsJson: row.detailsJson,
        createdAt: row.createdAt.toISOString(),
      }));
    },
  };
}
