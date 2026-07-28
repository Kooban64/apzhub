import {
  computeQepBaselineAvailableActions,
  computeQepRelationshipAvailableActions,
  type AddQepBaselineItemInput,
  type CompareQepBaselinesInput,
  type CreateQepBaselineInput,
  type CreateQepRelationshipInput,
  type CreateQepRequirementInput,
  type ListQepBaselinesQuery,
  type ListQepRelationshipsQuery,
  type ListQepRequirementContentVersionsQuery,
  type ListQepRequirementsQuery,
  type QepBaselineCompareResult,
  type QepBaselineDto,
  type QepBaselineItemDto,
  type QepBaselineListResult,
  type QepRelationshipDto,
  type QepRelationshipEndpointDto,
  type QepRelationshipHistorySummaryDto,
  type QepRelationshipListResult,
  type QepRelationshipTaxonomyDto,
  type QepRequirementContentVersionDetailDto,
  type QepRequirementContentVersionMetadataDto,
  type QepRequirementDto,
  type QepRequirementLifecycleHistoryDto,
  type QepRequirementLifecycleTransitionDto,
  type QepRequirementLifecycleTransitionInput,
  type QepRequirementService,
  type QepRequestContext,
  type SearchQepRequirementsQuery,
  type SupersedeQepRelationshipInput,
  type UpdateQepBaselineDraftInput,
  type UpdateQepRelationshipProfileInput,
  type UpdateQepRequirementInput,
} from "@apzhub/qep-contracts";

import type { RequirementBaseline, RequirementBaselineItem } from "../../domain/baseline";
import type { RequirementContentVersion } from "../../domain/content-version";
import type { PersistedRequirement } from "../../domain/persisted-requirement";
import type {
  RelationshipEndpoint,
  RelationshipHistoryEntry,
  RelationshipTaxonomyDefinition,
  StoredRequirementsRelationship,
} from "../../domain/relationship";
import type { RequirementApplicationService } from "../services/create-requirement-application-service";
import type { RequirementBaselineApplicationService } from "../services/requirement-baseline-application-service";
import type { RequirementRelationshipApplicationService } from "../services/requirement-relationship-application-service";

function toDto(record: PersistedRequirement): QepRequirementDto {
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    key: record.key,
    title: record.title,
    description: record.description,
    type: record.type,
    status: record.status,
    priority: record.priority,
    category: record.category,
    owner: record.owner
      ? {
          userId: record.owner.userId,
          displayName: record.owner.displayName,
        }
      : undefined,
    approvalState: record.approvalState,
    versionMajor: record.version.major,
    versionMinor: record.version.minor,
    versionPatch: record.version.patch,
    acceptanceCriteria: record.acceptanceCriteria
      ? { items: [...record.acceptanceCriteria.items] }
      : undefined,
    attributes: {
      tags: [...record.attributes.tags],
      custom: { ...record.attributes.custom },
    },
    references: record.references.map((ref: PersistedRequirement["references"][number]) => ({
      system: ref.system,
      externalId: ref.externalId,
      label: ref.label,
    })),
    baseline: record.baseline
      ? {
          baselineId: record.baseline.baselineId,
          label: record.baseline.label,
        }
      : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    archivedAt: record.archivedAt,
    archivedBy: record.archivedBy,
    revision: record.revision,
  };
}

function toHistoryDto(
  entry: Awaited<ReturnType<RequirementApplicationService["getLifecycleHistory"]>>[number],
): QepRequirementLifecycleHistoryDto {
  return {
    id: entry.id,
    requirementId: entry.requirementId,
    previousState: entry.previousState,
    newState: entry.newState,
    action: entry.action,
    actorUserId: entry.actorUserId,
    reason: entry.reason,
    comments: entry.comments,
    correlationId: entry.correlationId,
    revision: entry.revision,
    metadata: entry.metadataJson,
    createdAt: entry.createdAt,
  };
}

