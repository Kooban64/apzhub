import { randomUUID } from "node:crypto";

import {
  deriveAggregateCoverage,
  deriveCriterionCoverage,
  latestResultsFor,
} from "../domain/coverage";
import {
  assertCriterionApplicationBound,
  assertCriterionRequirementBound,
  assertSameApplication,
  assertSameRequirement,
  assertStoryApplicationBound,
  isOriginType,
  isStoryPriority,
  isStoryStatus,
  isStoryType,
  isVerificationAssetKind,
  isVerificationResult,
} from "../domain/guards";
import { LEGACY_AC_SOURCE_KIND } from "../domain/types";
import type {
  CoverageFacts,
  CreateCriterionInput,
  CreateStoryInput,
  CriterionStatus,
  PresentedCriterion,
  PresentedStory,
  PromoteLegacyCriteriaInput,
  PromoteLegacyCriteriaReport,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  QepUserStory,
  StoryStatus,
  UpdateCriterionInput,
  UpdateStoryInput,
  VerificationAssetKind,
  VerificationResult,
} from "../domain/types";
import type { DefinitionRepository } from "./repository";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function formatKey(prefix: string, n: number): string {
  return `${prefix}-${n}`;
}

async function presentCriteria(
  repository: DefinitionRepository,
  rows: readonly QepAcceptanceCriterion[],
): Promise<readonly PresentedCriterion[]> {
  const presented: PresentedCriterion[] = [];
  for (const row of rows) {
    const links = await repository.listVerification(row.tenantId, row.id);
    const derived = deriveCriterionCoverage({
      archived: row.status === "archived",
      verificationCount: links.length,
      latestResults: latestResultsFor(links),
    });
    presented.push({
      ...row,
      coverage: derived.coverage,
      result: derived.result,
      verificationCount: links.length,
    });
  }
  return presented;
}

export type DefinitionService = {
  createStory(input: CreateStoryInput): Promise<QepUserStory>;
  updateStory(
    tenantId: string,
    storyId: string,
    actorId: string,
    patch: UpdateStoryInput,
    correlationId?: string,
  ): Promise<QepUserStory>;
  archiveStory(
    tenantId: string,
    storyId: string,
    actorId: string,
    correlationId?: string,
  ): Promise<QepUserStory>;
  getStory(tenantId: string, storyId: string): Promise<QepUserStory>;
  listStories(filter: {
    readonly tenantId: string;
    readonly applicationId?: string;
    readonly requirementId?: string;
    readonly includeArchived?: boolean;
  }): Promise<readonly PresentedStory[]>;

  createCriterion(input: CreateCriterionInput): Promise<QepAcceptanceCriterion>;
  updateCriterion(
    tenantId: string,
    criterionId: string,
    actorId: string,
    patch: UpdateCriterionInput,
    correlationId?: string,
  ): Promise<QepAcceptanceCriterion>;
  archiveCriterion(
    tenantId: string,
    criterionId: string,
    actorId: string,
    correlationId?: string,
  ): Promise<QepAcceptanceCriterion>;
  reparentCriterion(
    tenantId: string,
    criterionId: string,
    actorId: string,
    userStoryId: string | null,
    correlationId?: string,
  ): Promise<QepAcceptanceCriterion>;
  getCriterion(tenantId: string, criterionId: string): Promise<PresentedCriterion>;
  listCriteria(filter: {
    readonly tenantId: string;
    readonly applicationId?: string;
    readonly requirementId?: string;
    readonly userStoryId?: string | null;
    readonly includeArchived?: boolean;
  }): Promise<readonly PresentedCriterion[]>;

  linkVerification(input: {
    readonly tenantId: string;
    readonly criterionId: string;
    readonly actorId: string;
    readonly assetKind: VerificationAssetKind;
    readonly assetId: string;
    readonly latestResult?: VerificationResult;
    readonly correlationId?: string;
  }): Promise<QepCriterionVerificationLink>;
  unlinkVerification(
    tenantId: string,
    linkId: string,
    actorId: string,
    correlationId?: string,
  ): Promise<void>;
  listVerification(
    tenantId: string,
    criterionId: string,
  ): Promise<readonly QepCriterionVerificationLink[]>;

  promoteLegacyCriteria(
    input: PromoteLegacyCriteriaInput,
  ): Promise<PromoteLegacyCriteriaReport>;

  coverageForRequirement(
    tenantId: string,
    requirementId: string,
  ): Promise<CoverageFacts>;
  coverageForStory(tenantId: string, storyId: string): Promise<CoverageFacts>;

  listAudit(
    tenantId: string,
    requirementId: string,
  ): Promise<
    readonly {
      readonly id: string;
      readonly action: string;
      readonly actorUserId: string;
      readonly createdAt: string;
      readonly detailsJson: Readonly<Record<string, unknown>>;
    }[]
  >;
};

