import {
  InvalidPlanStateError,
  PlanConcurrencyError,
  PlanInvariantViolationError,
  PlanReadinessError,
  PlanValidationError,
} from "../../shared/errors";
import {
  CANCELLABLE_STATUSES,
  PLAN_INITIAL_VERSION_LABEL,
} from "./constants";
import { createTestPlanApproval } from "./plan-approval";
import { createTestPlanAssignment } from "./plan-assignment";
import {
  PlanCloneService,
  PlanLineageService,
  PlanMetricsCalculator,
  PlanReadinessService,
  resolveSealVersionLabel,
} from "./plan-domain-service";
import {
  buildPlanApprovedEvent,
  buildPlanArchivedEvent,
  buildPlanCancelledEvent,
  buildPlanCompletedEvent,
  buildPlanCreatedEvent,
  buildPlanItemAddedEvent,
  buildPlanItemRemovedEvent,
  buildPlanItemUpdatedEvent,
  buildPlanReadyEvent,
  buildPlanRejectedEvent,
  buildPlanReviewRequestedEvent,
  buildPlanStartedEvent,
  buildPlanSupersededEvent,
  buildPlanUpdatedEvent,
  type PlanDomainEvent,
} from "./plan-events";
import { appendTestPlanHistory, createEmptyTestPlanHistory } from "./plan-history";
import {
  createTestPlanItem,
  isActiveItem,
  itemSpecPinKey,
  updateTestPlanItem,
  type CreateTestPlanItemInput,
  type TestPlanItem,
} from "./plan-item";
import {
  ApprovalPolicy,
  ArchivalPolicy,
  AssignmentPolicy,
  ContentPolicy,
  ItemPolicy,
  LifecyclePolicy,
  SchedulingPolicy,
} from "./plan-policy";
import { createTestPlanRevision } from "./plan-revision";
import { createTestPlanSchedule } from "./plan-schedule";
import type { TestPlanApproval } from "./plan-approval";
import type { TestPlanAssignment } from "./plan-assignment";
import type { TestPlanHistory } from "./plan-history";
import type { TestPlanRevision } from "./plan-revision";
import type { TestPlanSchedule } from "./plan-schedule";
import {
  createActorId,
  createPlanDescription,
  createPlanNumber,
  createPlanObjective,
  createPlanScope,
  createPlanTitle,
  createPriority,
  createTenantId,
  deriveApprovalState,
  type ExecutionReadiness,
  type PlanMetrics,
  type PlanScope,
  type PlanStatus,
  type Priority,
} from "./value-objects";

export type TestPlan = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: string;
  readonly revision: number;
  readonly title: string;
  readonly description?: string;
  readonly objective: string;
  readonly scope: PlanScope;
  readonly status: PlanStatus;
  readonly priority: Priority;
  readonly planType: PlanScope["class"];
  readonly ownerId: string;
  readonly versionLabel: string;
  readonly predecessorPlanId?: string;
  readonly predecessorSealedVersionLabel?: string;
  readonly successorPlanId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly items: readonly TestPlanItem[];
  readonly schedule: TestPlanSchedule;
  readonly assignment: TestPlanAssignment;
  readonly approvals: readonly TestPlanApproval[];
  readonly revisions: readonly TestPlanRevision[];
  readonly history: TestPlanHistory;
  readonly externalReferences?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly metrics: PlanMetrics;
  readonly uncommittedEvents: readonly PlanDomainEvent[];
};

export type CommandContext = {
  readonly actorId: string;
  readonly changedAt: string;
  readonly expectedRevision?: number;
  readonly correlationId?: string;
};

export type CreateTestPlanInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: string;
  readonly title: string;
  readonly ownerId: string;
  readonly scope: {
    readonly class: string;
    readonly label?: string;
    readonly externalRef?: string;
  };
  readonly description?: string;
  readonly objective?: string;
  readonly priority?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId?: string;
  readonly externalReferences?: readonly string[];
};

function eventBase(plan: TestPlan, ctx: CommandContext) {
  return {
    tenantId: plan.tenantId,
    planId: plan.id,
    actorId: ctx.actorId,
    occurredAt: ctx.changedAt,
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  };
}