function toVersionMetadataDto(
  record: Omit<RequirementContentVersion, "snapshot">,
): QepRequirementContentVersionMetadataDto {
  return {
    id: record.id,
    requirementId: record.requirementId,
    versionNumber: record.versionNumber,
    parentVersionNumber: record.parentVersionNumber,
    parentVersionId: record.parentVersionId,
    snapshotSchemaVersion: record.snapshotSchemaVersion,
    hashAlgorithm: record.hashAlgorithm,
    snapshotHash: record.snapshotHash,
    changeReason: record.changeReason,
    actorUserId: record.actorUserId,
    createdAt: record.createdAt,
    sourceRevision: record.sourceRevision,
    correlationId: record.correlationId,
  };
}

function toVersionDetailDto(record: RequirementContentVersion): QepRequirementContentVersionDetailDto {
  return { ...toVersionMetadataDto(record), snapshot: record.snapshot };
}

function toBaselineItemDto(item: RequirementBaselineItem): QepBaselineItemDto {
  return {
    requirementId: item.requirementId,
    contentVersionId: item.contentVersionId,
    contentVersionNumber: item.contentVersionNumber,
    includedAt: item.includedAt,
    includedBy: item.includedBy,
  };
}

function toBaselineDto(baseline: RequirementBaseline, ctx: QepRequestContext): QepBaselineDto {
  return {
    id: baseline.id,
    tenantId: baseline.tenantId,
    number: baseline.number,
    name: baseline.name,
    description: baseline.description,
    status: baseline.status,
    itemCount: baseline.items.length,
    items: baseline.items.map(toBaselineItemDto),
    createdAt: baseline.createdAt,
    createdBy: baseline.createdBy,
    updatedAt: baseline.updatedAt,
    updatedBy: baseline.updatedBy,
    correlationId: baseline.correlationId,
    integrityFingerprint: baseline.integrityFingerprint,
    integrityAlgorithm: baseline.integrityAlgorithm,
    integritySchemaVersion: baseline.integritySchemaVersion,
    integrityVerificationStatus: baseline.integrityVerificationStatus,
    integrityVerifiedAt: baseline.integrityVerifiedAt,
    lockedAt: baseline.lockedAt,
    lockedBy: baseline.lockedBy,
    archivedAt: baseline.archivedAt,
    archivedBy: baseline.archivedBy,
    availableActions: computeQepBaselineAvailableActions(baseline.status, ctx.permissions),
  };
}

function toRelationshipEndpointDto(endpoint: RelationshipEndpoint): QepRelationshipEndpointDto {
  return {
    mode: endpoint.mode,
    requirementId: endpoint.requirementId,
    contentVersionId: endpoint.contentVersionId,
  };
}

function toRelationshipHistorySummaryDto(
  entry: RelationshipHistoryEntry,
): QepRelationshipHistorySummaryDto {
  return {
    at: entry.at,
    by: entry.by,
    kind: entry.kind,
    summary: entry.summary,
  };
}

function toRelationshipDto(
  relationship: StoredRequirementsRelationship,
  ctx: QepRequestContext,
): QepRelationshipDto {
  return {
    id: relationship.id,
    tenantId: relationship.tenantId,
    type: relationship.type,
    lifecycleState: relationship.lifecycleState,
    source: toRelationshipEndpointDto(relationship.direction.source),
    target: toRelationshipEndpointDto(relationship.direction.target),
    strength: relationship.strength,
    criticality: relationship.criticality,
    classification: relationship.classification,
    scope: {
      kind: relationship.scope.kind,
      referenceId: relationship.scope.referenceId,
    },
    rationale: relationship.rationale,
    revision: relationship.revision,
    createdAt: relationship.createdAt,
    createdBy: relationship.createdBy,
    updatedAt: relationship.updatedAt,
    updatedBy: relationship.updatedBy,
    correlationId: relationship.correlationId,
    activatedAt: relationship.activatedAt,
    activatedBy: relationship.activatedBy,
    deprecatedAt: relationship.deprecatedAt,
    deprecatedBy: relationship.deprecatedBy,
    retiredAt: relationship.retiredAt,
    retiredBy: relationship.retiredBy,
    historySummaries: relationship.history.map(toRelationshipHistorySummaryDto),
    availableActions: computeQepRelationshipAvailableActions(
      relationship.lifecycleState,
      ctx.permissions,
    ),
  };
}

