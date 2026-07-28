import { randomUUID } from "node:crypto";

import type {
  AvailableLifecycleTransition,
  LifecycleContext,
} from "@apzhub/lifecycle-engine";
import { LifecycleTransitionError } from "@apzhub/lifecycle-engine";

import { createRequirement } from "../../domain/entities/requirement";
import type { RequirementDomainEvent } from "../../domain/events/requirement-events";
import { buildRequirementLifecycleDomainEvent } from "../../domain/events/requirement-events";
import { requirementLifecycleEngine } from "../../domain/lifecycle/requirement-lifecycle-engine";
import type { PersistedRequirement } from "../../domain/persisted-requirement";
import type { RequirementAuditRepository } from "../../domain/repositories/requirement-audit-repository";
import type { RequirementLifecycleHistoryRepository } from "../../domain/repositories/requirement-lifecycle-history-repository";
import type { RequirementRepository } from "../../domain/repositories/requirement-repository";
import { createRequirementId } from "../../domain/value-objects/requirement-id";
import {
  createRequirementStatus,
  type RequirementStatus,
} from "../../domain/value-objects/requirement-status";
import {
  QepForbiddenError,
  QepInvariantViolation,
  QepLifecycleTransitionError,
  QepNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";

import type { QepRequestContext } from "@apzhub/qep-contracts";

export type RequirementLifecycleTransitionInput = {
  readonly action: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly expectedRevision?: number;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type RequirementLifecycleApplicationDeps = {
  readonly requirements: RequirementRepository;
  readonly audits: RequirementAuditRepository;
  readonly lifecycleHistory: RequirementLifecycleHistoryRepository;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onUpserted?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onArchived?: (record: PersistedRequirement) => void | Promise<void>;
  readonly onDomainEvent?: (event: RequirementDomainEvent) => void | Promise<void>;
};

const ACTION_PERMISSIONS: Readonly<Record<string, string>> = {
  submit: "qep.requirements.submit",
  review: "qep.requirements.review",
  start_review: "qep.requirements.review",
  approve: "qep.requirements.approve",
  reject: "qep.requirements.reject",
  mark_implemented: "qep.requirements.implement",
  mark_verified: "qep.requirements.verify",
  deprecate: "qep.requirements.deprecate",
  archive: "qep.requirements.archive",
  revise: "qep.requirements.edit",
};

function nowIso(deps: RequirementLifecycleApplicationDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function nextId(deps: RequirementLifecycleApplicationDeps): string {
  return deps.id?.() ?? randomUUID();
}

function assertPermission(ctx: QepRequestContext, required: string): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.requirements.*") || granted.includes(required)) {
    return;
  }
  throw new QepForbiddenError(`Missing permission: ${required}`);
}

function permissionForAction(action: string): string {
  const permission = ACTION_PERMISSIONS[action];
  if (!permission) {
    throw new QepInvariantViolation(`Unknown lifecycle action: ${action}`);
  }
  return permission;
}

async function appendAudit(
  deps: RequirementLifecycleApplicationDeps,
  ctx: QepRequestContext,
  requirementId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  await deps.audits.append({
    id: nextId(deps),
    tenantId: ctx.tenantId,
    requirementId: createRequirementId(requirementId),
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

function toLifecycleContext(
  ctx: QepRequestContext,
  input: Pick<
    RequirementLifecycleTransitionInput,
    "reason" | "comments" | "metadata"
  > = {},
  deps: RequirementLifecycleApplicationDeps,
  revision?: number,
): LifecycleContext {
  return {
    actorUserId: ctx.userId,
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    reason: input.reason,
    comments: input.comments,
    metadata: input.metadata,
    revision,
    now: nowIso(deps),
  };
}

function applyTransitionToRequirement(
  existing: PersistedRequirement,
  newStatus: RequirementStatus,
  ctx: QepRequestContext,
  timestamp: string,
  archived?: { archivedAt: string; archivedBy: string },
): PersistedRequirement {
  const requirement = createRequirement({
    id: existing.id,
    key: existing.key,
    title: existing.title,
    description: existing.description,
    type: existing.type,
    status: newStatus,
    priority: existing.priority,
    category: existing.category,
    owner: existing.owner,
    approvalState: existing.approvalState,
    version: existing.version,
    acceptanceCriteriaItems: existing.acceptanceCriteria?.items,
    attributes: existing.attributes,
    references: existing.references,
    baseline: existing.baseline,
    tenantId: existing.tenantId,
    projectId: existing.projectId,
  });

  return {
    ...requirement,
    createdAt: existing.createdAt,
    updatedAt: timestamp,
    createdBy: existing.createdBy,
    updatedBy: ctx.userId,
    revision: existing.revision,
    ...(archived
      ? { archivedAt: archived.archivedAt, archivedBy: archived.archivedBy }
      : {}),
  };
}

export async function performRequirementLifecycleTransition(
  deps: RequirementLifecycleApplicationDeps,
  ctx: QepRequestContext,
  id: string,
  input: RequirementLifecycleTransitionInput,
): Promise<PersistedRequirement> {
  assertPermission(ctx, permissionForAction(input.action));

  if (input.action === "reject" && !input.reason?.trim()) {
    throw new QepInvariantViolation("Reject transition requires a reason");
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
    throw new QepRevisionConflictError(id, input.expectedRevision, existing.revision);
  }

  let transitionResult;
  try {
    transitionResult = requirementLifecycleEngine.transition(
      existing.status,
      input.action,
      toLifecycleContext(ctx, input, deps, existing.revision),
    );
  } catch (error) {
    if (error instanceof LifecycleTransitionError) {
      throw new QepLifecycleTransitionError(error.message);
    }
    throw error;
  }

  const timestamp = nowIso(deps);
  const isArchive = transitionResult.newState === "archived";
  const persisted = applyTransitionToRequirement(
    existing,
    transitionResult.newState,
    ctx,
    timestamp,
    isArchive ? { archivedAt: timestamp, archivedBy: ctx.userId } : undefined,
  );

  const updated = await deps.requirements.update(persisted);

  await deps.lifecycleHistory.append({
    id: nextId(deps),
    tenantId: ctx.tenantId,
    requirementId,
    previousState: transitionResult.previousState,
    newState: transitionResult.newState,
    action: transitionResult.action,
    actorUserId: ctx.userId,
    reason: input.reason,
    comments: input.comments,
    correlationId: ctx.correlationId,
    revision: updated.revision,
    metadataJson: input.metadata,
    createdAt: timestamp,
  });

  const domainEvent = buildRequirementLifecycleDomainEvent({
    tenantId: ctx.tenantId,
    requirementId,
    correlationId: ctx.correlationId,
    action: transitionResult.action,
    from: transitionResult.previousState,
    to: transitionResult.newState,
    reason: input.reason,
    occurredAt: timestamp,
    eventId: nextId(deps),
  });

  await appendAudit(deps, ctx, updated.id, domainEvent.type, {
    action: transitionResult.action,
    from: transitionResult.previousState,
    to: transitionResult.newState,
    reason: input.reason,
    comments: input.comments,
  });

  await deps.onDomainEvent?.(domainEvent);

  if (isArchive) {
    await deps.onArchived?.(updated);
  } else {
    await deps.onUpserted?.(updated);
  }

  return updated;
}

export async function getRequirementAvailableTransitions(
  deps: RequirementLifecycleApplicationDeps,
  ctx: QepRequestContext,
  id: string,
): Promise<readonly AvailableLifecycleTransition<RequirementStatus>[]> {
  assertPermission(ctx, "qep.requirements.view");
  const requirementId = createRequirementId(id);
  const existing = await deps.requirements.findById(ctx.tenantId, requirementId);
  if (!existing || existing.archivedAt) {
    throw new QepNotFoundError(`Requirement not found: ${id}`);
  }

  return requirementLifecycleEngine.availableTransitions(
    existing.status,
    toLifecycleContext(ctx, {}, deps, existing.revision),
  );
}

export async function getRequirementLifecycleHistory(
  deps: RequirementLifecycleApplicationDeps,
  ctx: QepRequestContext,
  id: string,
): Promise<
  Awaited<ReturnType<RequirementLifecycleHistoryRepository["listByRequirement"]>>
> {
  assertPermission(ctx, "qep.requirements.view");
  const requirementId = createRequirementId(id);
  const existing = await deps.requirements.findById(ctx.tenantId, requirementId);
  if (!existing) {
    throw new QepNotFoundError(`Requirement not found: ${id}`);
  }
  return deps.lifecycleHistory.listByRequirement(ctx.tenantId, requirementId);
}

export type RequirementLifecycleApplicationService = {
  submitRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  reviewRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  approveRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  rejectRequirement(
    ctx: QepRequestContext,
    id: string,
    input: Omit<RequirementLifecycleTransitionInput, "action"> & { reason: string },
  ): Promise<PersistedRequirement>;
  markImplemented(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  markVerified(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  deprecateRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
  archiveRequirement(
    ctx: QepRequestContext,
    id: string,
    input?: Omit<RequirementLifecycleTransitionInput, "action">,
  ): Promise<PersistedRequirement>;
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
};

export function createRequirementLifecycleApplicationService(
  deps: RequirementLifecycleApplicationDeps,
): RequirementLifecycleApplicationService {
  const transition = (
    ctx: QepRequestContext,
    id: string,
    input: RequirementLifecycleTransitionInput,
  ) => performRequirementLifecycleTransition(deps, ctx, id, input);

  return {
    submitRequirement(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "submit" });
    },
    reviewRequirement(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "review" });
    },
    approveRequirement(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "approve" });
    },
    rejectRequirement(ctx, id, input) {
      return transition(ctx, id, { ...input, action: "reject" });
    },
    markImplemented(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "mark_implemented" });
    },
    markVerified(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "mark_verified" });
    },
    deprecateRequirement(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "deprecate" });
    },
    archiveRequirement(ctx, id, input = {}) {
      return transition(ctx, id, { ...input, action: "archive" });
    },
    transitionRequirement: transition,
    getAvailableTransitions(ctx, id) {
      return getRequirementAvailableTransitions(deps, ctx, id);
    },
    getLifecycleHistory(ctx, id) {
      return getRequirementLifecycleHistory(deps, ctx, id);
    },
  };
}

export function summariseRequirementLifecycle(
  items: readonly Pick<PersistedRequirement, "status">[],
): Readonly<Record<RequirementStatus, number>> {
  const counts = Object.fromEntries(
    (
      [
        "draft",
        "proposed",
        "in_review",
        "approved",
        "rejected",
        "implemented",
        "verified",
        "deprecated",
        "archived",
      ] as const
    ).map((status) => [status, 0]),
  ) as Record<RequirementStatus, number>;

  for (const item of items) {
    const status = createRequirementStatus(item.status);
    counts[status] += 1;
  }

  return counts;
}