function assertRevision(plan: TestPlan, expectedRevision?: number): void {
  if (expectedRevision !== undefined && plan.revision !== expectedRevision) {
    throw new PlanConcurrencyError(plan.id, expectedRevision, plan.revision);
  }
}

function beginCommand(plan: TestPlan, ctx: CommandContext): TestPlan {
  assertRevision(plan, ctx.expectedRevision);
  createActorId(ctx.actorId);
  return { ...plan, uncommittedEvents: [] };
}

function withMutation(
  plan: TestPlan,
  ctx: CommandContext,
  patch: Partial<TestPlan>,
  action: string,
  summary: string,
  events: readonly PlanDomainEvent[],
  statusChange?: { from: PlanStatus; to: PlanStatus },
): TestPlan {
  const nextRevision = plan.revision + 1;
  const history = appendTestPlanHistory(plan.history, {
    at: ctx.changedAt,
    actorId: ctx.actorId,
    action,
    summary,
    ...(statusChange ? { fromStatus: statusChange.from, toStatus: statusChange.to } : {}),
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  });
  const items = patch.items ?? plan.items;
  return {
    ...plan,
    ...patch,
    revision: nextRevision,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
    history,
    metrics: PlanMetricsCalculator.recompute(items),
    uncommittedEvents: [...plan.uncommittedEvents, ...events],
  };
}

function evaluateReadiness(
  plan: TestPlan,
  context: "markReady" | "startExecution",
): ExecutionReadiness {
  return PlanReadinessService.evaluate({
    status: plan.status,
    title: plan.title,
    objective: plan.objective,
    scope: plan.scope,
    items: plan.items,
    context,
  });
}

function assertReadiness(plan: TestPlan, context: "markReady" | "startExecution"): void {
  const readiness = evaluateReadiness(plan, context);
  if (!readiness.ready) {
    throw new PlanReadinessError(readiness.reasons);
  }
}

export function getExecutionReadiness(plan: TestPlan): ExecutionReadiness {
  if (plan.status === "approved") {
    return evaluateReadiness(plan, "markReady");
  }
  if (plan.status === "ready") {
    return evaluateReadiness(plan, "startExecution");
  }
  return PlanReadinessService.evaluate({
    status: plan.status,
    title: plan.title,
    objective: plan.objective,
    scope: plan.scope,
    items: plan.items,
    context: "markReady",
  });
}

export function getApprovalState(plan: TestPlan) {
  return deriveApprovalState(plan.status, plan.approvals);
}