function toRelationshipTaxonomyDto(
  definition: RelationshipTaxonomyDefinition,
): QepRelationshipTaxonomyDto {
  return {
    type: definition.type,
    displayName: definition.displayName,
    description: definition.description,
    symmetric: definition.symmetric,
    inverseLabel: definition.inverseLabel,
    cyclePolicy: definition.cyclePolicy,
    rationalePolicy: definition.rationalePolicy,
    defaultStrength: definition.defaultStrength,
    certificationRelevant: definition.certificationRelevant,
    baselineProjectionDefault: definition.baselineProjectionDefault,
    strictTraceabilityDefault: definition.strictTraceabilityDefault,
    highlightInTraceability: definition.highlightInTraceability,
  };
}

export function createQepRequirementServiceAdapter(
  service: RequirementApplicationService,
  baselines: RequirementBaselineApplicationService,
  relationships?: RequirementRelationshipApplicationService,
): QepRequirementService {
  function requireRelationships(): RequirementRelationshipApplicationService {
    if (!relationships) {
      throw new Error("Requirement relationship application service is not configured");
    }
    return relationships;
  }

  return {
    async createRequirement(ctx: QepRequestContext, input: CreateQepRequirementInput) {
      const record = await service.createRequirement(ctx, input);
      return { ...toDto(record), latestContentVersion: toVersionMetadataDto(await service.getLatestContentVersion(ctx, record.id)) };
    },
    async updateRequirement(
      ctx: QepRequestContext,
      id: string,
      input: UpdateQepRequirementInput,
    ) {
      const record = await service.updateRequirement(ctx, id, input);
      return { ...toDto(record), latestContentVersion: toVersionMetadataDto(await service.getLatestContentVersion(ctx, record.id)) };
    },
    async archiveRequirement(
      ctx: QepRequestContext,
      id: string,
      input?: QepRequirementLifecycleTransitionInput,
    ) {
      return toDto(await service.archiveRequirement(ctx, id, input));
    },
    async submitRequirement(ctx, id, input = {}) {
      return toDto(await service.submitRequirement(ctx, id, input));
    },
    async reviewRequirement(ctx, id, input = {}) {
      return toDto(await service.reviewRequirement(ctx, id, input));
    },
    async approveRequirement(ctx, id, input = {}) {
      return toDto(await service.approveRequirement(ctx, id, input));
    },
    async rejectRequirement(ctx, id, input) {
      return toDto(await service.rejectRequirement(ctx, id, input));
    },
    async markImplemented(ctx, id, input = {}) {
      return toDto(await service.markImplemented(ctx, id, input));
    },
    async markVerified(ctx, id, input = {}) {
      return toDto(await service.markVerified(ctx, id, input));
    },
    async deprecateRequirement(ctx, id, input = {}) {
      return toDto(await service.deprecateRequirement(ctx, id, input));
    },
    async transitionRequirement(ctx, id, input) {
      return toDto(await service.transitionRequirement(ctx, id, input));
    },
    async getAvailableTransitions(ctx, id) {
      const transitions = await service.getAvailableTransitions(ctx, id);
      return transitions.map(
        (item): QepRequirementLifecycleTransitionDto => ({
          from: item.from,
          to: item.to,
          action: item.action,
        }),
      );
    },
    async getLifecycleHistory(ctx, id) {
      const history = await service.getLifecycleHistory(ctx, id);
      return history.map(toHistoryDto);
    },
    async getRequirement(ctx: QepRequestContext, id: string) {
      const record = await service.getRequirement(ctx, id);
      return record
        ? { ...toDto(record), latestContentVersion: toVersionMetadataDto(await service.getLatestContentVersion(ctx, id)) }
        : null;
    },
    async listRequirements(ctx: QepRequestContext, query: ListQepRequirementsQuery) {
      const result = await service.listRequirements(ctx, query);
      return {
        items: result.items.map(toDto),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },
    async searchRequirements(ctx: QepRequestContext, query: SearchQepRequirementsQuery) {
      const result = await service.searchRequirements(ctx, query);
      return {
        items: result.items.map(toDto),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },
    async listContentVersions(ctx, id, query: ListQepRequirementContentVersionsQuery = {}) {
      const all = await service.listContentVersions(ctx, id);
      const offset = query.offset ?? 0;
      const limit = query.limit ?? 50;
      return {
        items: all.slice(offset, offset + limit).map(toVersionMetadataDto),
        total: all.length,
        limit,
        offset,
      };
    },
    async getContentVersion(ctx, id, versionNumber) {
      return toVersionDetailDto(await service.getContentVersion(ctx, id, versionNumber));
    },
    async getLatestContentVersion(ctx, id) {
      return toVersionDetailDto(await service.getLatestContentVersion(ctx, id));
    },
    async compareContentVersions(ctx, id, input) {
      return service.compareContentVersions(ctx, id, input.baseVersionNumber, input.targetVersionNumber);
    },
    async verifyContentVersionIntegrity(ctx, id, versionNumber) {
      await service.verifyContentVersionIntegrity(ctx, id, versionNumber);
    },

    async createBaseline(ctx: QepRequestContext, input: CreateQepBaselineInput) {
      return toBaselineDto(await baselines.createBaseline(ctx, input), ctx);
    },
    async updateDraftBaseline(
      ctx: QepRequestContext,
      id: string,
      input: UpdateQepBaselineDraftInput,
    ) {
      return toBaselineDto(await baselines.updateDraftBaseline(ctx, id, input), ctx);
    },
    async addBaselineItem(ctx: QepRequestContext, id: string, input: AddQepBaselineItemInput) {
      return toBaselineDto(await baselines.addRequirementVersion(ctx, id, input), ctx);
    },
    async removeBaselineItem(ctx: QepRequestContext, id: string, contentVersionId: string) {
      return toBaselineDto(
        await baselines.removeRequirementVersion(ctx, id, contentVersionId),
        ctx,
      );
    },
    async lockBaseline(ctx: QepRequestContext, id: string) {
      return toBaselineDto(await baselines.lockBaseline(ctx, id), ctx);
    },
    async archiveBaseline(ctx: QepRequestContext, id: string) {
      return toBaselineDto(await baselines.archiveBaseline(ctx, id), ctx);
    },
    async verifyBaselineIntegrity(ctx: QepRequestContext, id: string) {
      return toBaselineDto(await baselines.verifyBaselineIntegrity(ctx, id), ctx);
    },
    async listBaselines(ctx: QepRequestContext, query: ListQepBaselinesQuery = {}) {
      const result = await baselines.listBaselines(ctx, query);
      return {
        items: result.items.map((item) => toBaselineDto(item, ctx)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepBaselineListResult;
    },
    async getBaseline(ctx: QepRequestContext, id: string) {
      const found = await baselines.getBaseline(ctx, id);
      return found ? toBaselineDto(found, ctx) : null;
    },
    async listBaselineItems(ctx: QepRequestContext, id: string) {
      const items = await baselines.listBaselineItems(ctx, id);
      return items.map(toBaselineItemDto);
    },
    async requirementBaselineHistory(ctx: QepRequestContext, requirementId: string) {
      const history = await baselines.requirementBaselineHistory(ctx, requirementId);
      return history.map((item) => toBaselineDto(item, ctx));
    },
    async compareBaselines(ctx: QepRequestContext, input: CompareQepBaselinesInput) {
      const result = await baselines.compareBaselines(ctx, input);
      return {
        baseBaselineId: result.baseBaselineId,
        targetBaselineId: result.targetBaselineId,
        added: result.added.map(toBaselineItemDto),
        removed: result.removed.map(toBaselineItemDto),
        unchanged: result.unchanged.map(toBaselineItemDto),
        versionChanged: result.versionChanged.map((change) => ({
          requirementId: change.requirementId,
          removed: toBaselineItemDto(change.removed),
          added: toBaselineItemDto(change.added),
        })),
        summary: result.summary,
      } satisfies QepBaselineCompareResult;
    },

    async createRelationship(ctx: QepRequestContext, input: CreateQepRelationshipInput) {
      const created = await requireRelationships().createRelationship(ctx, input);
      return toRelationshipDto(created, ctx);
    },
    async activateRelationship(ctx: QepRequestContext, id: string) {
      return toRelationshipDto(await requireRelationships().activateRelationship(ctx, id), ctx);
    },
    async deprecateRelationship(ctx: QepRequestContext, id: string) {
      return toRelationshipDto(await requireRelationships().deprecateRelationship(ctx, id), ctx);
    },
    async retireRelationship(ctx: QepRequestContext, id: string) {
      return toRelationshipDto(await requireRelationships().retireRelationship(ctx, id), ctx);
    },
    async supersedeRelationship(ctx: QepRequestContext, input: SupersedeQepRelationshipInput) {
      return toRelationshipDto(await requireRelationships().supersedeRelationship(ctx, input), ctx);
    },
    async updateRelationshipRationale(ctx: QepRequestContext, id: string, rationale: string) {
      return toRelationshipDto(
        await requireRelationships().updateRationale(ctx, id, rationale),
        ctx,
      );
    },
    async updateRelationshipProfile(
      ctx: QepRequestContext,
      id: string,
      input: UpdateQepRelationshipProfileInput,
    ) {
      return toRelationshipDto(
        await requireRelationships().updateSemanticProfile(ctx, id, input),
        ctx,
      );
    },
    async updateRelationshipStrength(ctx: QepRequestContext, id: string, strength: string) {
      return toRelationshipDto(await requireRelationships().updateStrength(ctx, id, strength), ctx);
    },
    async updateRelationshipClassification(
      ctx: QepRequestContext,
      id: string,
      classification: string,
    ) {
      return toRelationshipDto(
        await requireRelationships().updateClassification(ctx, id, classification),
        ctx,
      );
    },
    async updateRelationshipCriticality(ctx: QepRequestContext, id: string, criticality: string) {
      return toRelationshipDto(
        await requireRelationships().updateCriticality(ctx, id, criticality),
        ctx,
      );
    },
    async updateRelationshipScope(
      ctx: QepRequestContext,
      id: string,
      scope: { readonly kind: string; readonly referenceId?: string },
    ) {
      return toRelationshipDto(await requireRelationships().updateScope(ctx, id, scope), ctx);
    },
    async getRelationship(ctx: QepRequestContext, id: string) {
      const found = await requireRelationships().getRelationship(ctx, id);
      return found ? toRelationshipDto(found, ctx) : null;
    },
    async listRelationships(ctx: QepRequestContext, query: ListQepRelationshipsQuery = {}) {
      const result = await requireRelationships().listRelationships(ctx, {
        type: query.type as never,
        lifecycleState: query.lifecycleState as never,
        requirementId: query.requirementId,
        direction: query.direction,
        baselineId: query.baselineId,
        contentVersionId: query.contentVersionId,
        conflictsOnly: query.conflictsOnly,
        supersessionOnly: query.supersessionOnly,
        limit: query.limit,
        offset: query.offset,
      });
      return {
        items: result.items.map((item) => toRelationshipDto(item, ctx)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepRelationshipListResult;
    },
    async listRelationshipsByRequirement(
      ctx: QepRequestContext,
      requirementId: string,
      direction?: "inbound" | "outbound" | "both",
    ) {
      const items = await requireRelationships().listByRequirement(ctx, requirementId, direction);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listInboundRelationships(ctx: QepRequestContext, requirementId: string) {
      const items = await requireRelationships().listInbound(ctx, requirementId);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listOutboundRelationships(ctx: QepRequestContext, requirementId: string) {
      const items = await requireRelationships().listOutbound(ctx, requirementId);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipsByTaxonomy(ctx: QepRequestContext, type: string) {
      const items = await requireRelationships().listByTaxonomy(ctx, type);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipsByLifecycle(ctx: QepRequestContext, lifecycleState: string) {
      const items = await requireRelationships().listByLifecycle(ctx, lifecycleState);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipsByBaseline(ctx: QepRequestContext, baselineId: string) {
      const items = await requireRelationships().listByBaseline(ctx, baselineId);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipsByContentVersion(ctx: QepRequestContext, contentVersionId: string) {
      const items = await requireRelationships().listByContentVersion(ctx, contentVersionId);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipConflicts(ctx: QepRequestContext) {
      const items = await requireRelationships().listConflicts(ctx);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listSupersessionChains(ctx: QepRequestContext, requirementId?: string) {
      const items = await requireRelationships().listSupersessionChains(ctx, requirementId);
      return items.map((item) => toRelationshipDto(item, ctx));
    },
    async listRelationshipTaxonomy(ctx: QepRequestContext) {
      const items = await requireRelationships().listTaxonomy(ctx);
      return items.map(toRelationshipTaxonomyDto);
    },
  };
}
