import { randomUUID } from "node:crypto";

import type {
  CreateQepRequirementInput,
  ListQepRequirementsQuery,
  QepRequestContext,
  SearchQepRequirementsQuery,
  UpdateQepRequirementInput,
} from "@apzhub/qep-contracts";
import type { AvailableLifecycleTransition } from "@apzhub/lifecycle-engine";

import type { PersistedRequirement } from "../../domain/persisted-requirement";
import { createRequirement } from "../../domain/entities/requirement";
import type { RequirementAuditRepository } from "../../domain/repositories/requirement-audit-repository";
import type { RequirementLifecycleHistoryRepository } from "../../domain/repositories/requirement-lifecycle-history-repository";
import type { RequirementRepository } from "../../domain/repositories/requirement-repository";
import type { RequirementContentVersionRepository } from "../../domain/repositories/requirement-content-version-repository";
import {
  buildCanonicalSnapshot,
  createRequirementContentVersion,
  initialChangeReason,
  nextVersionNumber,
  shouldCreateVersion,
  validateParentVersion,
  compareSnapshots,
  verifyIntegrity,
  type RequirementContentVersion,
} from "../../domain/content-version";
import { buildRequirementContentVersionCreatedEvent } from "../../domain/events/requirement-events";
import type { RequirementStatus } from "../../domain/value-objects/requirement-status";
import { createRequirementId } from "../../domain/value-objects/requirement-id";
import { createRequirementOwner } from "../../domain/value-objects/requirement-owner";
import { createRequirementBaselineReference } from "../../domain/value-objects/requirement-baseline-reference";
import { createRequirementReference } from "../../domain/value-objects/requirement-reference";
import {
  QepForbiddenError,
  QepConflictError,
  QepInvariantViolation,
  QepNotFoundError,
  QepRevisionConflictError,
  QepNoContentChangeError,
  QepVersionNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";
import {
  createRequirementLifecycleApplicationService,
  type RequirementLifecycleApplicationService,
  type RequirementLifecycleTransitionInput,
} from "./requirement-lifecycle-application-service";

export type RequirementApplicationServiceDeps = {
  readonly requirements: RequirementRepository;
  readonly audits: RequirementAuditRepository;
  readonly lifecycleHistory: RequirementLifecycleHistoryRepository;
  readonly contentVersions: RequirementContentVersionRepository;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onDomainEvent?: (
    event: import("../../domain/events/requirement-events").RequirementDomainEvent,
  ) => void | Promise<void>;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type RequirementApplicationService = RequirementLifecycleApplicationService & {
  createRequirement(
    ctx: QepRequestContext,
    input: CreateQepRequirementInput,
  ): Promise<PersistedRequirement>;
  updateRequirement(
    ctx: QepRequestContext,
    id: string,
    input: UpdateQepRequirementInput,
  ): Promise<PersistedRequirement>;
  getRequirement(ctx: QepRequestContext, id: string): Promise<PersistedRequirement | null>;
  listRequirements(
    ctx: QepRequestContext,
    query: ListQepRequirementsQuery,
  ): Promise<{
    items: readonly PersistedRequirement[];
    total: number;
    limit: number;
    offset: number;
  }>;
  searchRequirements(
    ctx: QepRequestContext,
    query: SearchQepRequirementsQuery,
  ): Promise<{
    items: readonly PersistedRequirement[];
    total: number;
    limit: number;
    offset: number;
  }>;
  transitionRequirement(
    ctx: QepRequestContext,
    id: string,
    input: RequirementLifecycleTransitionInput,
  ): Promise<PersistedRequirement>;
  getAvailableTransitions(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly AvailableLifecycleTransition<RequirementStatus>[]>;
  getLifecycleHistory(
    ctx: QepRequestContext,
    id: string,
  ): Promise<
    Awaited<ReturnType<RequirementLifecycleHistoryRepository["listByRequirement"]>>
  >;
  listContentVersions(
    ctx: QepRequestContext,
    id: string,
    pagination?: { readonly limit?: number; readonly offset?: number },
  ): ReturnType<RequirementContentVersionRepository["listMetadata"]>;
  getContentVersion(
    ctx: QepRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<RequirementContentVersion>;
  getLatestContentVersion(ctx: QepRequestContext, id: string): Promise<RequirementContentVersion>;
  compareContentVersions(
    ctx: QepRequestContext,
    id: string,
    baseVersionNumber: number,
    targetVersionNumber: number,
  ): Promise<ReturnType<typeof compareSnapshots>>;
  verifyContentVersionIntegrity(
    ctx: QepRequestContext,
    id: string,
    versionNumber: number,
  ): Promise<void>;
};

function nowIso(deps: RequirementApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: RequirementApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextRequirementId(deps: RequirementApplicationServiceDeps): string {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  if (generated.startsWith("req_")) {
    return createRequirementId(generated);
  }
  return createRequirementId(`req_${generated}`);
}

function nextAuditId(deps: RequirementApplicationServiceDeps): string {
  return deps.id?.() ?? randomUUID();
}

function nextContentVersionId(): string {
  return `rcv_${randomUUID().replace(/-/g, "")}`;
}

function contentVersion(
  requirement: PersistedRequirement,
  input: {
    readonly parent?: RequirementContentVersion;
    readonly reason: string;
    readonly actorUserId: string;
    readonly correlationId: string;
    readonly createdAt: string;
  },
): RequirementContentVersion {
  const versionNumber = nextVersionNumber(input.parent);
  validateParentVersion(versionNumber, input.parent);
  return createRequirementContentVersion({
    id: nextContentVersionId(),
    tenantId: requirement.tenantId,
    requirementId: requirement.id,
    versionNumber,
    ...(input.parent
      ? { parentVersionNumber: input.parent.versionNumber, parentVersionId: input.parent.id }
      : {}),
    snapshot: buildCanonicalSnapshot(requirement),
    snapshotSchemaVersion: "requirement-snapshot/v1",
    hashAlgorithm: "sha256",
    changeReason: input.reason,
    actorUserId: input.actorUserId,
    createdAt: input.createdAt,
    sourceRevision: requirement.revision,
    correlationId: input.correlationId,
  });
}

function assertPermission(ctx: QepRequestContext, required: string): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.requirements.*") || granted.includes(required)) {
    return;
  }
  throw new QepForbiddenError(`Missing permission: ${required}`);
}

async function appendAudit(
  deps: RequirementApplicationServiceDeps,
  ctx: QepRequestContext,
  requirementId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  await deps.audits.append({
    id: nextAuditId(deps),
    tenantId: ctx.tenantId,
    requirementId: createRequirementId(requirementId),
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

export function createRequirementApplicationService(
  deps: RequirementApplicationServiceDeps,
): RequirementApplicationService {
  const lifecycle = createRequirementLifecycleApplicationService(deps);

  return {
    ...lifecycle,

    async createRequirement(ctx, input) {
      assertPermission(ctx, "qep.requirements.create");
      if (input.status && input.status !== "draft") {
        throw new QepInvariantViolation(
          "Requirement status must be draft on create — use lifecycle transitions after creation",
        );
      }
      const timestamp = nowIso(deps);
      const id = nextRequirementId(deps);
      const existing = await deps.requirements.findByKey(ctx.tenantId, input.key);
      if (existing) {
        throw new QepConflictError(`Requirement key already exists: ${input.key}`);
      }

      const requirement = createRequirement({
        id,
        key: input.key,
        title: input.title,
        description: input.description,
        type: input.type,
        status: "draft",
        priority: input.priority,
        category: input.category,
        owner: input.owner ? createRequirementOwner(input.owner) : undefined,
        acceptanceCriteriaItems: input.acceptanceCriteriaItems,
        attributes: input.attributes,
        references: input.references?.map((ref) => createRequirementReference(ref)),
        baseline: input.baseline
          ? createRequirementBaselineReference(input.baseline)
          : undefined,
        tenantId: ctx.tenantId,
        projectId: input.projectId,
      });

      const persisted: PersistedRequirement = {
        ...requirement,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };

      const { created, version } = await runInTransaction(deps, async () => {
        const created = await deps.requirements.create(persisted);
        const version = await deps.contentVersions.append(
          contentVersion(created, {
            reason: input.changeReason ?? initialChangeReason(),
            actorUserId: ctx.userId,
            correlationId: ctx.correlationId,
            createdAt: timestamp,
          }),
        );
        return { created, version };
      });
      await appendAudit(deps, ctx, created.id, "qep.requirement.created", {
        key: created.key,
        projectId: created.projectId,
        versionNumber: version.versionNumber,
      });
      await deps.onDomainEvent?.(buildRequirementContentVersionCreatedEvent({
        tenantId: ctx.tenantId,
        requirementId: created.id,
        correlationId: ctx.correlationId,
        occurredAt: timestamp,
        versionNumber: version.versionNumber,
        contentVersionId: version.id,
        sourceRevision: version.sourceRevision,
        changeReason: version.changeReason,
      }));
      await deps.onUpserted?.(created);
      return created;
    },

    async updateRequirement(ctx, id, input) {
      assertPermission(ctx, "qep.requirements.edit");
      if ("status" in input && (input as { status?: string }).status !== undefined) {
        throw new QepInvariantViolation(
          "Requirement status cannot be changed via update — use lifecycle transitions",
        );
      }
      const requirementId = createRequirementId(id);
      const existing = await deps.requirements.findById(ctx.tenantId, requirementId);
      if (!existing || existing.archivedAt) {
        throw new QepNotFoundError(`Requirement not found: ${id}`);
      }
      if (
        input.expectedRevision !== undefined &&
        existing.revision !== input.expectedRevision
      ) {
        throw new QepRevisionConflictError(
          id,
          input.expectedRevision,
          existing.revision,
        );
      }

      const timestamp = nowIso(deps);
      const updatedRequirement = createRequirement({
        id: existing.id,
        key: existing.key,
        title: input.title ?? existing.title,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        type: input.type ?? existing.type,
        status: existing.status,
        priority: input.priority ?? existing.priority,
        category:
          input.category === null ? undefined : (input.category ?? existing.category),
        owner:
          input.owner === null
            ? undefined
            : input.owner
              ? createRequirementOwner(input.owner)
              : existing.owner,
        approvalState: input.approvalState ?? existing.approvalState,
        version: existing.version,
        acceptanceCriteriaItems:
          input.acceptanceCriteriaItems === null
            ? undefined
            : (input.acceptanceCriteriaItems ??
              existing.acceptanceCriteria?.items),
        attributes: input.attributes ?? existing.attributes,
        references:
          input.references?.map((ref) => createRequirementReference(ref)) ??
          existing.references,
        baseline:
          input.baseline === null
            ? undefined
            : input.baseline
              ? createRequirementBaselineReference(input.baseline)
              : existing.baseline,
        tenantId: existing.tenantId,
        projectId: existing.projectId,
      });

      const persisted: PersistedRequirement = {
        ...updatedRequirement,
        createdAt: existing.createdAt,
        updatedAt: timestamp,
        createdBy: existing.createdBy,
        updatedBy: ctx.userId,
        ...(existing.archivedAt ? { archivedAt: existing.archivedAt } : {}),
        ...(existing.archivedBy ? { archivedBy: existing.archivedBy } : {}),
        revision: existing.revision,
      };
      const previousSnapshot = buildCanonicalSnapshot(existing);
      const proposedSnapshot = buildCanonicalSnapshot(persisted);
      if (!shouldCreateVersion(previousSnapshot, proposedSnapshot)) {
        throw new QepNoContentChangeError();
      }
      if (!input.changeReason?.trim()) {
        throw new QepInvariantViolation("Change reason is required for content updates");
      }
      const { updated, version } = await runInTransaction(deps, async () => {
        const updated = await deps.requirements.update(persisted);
        const latest = await deps.contentVersions.getLatest(ctx.tenantId, updated.id);
        const version = await deps.contentVersions.append(
          contentVersion(updated, {
            parent: latest ?? undefined,
            reason: input.changeReason,
            actorUserId: ctx.userId,
            correlationId: ctx.correlationId,
            createdAt: timestamp,
          }),
        );
        return { updated, version };
      });
      await appendAudit(deps, ctx, updated.id, "qep.requirement.updated", {
        versionNumber: version.versionNumber,
        changeReason: version.changeReason,
        sourceRevision: version.sourceRevision,
        contentVersionId: version.id,
      });
      await deps.onDomainEvent?.(buildRequirementContentVersionCreatedEvent({
        tenantId: ctx.tenantId,
        requirementId: updated.id,
        correlationId: ctx.correlationId,
        occurredAt: timestamp,
        versionNumber: version.versionNumber,
        contentVersionId: version.id,
        sourceRevision: version.sourceRevision,
        changeReason: version.changeReason,
      }));
      await deps.onUpserted?.(updated);
      return updated;
    },

    async getRequirement(ctx, id) {
      assertPermission(ctx, "qep.requirements.view");
      return deps.requirements.findById(ctx.tenantId, createRequirementId(id));
    },

    async listContentVersions(ctx, id, pagination) {
      assertPermission(ctx, "qep.requirements.versions.history");
      return deps.contentVersions.listMetadata(ctx.tenantId, createRequirementId(id), pagination);
    },

    async getContentVersion(ctx, id, versionNumber) {
      assertPermission(ctx, "qep.requirements.versions.view");
      const version = await deps.contentVersions.getByRequirementAndNumber(
        ctx.tenantId,
        createRequirementId(id),
        versionNumber as import("../../domain/content-version").RequirementContentVersionNumber,
      );
      if (!version) throw new QepVersionNotFoundError(`Content version not found: ${versionNumber}`);
      return version;
    },

    async getLatestContentVersion(ctx, id) {
      assertPermission(ctx, "qep.requirements.versions.view");
      const version = await deps.contentVersions.getLatest(ctx.tenantId, createRequirementId(id));
      if (!version) throw new QepVersionNotFoundError("Requirement has no content version");
      return version;
    },

    async compareContentVersions(ctx, id, baseVersionNumber, targetVersionNumber) {
      assertPermission(ctx, "qep.requirements.versions.compare");
      const requirementId = createRequirementId(id);
      const [base, target] = await Promise.all([
        deps.contentVersions.getByRequirementAndNumber(
          ctx.tenantId,
          requirementId,
          baseVersionNumber as import("../../domain/content-version").RequirementContentVersionNumber,
        ),
        deps.contentVersions.getByRequirementAndNumber(
          ctx.tenantId,
          requirementId,
          targetVersionNumber as import("../../domain/content-version").RequirementContentVersionNumber,
        ),
      ]);
      if (!base || !target) {
        throw new QepVersionNotFoundError("Content version selected for comparison was not found");
      }
      verifyIntegrity(base.snapshot, base.snapshotHash);
      verifyIntegrity(target.snapshot, target.snapshotHash);
      const comparison = compareSnapshots(base.snapshot, target.snapshot, {
        requirementId: id,
        baseVersionNumber,
        targetVersionNumber,
      });
      // Comparison is read activity — Platform audit only (no mutation domain event).
      await appendAudit(deps, ctx, id, "qep.requirement.content_version_compared", {
        baseVersionNumber,
        targetVersionNumber,
        changedFieldCount: comparison.changedFieldCount,
      });
      return comparison;
    },

    async verifyContentVersionIntegrity(ctx, id, versionNumber) {
      assertPermission(ctx, "qep.requirements.versions.verify");
      const version = await deps.contentVersions.getByRequirementAndNumber(
        ctx.tenantId,
        createRequirementId(id),
        versionNumber as import("../../domain/content-version").RequirementContentVersionNumber,
      );
      if (!version) throw new QepVersionNotFoundError(`Content version not found: ${versionNumber}`);
      try {
        verifyIntegrity(version.snapshot, version.snapshotHash);
      } catch (error) {
        await appendAudit(deps, ctx, id, "qep.requirement.content_version_integrity_failed", {
          versionNumber,
          contentVersionId: version.id,
        });
        throw error;
      }
    },

    async listRequirements(ctx, query) {
      assertPermission(ctx, "qep.requirements.view");
      const all = await deps.requirements.list(ctx.tenantId, query);
      return filterAndPaginate(all, query.limit, query.offset);
    },

    async searchRequirements(ctx, query) {
      assertPermission(ctx, "qep.requirements.view");
      const all = await deps.requirements.search(ctx.tenantId, query);
      return filterAndPaginate(all, query.limit, query.offset);
    },
  };
}