export function createTestPlan(input: CreateTestPlanInput): TestPlan {
  const tenantId = createTenantId(input.tenantId);
  const createdBy = createActorId(input.createdBy);
  const scope = createPlanScope(input.scope);
  const title = createPlanTitle(input.title);
  const ownerId = createActorId(input.ownerId);
  const number = createPlanNumber(input.number);
  const objective = input.objective?.trim()
    ? createPlanObjective(input.objective)
    : "";
  const description = createPlanDescription(input.description);
  const priority = createPriority(input.priority);
  const createdAt = input.createdAt.trim();
  const assignment = createTestPlanAssignment({
    updatedAt: createdAt,
    updatedBy: createdBy,
  });
  const history = appendTestPlanHistory(createEmptyTestPlanHistory(), {
    at: createdAt,
    actorId: createdBy,
    action: "createTestPlan",
    summary: `Test plan ${number} created as draft`,
    toStatus: "draft",
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
  const createdEvent = buildPlanCreatedEvent({
    tenantId,
    planId: input.id.trim(),
    actorId: createdBy,
    occurredAt: createdAt,
    number,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
  const items: readonly TestPlanItem[] = [];
  return {
    id: input.id.trim(),
    tenantId,
    number,
    revision: 1,
    title,
    ...(description ? { description } : {}),
    objective,
    scope,
    status: "draft",
    priority,
    planType: scope.class,
    ownerId,
    versionLabel: PLAN_INITIAL_VERSION_LABEL,
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    items,
    schedule: {},
    assignment,
    approvals: [],
    revisions: [],
    history,
    metrics: PlanMetricsCalculator.recompute(items),
    ...(input.externalReferences ? { externalReferences: [...input.externalReferences] } : {}),
    uncommittedEvents: [createdEvent],
  };
}

export function updateTestPlanContent(
  plan: TestPlan,
  ctx: CommandContext,
  patch: {
    readonly title?: string;
    readonly description?: string | null;
    readonly objective?: string;
    readonly scope?: { readonly class: string; readonly label?: string; readonly externalRef?: string };
    readonly priority?: string;
  },
): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const title = patch.title !== undefined ? createPlanTitle(patch.title) : current.title;
  const description =
    patch.description === null
      ? undefined
      : patch.description !== undefined
        ? createPlanDescription(patch.description)
        : current.description;
  const objective =
    patch.objective !== undefined ? createPlanObjective(patch.objective) : current.objective;
  const scope = patch.scope !== undefined ? createPlanScope(patch.scope) : current.scope;
  const priority = patch.priority !== undefined ? createPriority(patch.priority) : current.priority;
  return withMutation(
    current,
    ctx,
    {
      title,
      ...(description !== undefined ? { description } : {}),
      objective,
      scope,
      priority,
      planType: scope.class,
    },
    "updateTestPlanContent",
    "Plan content updated",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
  );
}

export function updateTestPlanMetadata(
  plan: TestPlan,
  ctx: CommandContext,
  metadata: Readonly<Record<string, string>>,
): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  return withMutation(
    current,
    ctx,
    { metadata: { ...metadata } },
    "updateTestPlanMetadata",
    "Plan metadata updated",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
  );
}

export function transferOwnership(plan: TestPlan, ctx: CommandContext, ownerId: string): TestPlan {
  let current = beginCommand(plan, ctx);
  LifecyclePolicy.assertCanTransferOwnership(current.status);
  AssignmentPolicy.assertOwnerPresent(ownerId);
  return withMutation(
    current,
    ctx,
    { ownerId: createActorId(ownerId) },
    "transferOwnership",
    "Plan ownership transferred",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
  );
}

export function updateAssignment(
  plan: TestPlan,
  ctx: CommandContext,
  input: { readonly leadId?: string | null; readonly assigneeIds?: readonly string[] },
): TestPlan {
  let current = beginCommand(plan, ctx);
  AssignmentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const assignment = createTestPlanAssignment({
    leadId: input.leadId === null ? undefined : input.leadId ?? current.assignment.leadId,
    assigneeIds: input.assigneeIds ?? current.assignment.assigneeIds,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
  });
  return withMutation(
    current,
    ctx,
    { assignment },
    "updateAssignment",
    "Plan assignment updated",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
  );
}

export function updateSchedule(
  plan: TestPlan,
  ctx: CommandContext,
  input: {
    readonly plannedStart?: string | null;
    readonly plannedEnd?: string | null;
    readonly milestoneRef?: string | null;
    readonly timezone?: string | null;
  },
): TestPlan {
  let current = beginCommand(plan, ctx);
  SchedulingPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const schedule = createTestPlanSchedule({
    plannedStart:
      input.plannedStart === null ? undefined : input.plannedStart ?? current.schedule.plannedStart,
    plannedEnd:
      input.plannedEnd === null ? undefined : input.plannedEnd ?? current.schedule.plannedEnd,
    milestoneRef:
      input.milestoneRef === null ? undefined : input.milestoneRef ?? current.schedule.milestoneRef,
    timezone: input.timezone === null ? undefined : input.timezone ?? current.schedule.timezone,
  });
  SchedulingPolicy.assertValidSchedule(schedule);
  return withMutation(
    current,
    ctx,
    { schedule },
    "updateSchedule",
    "Plan schedule updated",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
  );
}

export function addPlanItem(
  plan: TestPlan,
  ctx: CommandContext,
  input: CreateTestPlanItemInput,
): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  if (current.items.some((item) => item.id === input.id.trim())) {
    throw new PlanInvariantViolationError("Plan item id must be unique within the plan");
  }
  const activeItems = current.items.filter((item) => isActiveItem(item));
  const sequence = input.sequence ?? activeItems.length;
  const item = createTestPlanItem({ ...input, sequence });
  ItemPolicy.assertNoDuplicateSpecPin(current.items, item);
  const items = [...current.items, item];
  return withMutation(
    current,
    ctx,
    { items },
    "addPlanItem",
    `Plan item ${item.id} added`,
    [
      buildPlanItemAddedEvent({
        ...eventBase(current, ctx),
        itemId: item.id,
        specificationId: item.specificationId,
      }),
    ],
  );
}

export function updatePlanItem(
  plan: TestPlan,
  ctx: CommandContext,
  itemId: string,
  patch: Parameters<typeof updateTestPlanItem>[1],
): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const index = current.items.findIndex((item) => item.id === itemId);
  if (index < 0) {
    throw new PlanValidationError(`Plan item ${itemId} not found`);
  }
  const existing = current.items[index];
  if (!existing) {
    throw new PlanValidationError(`Plan item ${itemId} not found`);
  }
  const updated = updateTestPlanItem(existing, patch);
  ItemPolicy.assertNoDuplicateSpecPin(current.items, updated, itemId);
  const items = [...current.items];
  items[index] = updated;
  return withMutation(
    current,
    ctx,
    { items },
    "updatePlanItem",
    `Plan item ${itemId} updated`,
    [
      buildPlanItemUpdatedEvent({
        ...eventBase(current, ctx),
        itemId,
      }),
    ],
  );
}

