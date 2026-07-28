import { randomUUID } from "node:crypto";

import type {
  AddQepBaselineItemInput,
  CompareQepBaselinesInput,
  CreateQepBaselineInput,
  ListQepBaselinesQuery,
  QepRequestContext,
  UpdateQepBaselineDraftInput,
} from "@apzhub/qep-contracts";

import {
  archiveRequirementBaseline,
  buildBaselineArchivedEvent,
  buildBaselineComparedEvent,
  buildBaselineCreatedEvent,
  buildBaselineIntegrityVerifiedEvent,
  buildBaselineItemAddedEvent,
  buildBaselineItemRemovedEvent,
  buildBaselineLockedEvent,
  compareRequirementBaselineMembership,
  createRequirementBaseline,
  createRequirementBaselineId,
  createRequirementBaselineItem,
  lockRequirementBaseline,
  updateRequirementBaselineMetadata,
  verifyBaselineIntegrityFingerprint,
  type RequirementBaseline,
  type RequirementBaselineId,
  type RequirementBaselineIntegrityMembershipInput,
  type RequirementBaselineItem,
  type RequirementBaselineMembershipComparison,
  type RequirementBaselineRepository,
} from "../../domain/baseline";
import { verifyIntegrity } from "../../domain/content-version";
import type { RequirementAuditRepository } from "../../domain/repositories/requirement-audit-repository";
import type { RequirementContentVersionRepository } from "../../domain/repositories/requirement-content-version-repository";
import { createRequirementContentVersionId } from "../../domain/content-version/requirement-content-version-id";
import { createRequirementId, type RequirementId } from "../../domain/value-objects/requirement-id";
import {
  QepBaselineIntegrityError,
  QepBaselineInvalidStateError,
  QepBaselineNotFoundError,
  QepForbiddenError,
  QepInvariantViolation,
  QepVersionNotFoundError,
} from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type RequirementBaselineObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type RequirementBaselineApplicationServiceDeps = {
  readonly baselines: RequirementBaselineRepository;
  readonly contentVersions: RequirementContentVersionRepository;
  readonly audits: RequirementAuditRepository;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onDomainEvent?: (
    event: import("../../domain/baseline/requirement-baseline-events").RequirementBaselineDomainEvent,
  ) => void | Promise<void>;
  readonly onBaselineUpserted?: (baseline: RequirementBaseline) => void | Promise<void>;
  readonly onObservation?: (event: RequirementBaselineObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
};

export type RequirementBaselineCompareResult = RequirementBaselineMembershipComparison & {
  readonly baseBaselineId: RequirementBaselineId;
  readonly targetBaselineId: RequirementBaselineId;
};

export type RequirementBaselineApplicationService = {
  createBaseline(
    ctx: QepRequestContext,
    input: CreateQepBaselineInput,
  ): Promise<RequirementBaseline>;
  updateDraftBaseline(
    ctx: QepRequestContext,
    id: string,
    input: UpdateQepBaselineDraftInput,
  ): Promise<RequirementBaseline>;
  addRequirementVersion(
    ctx: QepRequestContext,
    id: string,
    input: AddQepBaselineItemInput,
  ): Promise<RequirementBaseline>;
  removeRequirementVersion(
    ctx: QepRequestContext,
    id: string,
    contentVersionId: string,
  ): Promise<RequirementBaseline>;
  lockBaseline(ctx: QepRequestContext, id: string): Promise<RequirementBaseline>;
  archiveBaseline(ctx: QepRequestContext, id: string): Promise<RequirementBaseline>;
  verifyBaselineIntegrity(ctx: QepRequestContext, id: string): Promise<RequirementBaseline>;
  listBaselines(
    ctx: QepRequestContext,
    query?: ListQepBaselinesQuery,
  ): Promise<{
    items: readonly RequirementBaseline[];
    total: number;
    limit: number;
    offset: number;
  }>;
  getBaseline(ctx: QepRequestContext, id: string): Promise<RequirementBaseline | null>;
  listBaselineItems(
    ctx: QepRequestContext,
    id: string,
  ): Promise<readonly RequirementBaselineItem[]>;
  requirementBaselineHistory(
    ctx: QepRequestContext,
    requirementId: string,
  ): Promise<readonly RequirementBaseline[]>;
  compareBaselines(
    ctx: QepRequestContext,
    input: CompareQepBaselinesInput,
  ): Promise<RequirementBaselineCompareResult>;
};

function nowIso(deps: RequirementBaselineApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: RequirementBaselineApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextBaselineId(deps: RequirementBaselineApplicationServiceDeps): string {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return generated.startsWith("rbl_")
    ? createRequirementBaselineId(generated)
    : createRequirementBaselineId(`rbl_${generated}`);
}

function nextAuditId(deps: RequirementBaselineApplicationServiceDeps): string {
  return deps.id?.() ?? randomUUID();
}

function assertAnyPermission(ctx: QepRequestContext, requiredOneOf: readonly string[]): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.requirements.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new QepForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

/**
 * Baseline-level audits pin their subject via the shared `requirement_id` text
 * column. Real requirement identifiers (add/remove item) validate the RequirementId
 * brand normally; baseline-only actions (create/update/lock/archive/compare) reuse
 * the same column with the baseline id — the column is untyped text, so this is a
 * documented, deliberate cast rather than a schema change (APZQEP-ENG-020E Part 2).
 */
async function appendBaselineAudit(
  deps: RequirementBaselineApplicationServiceDeps,
  ctx: QepRequestContext,
  subjectId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  await deps.audits.append({
    id: nextAuditId(deps),
    tenantId: ctx.tenantId,
    requirementId: subjectId as unknown as RequirementId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: RequirementBaselineApplicationServiceDeps,
  operation: string,
  work: () => Promise<T>,
): Promise<T> {
  const started = Date.now();
  try {
    const result = await work();
    deps.onObservation?.({ operation, durationMs: Date.now() - started, outcome: "success" });
    return result;
  } catch (error) {
    deps.onObservation?.({ operation, durationMs: Date.now() - started, outcome: "error" });
    throw error;
  }
}

/**
 * Loads each membership item's pinned content version, re-verifies its own
 * snapshot-hash integrity (defence against storage tampering), and returns the
 * canonical integrity inputs used to compute the baseline-level fingerprint.
 */
async function buildIntegrityMembership(
  deps: RequirementBaselineApplicationServiceDeps,
  tenantId: string,
  items: readonly RequirementBaselineItem[],
): Promise<readonly RequirementBaselineIntegrityMembershipInput[]> {
  return Promise.all(
    items.map(async (item) => {
      const version = await deps.contentVersions.getById(
        tenantId,
        createRequirementContentVersionId(item.contentVersionId),
      );
      if (!version) {
        throw new QepVersionNotFoundError(
          `Content version not found: ${item.contentVersionId}`,
        );
      }
      verifyIntegrity(version.snapshot, version.snapshotHash);
      return {
        requirementId: item.requirementId,
        contentVersionId: item.contentVersionId,
        contentVersionNumber: item.contentVersionNumber,
        snapshotHash: version.snapshotHash,
      };
    }),
  );
}

async function requireBaseline(
  deps: RequirementBaselineApplicationServiceDeps,
  tenantId: string,
  id: RequirementBaselineId,
): Promise<RequirementBaseline> {
  const existing = await deps.baselines.getBaseline(tenantId, id);
  if (!existing) {
    throw new QepBaselineNotFoundError(`Requirement baseline not found: ${id}`);
  }
  return existing;
}

export function createRequirementBaselineApplicationService(
  deps: RequirementBaselineApplicationServiceDeps,
): RequirementBaselineApplicationService {
  return {
    async createBaseline(ctx, input) {
      return observe(deps, "createBaseline", async () => {
        assertAnyPermission(ctx, [
          "qep.requirements.baselines.create",
          "qep.requirements.baseline",
        ]);
        const timestamp = nowIso(deps);
        const id = nextBaselineId(deps);
        const number = await deps.baselines.nextBaselineNumber(ctx.tenantId);
        const baseline = createRequirementBaseline({
          id,
          tenantId: ctx.tenantId,
          number,
          name: input.name,
          description: input.description,
          createdAt: timestamp,
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
        });
        const created = await runInTransaction(deps, () => deps.baselines.createBaseline(baseline));
        await appendBaselineAudit(deps, ctx, created.id, "qep.requirement_baseline.created", {
          baselineId: created.id,
          number: created.number,
          name: created.name,
        });
        await deps.onDomainEvent?.(
          buildBaselineCreatedEvent({
            tenantId: ctx.tenantId,
            baselineId: created.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
            number: created.number,
            name: created.name,
          }),
        );
        await deps.onBaselineUpserted?.(created);
        return created;
      });
    },

    async updateDraftBaseline(ctx, id, input) {
      return observe(deps, "updateDraftBaseline", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.modify"]);
        const baselineId = createRequirementBaselineId(id);
        const existing = await requireBaseline(deps, ctx.tenantId, baselineId);
        const timestamp = nowIso(deps);
        const updated = updateRequirementBaselineMetadata(
          existing,
          {
            name: input.name ?? existing.name,
            description:
              input.description === null
                ? undefined
                : (input.description ?? existing.description),
          },
          timestamp,
          ctx.userId,
        );
        const persisted = await runInTransaction(deps, () =>
          deps.baselines.updateDraftBaseline(updated),
        );
        await appendBaselineAudit(deps, ctx, persisted.id, "qep.requirement_baseline.updated", {
          baselineId: persisted.id,
        });
        await deps.onBaselineUpserted?.(persisted);
        return persisted;
      });
    },

    async addRequirementVersion(ctx, id, input) {
      return observe(deps, "addRequirementVersion", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.modify"]);
        const baselineId = createRequirementBaselineId(id);
        await requireBaseline(deps, ctx.tenantId, baselineId);
        const version = await deps.contentVersions.getById(
          ctx.tenantId,
          createRequirementContentVersionId(input.contentVersionId),
        );
        if (!version) {
          throw new QepVersionNotFoundError(
            `Content version not found: ${input.contentVersionId}`,
          );
        }
        if (input.requirementId && version.requirementId !== createRequirementId(input.requirementId)) {
          throw new QepInvariantViolation(
            "Content version does not belong to the given requirement",
          );
        }
        const timestamp = nowIso(deps);
        const item = createRequirementBaselineItem({
          requirementId: version.requirementId,
          contentVersionId: version.id,
          contentVersionNumber: version.versionNumber,
          includedAt: timestamp,
          includedBy: ctx.userId,
        });
        // Domain-side validation mirrors the persisted mutation so both in-memory
        // and PostgreSQL repositories share identical invariants (uniqueness, draft-only).
        const updated = await runInTransaction(deps, () =>
          deps.baselines.addRequirementVersion(ctx.tenantId, baselineId, item, timestamp, ctx.userId),
        );
        await appendBaselineAudit(
          deps,
          ctx,
          version.requirementId,
          "qep.requirement_baseline.item_added",
          {
            baselineId: updated.id,
            contentVersionId: item.contentVersionId,
            contentVersionNumber: item.contentVersionNumber,
          },
        );
        await deps.onDomainEvent?.(
          buildBaselineItemAddedEvent({
            tenantId: ctx.tenantId,
            baselineId: updated.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
            item,
          }),
        );
        await deps.onBaselineUpserted?.(updated);
        return updated;
      });
    },

    async removeRequirementVersion(ctx, id, contentVersionId) {
      return observe(deps, "removeRequirementVersion", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.modify"]);
        const baselineId = createRequirementBaselineId(id);
        const existing = await requireBaseline(deps, ctx.tenantId, baselineId);
        const removedItem = existing.items.find(
          (item) => item.contentVersionId === contentVersionId,
        );
        const timestamp = nowIso(deps);
        const updated = await runInTransaction(deps, () =>
          deps.baselines.removeRequirementVersion(
            ctx.tenantId,
            baselineId,
            contentVersionId,
            timestamp,
            ctx.userId,
          ),
        );
        await appendBaselineAudit(
          deps,
          ctx,
          removedItem?.requirementId ?? updated.id,
          "qep.requirement_baseline.item_removed",
          { baselineId: updated.id, contentVersionId },
        );
        await deps.onDomainEvent?.(
          buildBaselineItemRemovedEvent({
            tenantId: ctx.tenantId,
            baselineId: updated.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
            contentVersionId,
          }),
        );
        await deps.onBaselineUpserted?.(updated);
        return updated;
      });
    },

    async lockBaseline(ctx, id) {
      return observe(deps, "lockBaseline", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.lock"]);
        const baselineId = createRequirementBaselineId(id);
        const existing = await requireBaseline(deps, ctx.tenantId, baselineId);
        if (existing.items.length === 0) {
          throw new QepBaselineInvalidStateError(
            "A baseline must contain at least one Requirement Content Version before it can be locked",
          );
        }
        const membership = await buildIntegrityMembership(deps, ctx.tenantId, existing.items);
        const timestamp = nowIso(deps);
        const lockedDomain = lockRequirementBaseline(existing, membership, timestamp, ctx.userId);
        const persisted = await runInTransaction(deps, () =>
          deps.baselines.lockBaseline(
            ctx.tenantId,
            baselineId,
            {
              fingerprint: lockedDomain.integrityFingerprint as string,
              algorithm: lockedDomain.integrityAlgorithm as string,
              schemaVersion: lockedDomain.integritySchemaVersion as string,
              verificationStatus: "verified",
              verifiedAt: lockedDomain.integrityVerifiedAt as string,
            },
            lockedDomain.lockedAt as string,
            lockedDomain.lockedBy as string,
          ),
        );
        await appendBaselineAudit(deps, ctx, persisted.id, "qep.requirement_baseline.locked", {
          baselineId: persisted.id,
          integrityFingerprint: persisted.integrityFingerprint,
        });
        await deps.onDomainEvent?.(
          buildBaselineLockedEvent({
            tenantId: ctx.tenantId,
            baselineId: persisted.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
          }),
        );
        await deps.onBaselineUpserted?.(persisted);
        return persisted;
      });
    },

    async archiveBaseline(ctx, id) {
      return observe(deps, "archiveBaseline", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.archive"]);
        const baselineId = createRequirementBaselineId(id);
        const existing = await requireBaseline(deps, ctx.tenantId, baselineId);
        const timestamp = nowIso(deps);
        // Validates the draft/locked/archived state machine before persistence.
        archiveRequirementBaseline(existing, timestamp, ctx.userId);
        const persisted = await runInTransaction(deps, () =>
          deps.baselines.archiveBaseline(ctx.tenantId, baselineId, timestamp, ctx.userId),
        );
        await appendBaselineAudit(deps, ctx, persisted.id, "qep.requirement_baseline.archived", {
          baselineId: persisted.id,
        });
        await deps.onDomainEvent?.(
          buildBaselineArchivedEvent({
            tenantId: ctx.tenantId,
            baselineId: persisted.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
          }),
        );
        await deps.onBaselineUpserted?.(persisted);
        return persisted;
      });
    },

    async listBaselines(ctx, query = {}) {
      assertAnyPermission(ctx, ["qep.requirements.baselines.view"]);
      const all = await deps.baselines.listBaselines(ctx.tenantId, { status: query.status as RequirementBaseline["status"] | undefined });
      return filterAndPaginate(all, query.limit, query.offset);
    },

    async getBaseline(ctx, id) {
      assertAnyPermission(ctx, ["qep.requirements.baselines.view"]);
      return deps.baselines.getBaseline(ctx.tenantId, createRequirementBaselineId(id));
    },

    async listBaselineItems(ctx, id) {
      assertAnyPermission(ctx, ["qep.requirements.baselines.view"]);
      return deps.baselines.listBaselineItems(ctx.tenantId, createRequirementBaselineId(id));
    },

    async requirementBaselineHistory(ctx, requirementId) {
      assertAnyPermission(ctx, ["qep.requirements.baselines.view"]);
      return deps.baselines.listBaselinesForRequirement(
        ctx.tenantId,
        createRequirementId(requirementId),
      );
    },

    async compareBaselines(ctx, input) {
      return observe(deps, "compareBaselines", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.compare"]);
        const baseId = createRequirementBaselineId(input.baseBaselineId);
        const targetId = createRequirementBaselineId(input.targetBaselineId);
        const [base, target] = await Promise.all([
          requireBaseline(deps, ctx.tenantId, baseId),
          requireBaseline(deps, ctx.tenantId, targetId),
        ]);
        const comparison = compareRequirementBaselineMembership(base.items, target.items);
        await appendBaselineAudit(deps, ctx, baseId, "qep.requirement_baseline.compared", {
          baseBaselineId: baseId,
          targetBaselineId: targetId,
          ...comparison.summary,
        });
        await deps.onDomainEvent?.(
          buildBaselineComparedEvent({
            tenantId: ctx.tenantId,
            baselineId: baseId,
            correlationId: ctx.correlationId,
            otherBaselineId: targetId,
            addedCount: comparison.summary.addedCount,
            removedCount: comparison.summary.removedCount,
            unchangedCount: comparison.summary.unchangedCount,
          }),
        );
        return { baseBaselineId: baseId, targetBaselineId: targetId, ...comparison };
      });
    },

    async verifyBaselineIntegrity(ctx, id) {
      return observe(deps, "verifyBaselineIntegrity", async () => {
        assertAnyPermission(ctx, ["qep.requirements.baselines.verify"]);
        const baselineId = createRequirementBaselineId(id);
        const existing = await requireBaseline(deps, ctx.tenantId, baselineId);
        if (existing.status === "draft") {
          throw new QepBaselineInvalidStateError(
            "Only locked or archived requirement baselines can be integrity-verified",
          );
        }
        if (!existing.integrityFingerprint || !existing.integritySchemaVersion) {
          throw new QepBaselineIntegrityError(
            "Requirement baseline has no recorded integrity fingerprint to verify against",
          );
        }
        const timestamp = nowIso(deps);
        const membership = await buildIntegrityMembership(deps, ctx.tenantId, existing.items);
        let verification;
        try {
          verification = verifyBaselineIntegrityFingerprint({
            baselineId: existing.id,
            membership,
            expectedFingerprint: existing.integrityFingerprint,
            schemaVersion: existing.integritySchemaVersion,
          });
        } catch (error) {
          await runInTransaction(deps, () =>
            deps.baselines.recordIntegrityVerification(ctx.tenantId, baselineId, {
              verificationStatus: "verification_failed",
              verifiedAt: timestamp,
            }),
          );
          await appendBaselineAudit(
            deps,
            ctx,
            existing.id,
            "qep.requirement_baseline.integrity_verification_failed",
            { baselineId: existing.id },
          );
          throw error;
        }
        const persisted = await runInTransaction(deps, () =>
          deps.baselines.recordIntegrityVerification(ctx.tenantId, baselineId, {
            verificationStatus: verification.verificationStatus,
            verifiedAt: verification.verifiedAt ?? timestamp,
          }),
        );
        await appendBaselineAudit(
          deps,
          ctx,
          persisted.id,
          "qep.requirement_baseline.integrity_verified",
          { baselineId: persisted.id, verificationStatus: verification.verificationStatus },
        );
        await deps.onDomainEvent?.(
          buildBaselineIntegrityVerifiedEvent({
            tenantId: ctx.tenantId,
            baselineId: persisted.id,
            correlationId: ctx.correlationId,
            occurredAt: timestamp,
            verificationStatus: verification.verificationStatus,
          }),
        );
        await deps.onBaselineUpserted?.(persisted);
        return persisted;
      });
    },
  };
}