export function createDefinitionService(
  repository: DefinitionRepository,
): DefinitionService {
  async function audit(input: {
    readonly tenantId: string;
    readonly requirementId: string;
    readonly action: string;
    readonly actorUserId: string;
    readonly detailsJson?: Readonly<Record<string, unknown>>;
    readonly correlationId?: string;
  }): Promise<void> {
    await repository.appendAudit({
      id: newId("qdefaud"),
      tenantId: input.tenantId,
      requirementId: input.requirementId,
      action: input.action,
      actorUserId: input.actorUserId,
      correlationId: input.correlationId ?? newId("corr"),
      detailsJson: input.detailsJson ?? {},
      createdAt: nowIso(),
    });
  }

  async function presentStories(
    rows: readonly QepUserStory[],
  ): Promise<readonly PresentedStory[]> {
    const presented: PresentedStory[] = [];
    for (const row of rows) {
      const criteria = await presentCriteria(
        repository,
        await repository.listCriteria({
          tenantId: row.tenantId,
          requirementId: row.requirementId,
          userStoryId: row.id,
          includeArchived: true,
        }),
      );
      const facts = deriveAggregateCoverage(criteria);
      presented.push({
        ...row,
        coverage: facts.coverage,
        criterionCount: facts.criterionCount,
        coveredCount: facts.coveredCount,
        gapCount: facts.gapCount,
      });
    }
    return presented;
  }

  return {
    async createStory(input) {
      assertStoryApplicationBound(input.applicationId);
      if (!input.requirementId.trim()) throw new Error("story.requirement_required");
      const title = input.title.trim();
      if (!title) throw new Error("story.title_required");
      const storyType = input.storyType ?? "feature";
      const status = input.status ?? "draft";
      const priority = input.priority ?? "medium";
      if (!isStoryType(storyType)) throw new Error("story.type_invalid");
      if (!isStoryStatus(status)) throw new Error("story.status_invalid");
      if (!isStoryPriority(priority)) throw new Error("story.priority_invalid");
      const originType = input.originType ?? "human";
      if (!isOriginType(originType)) throw new Error("story.origin_invalid");
      if (originType === "ai_accepted" && !input.acceptedBy) {
        throw new Error("story.ai_origin_requires_acceptance");
      }
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "user_story",
      );
      const now = nowIso();
      const story: QepUserStory = {
        id: newId("qus"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        requirementId: input.requirementId,
        storyKey: formatKey("US", n),
        title,
        ...(input.description?.trim() ? { description: input.description.trim() } : {}),
        storyType,
        status,
        priority,
        ...(typeof input.estimatePoints === "number"
          ? { estimatePoints: input.estimatePoints }
          : {}),
        ...(input.ownerUserId ? { ownerUserId: input.ownerUserId } : {}),
        originType,
        ...(input.originReference ? { originReference: input.originReference } : {}),
        ...(input.acceptedBy ? { acceptedBy: input.acceptedBy, acceptedAt: now } : {}),
        createdAt: now,
        updatedAt: now,
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.saveStory(story);
      await audit({
        tenantId: story.tenantId,
        requirementId: story.requirementId,
        action: "story.created",
        actorUserId: input.actorId,
        correlationId: input.correlationId,
        detailsJson: { storyId: story.id, storyKey: story.storyKey },
      });
      return story;
    },

    async updateStory(tenantId, storyId, actorId, patch, correlationId) {
      const existing = await repository.getStory(tenantId, storyId);
      if (!existing) throw new Error("story.not_found");
      if (existing.status === "archived") throw new Error("story.archived");
      const nextStatus = patch.status ?? existing.status;
      if (!isStoryStatus(nextStatus)) {
        throw new Error("story.status_invalid");
      }
      const nextType = patch.storyType ?? existing.storyType;
      const nextPriority = patch.priority ?? existing.priority;
      if (!isStoryType(nextType)) throw new Error("story.type_invalid");
      if (!isStoryPriority(nextPriority)) throw new Error("story.priority_invalid");
      const now = nowIso();
      const updated: QepUserStory = {
        ...existing,
        title: patch.title?.trim() || existing.title,
        ...(patch.description === null
          ? {}
          : patch.description !== undefined
            ? { description: patch.description.trim() || undefined }
            : existing.description
              ? { description: existing.description }
              : {}),
        storyType: nextType,
        status: nextStatus,
        priority: nextPriority,
        ...(patch.estimatePoints === null
          ? {}
          : typeof patch.estimatePoints === "number"
            ? { estimatePoints: patch.estimatePoints }
            : existing.estimatePoints !== undefined
              ? { estimatePoints: existing.estimatePoints }
              : {}),
        ...(patch.ownerUserId === null
          ? {}
          : patch.ownerUserId
            ? { ownerUserId: patch.ownerUserId }
            : existing.ownerUserId
              ? { ownerUserId: existing.ownerUserId }
              : {}),
        updatedAt: now,
        updatedBy: actorId,
      };
      const cleaned: QepUserStory = {
        id: updated.id,
        tenantId: updated.tenantId,
        applicationId: updated.applicationId,
        requirementId: updated.requirementId,
        storyKey: updated.storyKey,
        title: updated.title,
        ...(updated.description ? { description: updated.description } : {}),
        storyType: updated.storyType,
        status: updated.status,
        priority: updated.priority,
        ...(typeof updated.estimatePoints === "number"
          ? { estimatePoints: updated.estimatePoints }
          : {}),
        ...(updated.ownerUserId ? { ownerUserId: updated.ownerUserId } : {}),
        originType: updated.originType,
        ...(updated.originReference
          ? { originReference: updated.originReference }
          : {}),
        ...(updated.acceptedBy ? { acceptedBy: updated.acceptedBy } : {}),
        ...(updated.acceptedAt ? { acceptedAt: updated.acceptedAt } : {}),
        createdAt: updated.createdAt,
        updatedAt: now,
        createdBy: updated.createdBy,
        updatedBy: actorId,
        ...(updated.archivedAt ? { archivedAt: updated.archivedAt } : {}),
        ...(updated.archivedBy ? { archivedBy: updated.archivedBy } : {}),
      };
      await repository.saveStory(cleaned);
      await audit({
        tenantId,
        requirementId: existing.requirementId,
        action: "story.updated",
        actorUserId: actorId,
        correlationId,
        detailsJson: { storyId },
      });
      return cleaned;
    },

    async archiveStory(tenantId, storyId, actorId, correlationId) {
      const existing = await repository.getStory(tenantId, storyId);
      if (!existing) throw new Error("story.not_found");
      const now = nowIso();
      const archived: QepUserStory = {
        ...existing,
        status: "archived" satisfies StoryStatus,
        updatedAt: now,
        updatedBy: actorId,
        archivedAt: now,
        archivedBy: actorId,
      };
      await repository.saveStory(archived);
      await audit({
        tenantId,
        requirementId: existing.requirementId,
        action: "story.archived",
        actorUserId: actorId,
        correlationId,
        detailsJson: { storyId },
      });
      return archived;
    },

    async getStory(tenantId, storyId) {
      const row = await repository.getStory(tenantId, storyId);
      if (!row) throw new Error("story.not_found");
      return row;
    },

    async listStories(filter) {
      return presentStories(await repository.listStories(filter));
    },

    async createCriterion(input) {
      assertCriterionApplicationBound(input.applicationId);
      assertCriterionRequirementBound(input.requirementId);
      const text = input.text.trim();
      if (!text) throw new Error("criterion.text_required");
      const originType = input.originType ?? "human";
      if (!isOriginType(originType)) throw new Error("criterion.origin_invalid");
      if (originType === "ai_accepted" && !input.acceptedBy) {
        throw new Error("criterion.ai_origin_requires_acceptance");
      }
      if (input.userStoryId) {
        const story = await repository.getStory(input.tenantId, input.userStoryId);
        if (!story) throw new Error("story.not_found");
        assertSameRequirement(story.requirementId, input.requirementId);
        assertSameApplication(story.applicationId, input.applicationId);
      }
      const existingForReq = await repository.listCriteria({
        tenantId: input.tenantId,
        requirementId: input.requirementId,
        includeArchived: true,
      });
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "acceptance_criterion",
      );
      const now = nowIso();
      const criterion: QepAcceptanceCriterion = {
        id: newId("qac"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        requirementId: input.requirementId,
        ...(input.userStoryId ? { userStoryId: input.userStoryId } : {}),
        criterionKey: formatKey("AC", n),
        text,
        required: input.required ?? true,
        status: "active",
        sortOrder: existingForReq.length,
        originType,
        ...(input.originReference ? { originReference: input.originReference } : {}),
        ...(input.acceptedBy ? { acceptedBy: input.acceptedBy, acceptedAt: now } : {}),
        createdAt: now,
        updatedAt: now,
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.saveCriterion(criterion);
      await audit({
        tenantId: criterion.tenantId,
        requirementId: criterion.requirementId,
        action: "ac.created",
        actorUserId: input.actorId,
        correlationId: input.correlationId,
        detailsJson: {
          criterionId: criterion.id,
          criterionKey: criterion.criterionKey,
          userStoryId: criterion.userStoryId ?? null,
        },
      });
      return criterion;
    },

    async updateCriterion(tenantId, criterionId, actorId, patch, correlationId) {
      const existing = await repository.getCriterion(tenantId, criterionId);
      if (!existing) throw new Error("criterion.not_found");
      if (existing.status === "archived") throw new Error("criterion.archived");
      const updated: QepAcceptanceCriterion = {
        ...existing,
        text: patch.text?.trim() || existing.text,
        required: patch.required ?? existing.required,
        updatedAt: nowIso(),
        updatedBy: actorId,
      };
      await repository.saveCriterion(updated);
      await audit({
        tenantId,
        requirementId: existing.requirementId,
        action: "ac.updated",
        actorUserId: actorId,
        correlationId,
        detailsJson: { criterionId },
      });
      return updated;
    },

    async archiveCriterion(tenantId, criterionId, actorId, correlationId) {
      const existing = await repository.getCriterion(tenantId, criterionId);
      if (!existing) throw new Error("criterion.not_found");
      const now = nowIso();
      const archived: QepAcceptanceCriterion = {
        ...existing,
        status: "archived" satisfies CriterionStatus,
        updatedAt: now,
        updatedBy: actorId,
        archivedAt: now,
        archivedBy: actorId,
      };
      await repository.saveCriterion(archived);
      await audit({
        tenantId,
        requirementId: existing.requirementId,
        action: "ac.archived",
        actorUserId: actorId,
        correlationId,
        detailsJson: { criterionId },
      });
      return archived;
    },

    async reparentCriterion(
      tenantId,
      criterionId,
      actorId,
      userStoryId,
      correlationId,
    ) {
      const existing = await repository.getCriterion(tenantId, criterionId);
      if (!existing) throw new Error("criterion.not_found");
      if (existing.status === "archived") throw new Error("criterion.archived");
      let nextStoryId: string | undefined;
      if (userStoryId) {
        const story = await repository.getStory(tenantId, userStoryId);
        if (!story) throw new Error("story.not_found");
        assertSameRequirement(story.requirementId, existing.requirementId);
        assertSameApplication(story.applicationId, existing.applicationId);
        nextStoryId = story.id;
      }
      const updated: QepAcceptanceCriterion = {
        id: existing.id,
        tenantId: existing.tenantId,
        applicationId: existing.applicationId,
        requirementId: existing.requirementId,
        ...(nextStoryId ? { userStoryId: nextStoryId } : {}),
        criterionKey: existing.criterionKey,
        text: existing.text,
        required: existing.required,
        status: existing.status,
        sortOrder: existing.sortOrder,
        originType: existing.originType,
        ...(existing.originReference
          ? { originReference: existing.originReference }
          : {}),
        ...(existing.acceptedBy ? { acceptedBy: existing.acceptedBy } : {}),
        ...(existing.acceptedAt ? { acceptedAt: existing.acceptedAt } : {}),
        ...(existing.legacySourceKind
          ? {
              legacySourceKind: existing.legacySourceKind,
              legacySourceIndex: existing.legacySourceIndex,
            }
          : {}),
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
        createdBy: existing.createdBy,
        updatedBy: actorId,
      };
      await repository.saveCriterion(updated);
      await audit({
        tenantId,
        requirementId: existing.requirementId,
        action: "ac.reparented",
        actorUserId: actorId,
        correlationId,
        detailsJson: {
          criterionId,
          fromStoryId: existing.userStoryId ?? null,
          toStoryId: nextStoryId ?? null,
        },
      });
      return updated;
    },

    async getCriterion(tenantId, criterionId) {
      const row = await repository.getCriterion(tenantId, criterionId);
      if (!row) throw new Error("criterion.not_found");
      const [presented] = await presentCriteria(repository, [row]);
      if (!presented) throw new Error("criterion.not_found");
      return presented;
    },

    async listCriteria(filter) {
      return presentCriteria(repository, await repository.listCriteria(filter));
    },

    async linkVerification(input) {
      const criterion = await repository.getCriterion(
        input.tenantId,
        input.criterionId,
      );
      if (!criterion) throw new Error("criterion.not_found");
      if (!isVerificationAssetKind(input.assetKind)) {
        throw new Error("verification.asset_kind_unsupported");
      }
      if (!input.assetId.trim()) throw new Error("verification.asset_required");
      if (input.latestResult && !isVerificationResult(input.latestResult)) {
        throw new Error("verification.result_invalid");
      }
      const existing = await repository.listVerification(input.tenantId, criterion.id);
      const duplicate = existing.find(
        (row) => row.assetKind === input.assetKind && row.assetId === input.assetId,
      );
      if (duplicate) return duplicate;
      const link: QepCriterionVerificationLink = {
        id: newId("qacv"),
        tenantId: criterion.tenantId,
        applicationId: criterion.applicationId,
        requirementId: criterion.requirementId,
        criterionId: criterion.id,
        assetKind: input.assetKind,
        assetId: input.assetId.trim(),
        ...(input.latestResult ? { latestResult: input.latestResult } : {}),
        createdAt: nowIso(),
        createdBy: input.actorId,
      };
      await repository.saveVerification(link);
      await audit({
        tenantId: criterion.tenantId,
        requirementId: criterion.requirementId,
        action: "ac.verification.linked",
        actorUserId: input.actorId,
        correlationId: input.correlationId,
        detailsJson: {
          criterionId: criterion.id,
          assetKind: link.assetKind,
          assetId: link.assetId,
        },
      });
      return link;
    },

    async unlinkVerification(tenantId, linkId, actorId, correlationId) {
      const link = await repository.getVerification(tenantId, linkId);
      if (!link) throw new Error("verification.not_found");
      await repository.deleteVerification(tenantId, linkId);
      await audit({
        tenantId,
        requirementId: link.requirementId,
        action: "ac.verification.unlinked",
        actorUserId: actorId,
        correlationId,
        detailsJson: { criterionId: link.criterionId, linkId },
      });
    },

    async listVerification(tenantId, criterionId) {
      return repository.listVerification(tenantId, criterionId);
    },

    async promoteLegacyCriteria(input) {
      let created = 0;
      let skipped = 0;
      const preservedTexts: string[] = [];
      for (let index = 0; index < input.items.length; index += 1) {
        const raw = input.items[index];
        const text = (raw ?? "").trim();
        if (!text) {
          skipped += 1;
          continue;
        }
        const existing = await repository.getCriterionByLegacySource(
          input.tenantId,
          input.requirementId,
          LEGACY_AC_SOURCE_KIND,
          index,
        );
        if (existing) {
          skipped += 1;
          preservedTexts.push(existing.text);
          continue;
        }
        const n = await repository.nextKeyNumber(
          input.tenantId,
          input.applicationId,
          "acceptance_criterion",
        );
        const now = nowIso();
        const criterion: QepAcceptanceCriterion = {
          id: newId("qac"),
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          requirementId: input.requirementId,
          criterionKey: formatKey("AC", n),
          text,
          required: true,
          status: "active",
          sortOrder: index,
          originType: "migration",
          originReference: `${LEGACY_AC_SOURCE_KIND}:${index}`,
          legacySourceKind: LEGACY_AC_SOURCE_KIND,
          legacySourceIndex: index,
          createdAt: now,
          updatedAt: now,
          createdBy: input.actorId,
          updatedBy: input.actorId,
        };
        await repository.saveCriterion(criterion);
        created += 1;
        preservedTexts.push(text);
        await audit({
          tenantId: input.tenantId,
          requirementId: input.requirementId,
          action: "ac.promoted_from_legacy",
          actorUserId: input.actorId,
          correlationId: input.correlationId,
          detailsJson: {
            criterionId: criterion.id,
            criterionKey: criterion.criterionKey,
            sourceKind: LEGACY_AC_SOURCE_KIND,
            sourceIndex: index,
            userStoryId: null,
          },
        });
      }
      return {
        requirementId: input.requirementId,
        created,
        skipped,
        inventedStoryParents: 0,
        preservedTexts,
      };
    },

    async coverageForRequirement(tenantId, requirementId) {
      const rows = await presentCriteria(
        repository,
        await repository.listCriteria({
          tenantId,
          requirementId,
          includeArchived: true,
        }),
      );
      return deriveAggregateCoverage(rows);
    },

    async coverageForStory(tenantId, storyId) {
      const story = await repository.getStory(tenantId, storyId);
      if (!story) throw new Error("story.not_found");
      const rows = await presentCriteria(
        repository,
        await repository.listCriteria({
          tenantId,
          requirementId: story.requirementId,
          userStoryId: story.id,
          includeArchived: true,
        }),
      );
      return deriveAggregateCoverage(rows);
    },

    async listAudit(tenantId, requirementId) {
      const rows = await repository.listAudit(tenantId, requirementId);
      return rows.map((row) => ({
        id: row.id,
        action: row.action,
        actorUserId: row.actorUserId,
        createdAt: row.createdAt,
        detailsJson: row.detailsJson,
      }));
    },
  };
}