export function removePlanItem(plan: TestPlan, ctx: CommandContext, itemId: string): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const index = current.items.findIndex((item) => item.id === itemId);
  if (index < 0) {
    throw new PlanValidationError(`Plan item ${itemId} not found`);
  }
  const existing = current.items[index];
  if (!existing) {
    throw new PlanValidationError(`Plan item ${itemId} not found`);
  }
  const items = [...current.items];
  items[index] = updateTestPlanItem(existing, { itemStatus: "removed" });
  return withMutation(
    current,
    ctx,
    { items },
    "removePlanItem",
    `Plan item ${itemId} removed`,
    [
      buildPlanItemRemovedEvent({
        ...eventBase(current, ctx),
        itemId,
      }),
    ],
  );
}

export function reorderPlanItems(
  plan: TestPlan,
  ctx: CommandContext,
  orderedItemIds: readonly string[],
): TestPlan {
  let current = beginCommand(plan, ctx);
  ContentPolicy.assertEditable(current.status);
  LifecyclePolicy.assertNotTerminal(current.status);
  const activeItems = current.items.filter((item) => isActiveItem(item));
  const activeIds = new Set(activeItems.map((item) => item.id));
  if (orderedItemIds.length !== activeItems.length) {
    throw new PlanValidationError("Reorder must include all active plan items exactly once");
  }
  for (const id of orderedItemIds) {
    if (!activeIds.has(id)) {
      throw new PlanValidationError(`Unknown or inactive plan item id in reorder: ${id}`);
    }
  }
  const sequenceById = new Map(orderedItemIds.map((id, index) => [id, index]));
  const items = current.items.map((item) => {
    if (!isActiveItem(item)) {
      return item;
    }
    const sequence = sequenceById.get(item.id);
    if (sequence === undefined) {
      return item;
    }
    return updateTestPlanItem(item, { sequence });
  });
  const events = orderedItemIds.map((itemId) =>
    buildPlanItemUpdatedEvent({
      ...eventBase(current, ctx),
      itemId,
    }),
  );
  return withMutation(
    current,
    ctx,
    { items },
    "reorderPlanItems",
    "Plan items reordered",
    events,
  );
}

export function submitForReview(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  LifecyclePolicy.assertCanSubmitForReview({
    status: current.status,
    title: current.title,
    objective: current.objective,
    scope: current.scope,
    items: current.items,
  });
  return withMutation(
    current,
    ctx,
    { status: "review" },
    "submitForReview",
    "Plan submitted for review",
    [buildPlanReviewRequestedEvent(eventBase(current, ctx))],
    { from: current.status, to: "review" },
  );
}

export function approvePlan(
  plan: TestPlan,
  ctx: CommandContext & { readonly allowSelfApproval?: boolean; readonly comment?: string },
): TestPlan {
  let current = beginCommand(plan, ctx);
  ApprovalPolicy.assertCanDecide({
    status: current.status,
    ownerId: current.ownerId,
    actorId: ctx.actorId,
    allowSelfApproval: ctx.allowSelfApproval,
    decision: "approved",
    comment: ctx.comment,
  });
  const sealedVersion = resolveSealVersionLabel(current);
  const approval = createTestPlanApproval({
    id: `approval_${current.revision + 1}`,
    decision: "approved",
    decidedBy: ctx.actorId,
    decidedAt: ctx.changedAt,
    ...(ctx.comment ? { comment: ctx.comment } : {}),
    fromStatus: current.status,
    toStatus: "approved",
  });
  const revisionEntry = createTestPlanRevision({
    versionLabel: sealedVersion,
    sealedAt: ctx.changedAt,
    sealedBy: ctx.actorId,
    statusAtSeal: "approved",
    items: current.items,
    predecessorVersionLabel: current.revisions.at(-1)?.versionLabel,
  });
  return withMutation(
    current,
    ctx,
    {
      status: "approved",
      versionLabel: sealedVersion,
      approvals: [...current.approvals, approval],
      revisions: [...current.revisions, revisionEntry],
    },
    "approvePlan",
    `Plan approved and sealed as version ${sealedVersion}`,
    [
      buildPlanApprovedEvent({
        ...eventBase(current, ctx),
        versionLabel: sealedVersion,
      }),
    ],
    { from: current.status, to: "approved" },
  );
}

export function rejectPlan(
  plan: TestPlan,
  ctx: CommandContext,
  comment: string,
): TestPlan {
  let current = beginCommand(plan, ctx);
  ApprovalPolicy.assertCanDecide({
    status: current.status,
    ownerId: current.ownerId,
    actorId: ctx.actorId,
    decision: "rejected",
    comment,
  });
  const approval = createTestPlanApproval({
    id: `approval_${current.revision + 1}`,
    decision: "rejected",
    decidedBy: ctx.actorId,
    decidedAt: ctx.changedAt,
    comment,
    fromStatus: current.status,
    toStatus: "rejected",
  });
  return withMutation(
    current,
    ctx,
    {
      status: "rejected",
      approvals: [...current.approvals, approval],
    },
    "rejectPlan",
    "Plan rejected",
    [
      buildPlanRejectedEvent({
        ...eventBase(current, ctx),
        comment: comment.trim(),
      }),
    ],
    { from: current.status, to: "rejected" },
  );
}

export function returnToDraft(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  if (current.status !== "rejected") {
    throw new InvalidPlanStateError("Only rejected plans can be returned to draft");
  }
  return withMutation(
    current,
    ctx,
    { status: "draft" },
    "returnToDraft",
    "Plan returned to draft",
    [
      buildPlanUpdatedEvent({
        ...eventBase(current, ctx),
        revision: current.revision + 1,
      }),
    ],
    { from: current.status, to: "draft" },
  );
}

export function markReady(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  if (current.status !== "approved") {
    throw new InvalidPlanStateError("Only approved plans can be marked ready");
  }
  assertReadiness(current, "markReady");
  return withMutation(
    current,
    ctx,
    { status: "ready" },
    "markReady",
    "Plan marked ready for execution",
    [buildPlanReadyEvent(eventBase(current, ctx))],
    { from: current.status, to: "ready" },
  );
}

export function startExecution(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  if (current.status !== "ready") {
    throw new InvalidPlanStateError("Only ready plans can start execution");
  }
  assertReadiness(current, "startExecution");
  return withMutation(
    current,
    ctx,
    { status: "in_execution" },
    "startExecution",
    "Plan execution started",
    [buildPlanStartedEvent(eventBase(current, ctx))],
    { from: current.status, to: "in_execution" },
  );
}

export function completePlan(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  if (current.status !== "in_execution") {
    throw new InvalidPlanStateError("Only in-execution plans can be completed");
  }
  return withMutation(
    current,
    ctx,
    { status: "completed" },
    "completePlan",
    "Plan execution completed",
    [buildPlanCompletedEvent(eventBase(current, ctx))],
    { from: current.status, to: "completed" },
  );
}

export function archivePlan(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  ArchivalPolicy.assertCanArchive(current.status);
  return withMutation(
    current,
    ctx,
    { status: "archived" },
    "archivePlan",
    "Plan archived",
    [buildPlanArchivedEvent(eventBase(current, ctx))],
    { from: current.status, to: "archived" },
  );
}

export function cancelPlan(plan: TestPlan, ctx: CommandContext): TestPlan {
  let current = beginCommand(plan, ctx);
  if (!CANCELLABLE_STATUSES.includes(current.status as (typeof CANCELLABLE_STATUSES)[number])) {
    throw new InvalidPlanStateError(`Plan in ${current.status} status cannot be cancelled`);
  }
  return withMutation(
    current,
    ctx,
    { status: "cancelled" },
    "cancelPlan",
    "Plan cancelled",
    [buildPlanCancelledEvent(eventBase(current, ctx))],
    { from: current.status, to: "cancelled" },
  );
}

export type SupersedePlanResult = {
  readonly source: TestPlan;
  readonly successor: TestPlan;
};

export function supersedePlan(
  plan: TestPlan,
  ctx: CommandContext,
  input: {
    readonly successorId: string;
    readonly successorNumber: string;
  },
): SupersedePlanResult {
  let current = beginCommand(plan, ctx);
  PlanLineageService.assertSupersedeAllowed(current);
  LifecyclePolicy.assertCanSupersede(current.status);
  const draft = PlanCloneService.buildDraftFrom({
    source: current,
    id: input.successorId,
    number: input.successorNumber,
    actorId: ctx.actorId,
    changedAt: ctx.changedAt,
    predecessorPlanId: current.id,
    predecessorSealedVersionLabel: current.versionLabel,
  });
  const successorCreated = buildPlanCreatedEvent({
    tenantId: draft.tenantId,
    planId: draft.id,
    actorId: ctx.actorId,
    occurredAt: ctx.changedAt,
    number: draft.number,
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  });
  const successor: TestPlan = {
    ...draft,
    metrics: PlanMetricsCalculator.recompute(draft.items),
    uncommittedEvents: [successorCreated],
  };
  const source = withMutation(
    current,
    ctx,
    {
      status: "superseded",
      successorPlanId: successor.id,
    },
    "supersedePlan",
    `Plan superseded by ${successor.id}`,
    [
      buildPlanSupersededEvent({
        ...eventBase(current, ctx),
        successorPlanId: successor.id,
      }),
    ],
    { from: current.status, to: "superseded" },
  );
  return { source, successor };
}

export function cloneTestPlan(
  plan: TestPlan,
  ctx: CommandContext,
  input: {
    readonly id: string;
    readonly number: string;
    readonly title?: string;
  },
): TestPlan {
  const draft = PlanCloneService.buildDraftFrom({
    source: plan,
    id: input.id,
    number: input.number,
    actorId: ctx.actorId,
    changedAt: ctx.changedAt,
    ...(input.title ? { title: input.title } : {}),
  });
  const createdEvent = buildPlanCreatedEvent({
    tenantId: draft.tenantId,
    planId: draft.id,
    actorId: ctx.actorId,
    occurredAt: ctx.changedAt,
    number: draft.number,
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  });
  const history = appendTestPlanHistory(draft.history, {
    at: ctx.changedAt,
    actorId: ctx.actorId,
    action: "cloneTestPlan",
    summary: `Cloned from plan ${plan.id}`,
    toStatus: "draft",
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  });
  return {
    ...draft,
    history,
    metrics: PlanMetricsCalculator.recompute(draft.items),
    uncommittedEvents: [createdEvent],
  };
}

export function findPlanItem(plan: TestPlan, itemId: string): TestPlanItem | undefined {
  return plan.items.find((item) => item.id === itemId);
}

export function activePlanItems(plan: TestPlan): readonly TestPlanItem[] {
  return plan.items.filter((item) => isActiveItem(item));
}

export function hasDuplicateSpecPin(items: readonly TestPlanItem[]): boolean {
  const seen = new Set<string>();
  for (const item of items) {
    if (!isActiveItem(item)) {
      continue;
    }
    const key = itemSpecPinKey(item);
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }
  return false;
}
