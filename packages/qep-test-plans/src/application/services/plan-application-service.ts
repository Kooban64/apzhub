import { randomUUID } from "node:crypto";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import type { PlanDomainEvent } from "../../domain/test-plan/plan-events";
import type { TestPlanHistoryEntry } from "../../domain/test-plan/plan-history";
import type { CreateTestPlanItemInput, TestPlanItem } from "../../domain/test-plan/plan-item";
import type {
  StoredTestPlan,
  TestPlanListQuery,
  TestPlanRepository,
} from "../../domain/test-plan/plan-repository";
import type { TestPlanRevision } from "../../domain/test-plan/plan-revision";
import {
  addPlanItem,
  approvePlan,
  archivePlan,
  cancelPlan,
  cloneTestPlan,
  completePlan,
  createTestPlan,
  getExecutionReadiness,
  markReady,
  rejectPlan,
  removePlanItem,
  reorderPlanItems,
  returnToDraft,
  startExecution,
  submitForReview,
  supersedePlan,
  transferOwnership,
  updateAssignment,
  updatePlanItem,
  updateSchedule,
  updateTestPlanContent,
  updateTestPlanMetadata,
  type TestPlan,
} from "../../domain/test-plan/test-plan";
import type { ExecutionReadiness } from "../../domain/test-plan/value-objects";
import { PlanConflictError, PlanForbiddenError, PlanNotFoundError } from "../../shared/errors";
import { filterAndPaginate } from "../../shared/pagination";

export type PlanAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly planId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export type PlanAuditAppender = {
  append(entry: PlanAuditEntry): Promise<void | PlanAuditEntry>;
};

export type PlanObservationEvent = {
  readonly operation: string;
  readonly durationMs: number;
  readonly outcome: "success" | "error";
};

export type CreatePlanCommandInput = {
  readonly title: string;
  readonly objective?: string;
  readonly description?: string;
  readonly scope: { readonly class: string; readonly label?: string; readonly externalRef?: string };
  readonly priority?: string;
  readonly ownerId?: string;
  readonly externalReferences?: readonly string[];
};

export type UpdatePlanContentCommandInput = {
  readonly title?: string;
  readonly description?: string | null;
  readonly objective?: string;
  readonly scope?: { readonly class: string; readonly label?: string; readonly externalRef?: string };
  readonly priority?: string;
  readonly expectedRevision: number;
};

export type UpdatePlanMetadataCommandInput = {
  readonly metadata: Readonly<Record<string, string>>;
  readonly expectedRevision: number;
};

export type TransferPlanOwnershipCommandInput = {
  readonly ownerId: string;
  readonly expectedRevision: number;
};

export type UpdatePlanAssignmentCommandInput = {
  readonly leadId?: string | null;
  readonly assigneeIds?: readonly string[];
  readonly expectedRevision: number;
};

export type UpdatePlanScheduleCommandInput = {
  readonly plannedStart?: string | null;
  readonly plannedEnd?: string | null;
  readonly milestoneRef?: string | null;
  readonly timezone?: string | null;
  readonly expectedRevision: number;
};

export type AddPlanItemCommandInput = {
  readonly id?: string;
  readonly specificationId: string;
  readonly specificationVersionPin?: string;
  readonly sequence?: number;
  readonly itemStatus?: string;
  readonly notes?: string;
  readonly requirementRefs?: readonly string[];
  readonly expectedRevision: number;
};

export type UpdatePlanItemCommandInput = {
  readonly specificationVersionPin?: string | null;
  readonly sequence?: number;
  readonly itemStatus?: string;
  readonly notes?: string | null;
  readonly requirementRefs?: readonly string[] | null;
  readonly expectedRevision: number;
};

export type RemovePlanItemCommandInput = {
  readonly expectedRevision: number;
};

export type ReorderPlanItemsCommandInput = {
  readonly orderedItemIds: readonly string[];
  readonly expectedRevision: number;
};

export type SubmitPlanReviewCommandInput = {
  readonly expectedRevision: number;
};

export type ApprovePlanCommandInput = {
  readonly comment?: string;
  readonly allowSelfApproval?: boolean;
  readonly expectedRevision: number;
};

export type RejectPlanCommandInput = {
  readonly comment: string;
  readonly expectedRevision: number;
};

export type LifecycleTransitionCommandInput = {
  readonly expectedRevision: number;
};

export type SupersedePlanCommandInput = {
  readonly successorId?: string;
  readonly successorNumber?: string;
  readonly expectedRevision: number;
};

export type ClonePlanCommandInput = {
  readonly id?: string;
  readonly number?: string;
  readonly title?: string;
};

export type PlanListCommandQuery = TestPlanListQuery;

export type PlanApplicationServiceDeps = {
  readonly plans: TestPlanRepository;
  readonly audits?: PlanAuditAppender;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly allocateNumber?: (ctx: QepRequestContext) => Promise<string> | string;
  readonly onDomainEvent?: (event: PlanDomainEvent) => void | Promise<void>;
  readonly onPlanUpserted?: (plan: StoredTestPlan) => void | Promise<void>;
  readonly onObservation?: (event: PlanObservationEvent) => void;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
  /** Injectable permission hook — defaults to allow-list-of-any-required check. */
  readonly assertPermission?: (
    ctx: QepRequestContext,
    requiredOneOf: readonly string[],
  ) => void;
};

export type PlanApplicationService = {
  createPlan(ctx: QepRequestContext, input: CreatePlanCommandInput): Promise<StoredTestPlan>;
  updateContent(
    ctx: QepRequestContext,
    id: string,
    input: UpdatePlanContentCommandInput,
  ): Promise<StoredTestPlan>;
  updateMetadata(
    ctx: QepRequestContext,
    id: string,
    input: UpdatePlanMetadataCommandInput,
  ): Promise<StoredTestPlan>;
  transferOwnership(
    ctx: QepRequestContext,
    id: string,
    input: TransferPlanOwnershipCommandInput,
  ): Promise<StoredTestPlan>;
  updateAssignment(
    ctx: QepRequestContext,
    id: string,
    input: UpdatePlanAssignmentCommandInput,
  ): Promise<StoredTestPlan>;
  updateSchedule(
    ctx: QepRequestContext,
    id: string,
    input: UpdatePlanScheduleCommandInput,
  ): Promise<StoredTestPlan>;
  addItem(
    ctx: QepRequestContext,
    id: string,
    input: AddPlanItemCommandInput,
  ): Promise<StoredTestPlan>;
  updateItem(
    ctx: QepRequestContext,
    id: string,
    itemId: string,
    input: UpdatePlanItemCommandInput,
  ): Promise<StoredTestPlan>;
  removeItem(
    ctx: QepRequestContext,
    id: string,
    itemId: string,
    input: RemovePlanItemCommandInput,
  ): Promise<StoredTestPlan>;
  reorderItems(
    ctx: QepRequestContext,
    id: string,
    input: ReorderPlanItemsCommandInput,
  ): Promise<StoredTestPlan>;
  submitForReview(
    ctx: QepRequestContext,
    id: string,
    input: SubmitPlanReviewCommandInput,
  ): Promise<StoredTestPlan>;
  approve(
    ctx: QepRequestContext,
    id: string,
    input: ApprovePlanCommandInput,
  ): Promise<StoredTestPlan>;
  reject(ctx: QepRequestContext, id: string, input: RejectPlanCommandInput): Promise<StoredTestPlan>;
  returnToDraft(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  markReady(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  startExecution(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  complete(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  archive(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  cancel(
    ctx: QepRequestContext,
    id: string,
    input: LifecycleTransitionCommandInput,
  ): Promise<StoredTestPlan>;
  supersede(
    ctx: QepRequestContext,
    id: string,
    input: SupersedePlanCommandInput,
  ): Promise<{ readonly source: StoredTestPlan; readonly successor: StoredTestPlan }>;
  clone(
    ctx: QepRequestContext,
    id: string,
    input?: ClonePlanCommandInput,
  ): Promise<StoredTestPlan>;

  get(ctx: QepRequestContext, id: string): Promise<StoredTestPlan | null>;
  getByNumber(ctx: QepRequestContext, number: string): Promise<StoredTestPlan | null>;
  list(
    ctx: QepRequestContext,
    query?: PlanListCommandQuery,
  ): Promise<{
    items: readonly StoredTestPlan[];
    total: number;
    limit: number;
    offset: number;
  }>;
  search(
    ctx: QepRequestContext,
    query: string,
    queryOptions?: Omit<PlanListCommandQuery, "query">,
  ): Promise<{
    items: readonly StoredTestPlan[];
    total: number;
    limit: number;
    offset: number;
  }>;
  listHistory(ctx: QepRequestContext, id: string): Promise<readonly TestPlanHistoryEntry[]>;
  listRevisions(ctx: QepRequestContext, id: string): Promise<readonly TestPlanRevision[]>;
  getExecutionReadiness(ctx: QepRequestContext, id: string): Promise<ExecutionReadiness>;
};

const READ = "qep.plan.read";
const CREATE = "qep.plan.create";
const UPDATE = "qep.plan.update";
const SUBMIT = "qep.plan.submit";
const APPROVE = "qep.plan.approve";
const REJECT = "qep.plan.reject";
const READY = "qep.plan.ready";
const EXECUTE = "qep.plan.execute";
const COMPLETE = "qep.plan.complete";
const ARCHIVE = "qep.plan.archive";
const CANCEL = "qep.plan.cancel";
const CLONE = "qep.plan.clone";
const SUPERSEDE = "qep.plan.supersede";
const ASSIGN = "qep.plan.assign";
const SCHEDULE = "qep.plan.schedule";
const SEARCH = "qep.plan.search";
const HISTORY_VIEW = "qep.plan.history.view";

function nowIso(deps: PlanApplicationServiceDeps): string {
  return deps.now?.() ?? new Date().toISOString();
}

function runInTransaction<T>(
  deps: PlanApplicationServiceDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

function nextPlanId(deps: PlanApplicationServiceDeps): string {
  const generated = deps.id?.() ?? randomUUID().replace(/-/g, "").slice(0, 16);
  return generated.startsWith("tpl_") ? generated : `tpl_${generated}`;
}

async function allocateNumber(
  deps: PlanApplicationServiceDeps,
  ctx: QepRequestContext,
): Promise<string> {
  if (deps.allocateNumber) {
    return deps.allocateNumber(ctx);
  }
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = `TP-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    const exists = await deps.plans.existsByNumber(ctx.tenantId, candidate);
    if (!exists) {
      return candidate;
    }
  }
  throw new PlanConflictError("Unable to allocate a unique Test Plan number after multiple attempts");
}

function defaultAssertPermission(ctx: QepRequestContext, requiredOneOf: readonly string[]): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (granted.includes("qep.plan.*")) return;
  if (requiredOneOf.some((permission) => granted.includes(permission))) return;
  throw new PlanForbiddenError(`Missing permission: ${requiredOneOf[0]}`);
}

function commandContext(
  deps: PlanApplicationServiceDeps,
  ctx: QepRequestContext,
  expectedRevision?: number,
) {
  return {
    actorId: ctx.userId,
    changedAt: nowIso(deps),
    correlationId: ctx.correlationId,
    ...(expectedRevision !== undefined ? { expectedRevision } : {}),
  };
}

async function appendAudit(
  deps: PlanApplicationServiceDeps,
  ctx: QepRequestContext,
  planId: string,
  action: string,
  details: Readonly<Record<string, unknown>> = {},
): Promise<void> {
  if (!deps.audits) return;
  await deps.audits.append({
    id: deps.id?.() ?? randomUUID(),
    tenantId: ctx.tenantId,
    planId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detailsJson: details,
    createdAt: nowIso(deps),
  });
}

async function observe<T>(
  deps: PlanApplicationServiceDeps,
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

async function emitEvents(deps: PlanApplicationServiceDeps, plan: TestPlan): Promise<void> {
  for (const event of plan.uncommittedEvents) {
    await deps.onDomainEvent?.(event);
  }
}

async function requirePlan(
  deps: PlanApplicationServiceDeps,
  tenantId: string,
  id: string,
): Promise<StoredTestPlan> {
  const plan = await deps.plans.get(tenantId, id);
  if (!plan) {
    throw new PlanNotFoundError(`Test Plan not found: ${id}`);
  }
  return plan;
}

async function persistMutation(
  deps: PlanApplicationServiceDeps,
  ctx: QepRequestContext,
  mutated: TestPlan,
  expectedRevision: number,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredTestPlan> {
  const stored = await runInTransaction(deps, async () => deps.plans.save(mutated, expectedRevision));
  await appendAudit(deps, ctx, stored.id, auditAction, { ...auditDetails, status: stored.status });
  await emitEvents(deps, mutated);
  try {
    await deps.onPlanUpserted?.(stored);
  } catch {
    // Search / projection failures must not roll back persisted Test Plans.
  }
  return stored;
}

async function persistCreate(
  deps: PlanApplicationServiceDeps,
  ctx: QepRequestContext,
  created: TestPlan,
  auditAction: string,
  auditDetails: Readonly<Record<string, unknown>> = {},
): Promise<StoredTestPlan> {
  const stored = await runInTransaction(deps, async () => deps.plans.create(created));
  await appendAudit(deps, ctx, stored.id, auditAction, auditDetails);
  await emitEvents(deps, created);
  try {
    await deps.onPlanUpserted?.(stored);
  } catch {
    // projection isolation
  }
  return stored;
}

export function createPlanApplicationService(
  deps: PlanApplicationServiceDeps,
): PlanApplicationService {
  const assertPermission = deps.assertPermission ?? defaultAssertPermission;

  const service: PlanApplicationService = {
    async createPlan(ctx, input) {
      return observe(deps, "plan.create", async () => {
        assertPermission(ctx, [CREATE]);
        const number = await allocateNumber(deps, ctx);
        const created = createTestPlan({
          id: nextPlanId(deps),
          tenantId: ctx.tenantId,
          number,
          title: input.title,
          ownerId: input.ownerId ?? ctx.userId,
          scope: input.scope,
          description: input.description,
          objective: input.objective,
          priority: input.priority,
          createdAt: nowIso(deps),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
          externalReferences: input.externalReferences,
        });
        return persistCreate(deps, ctx, created, "qep.plan.created", { number });
      });
    },

    async updateContent(ctx, id, input) {
      return observe(deps, "plan.update_content", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = updateTestPlanContent(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          {
            title: input.title,
            description: input.description,
            objective: input.objective,
            scope: input.scope,
            priority: input.priority,
          },
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.content_updated");
      });
    },

    async updateMetadata(ctx, id, input) {
      return observe(deps, "plan.update_metadata", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = updateTestPlanMetadata(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          input.metadata,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.metadata_updated");
      });
    },

    async transferOwnership(ctx, id, input) {
      return observe(deps, "plan.transfer_ownership", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = transferOwnership(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          input.ownerId,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.ownership_transferred", {
          ownerId: input.ownerId,
        });
      });
    },

    async updateAssignment(ctx, id, input) {
      return observe(deps, "plan.update_assignment", async () => {
        assertPermission(ctx, [ASSIGN]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = updateAssignment(existing, commandContext(deps, ctx, input.expectedRevision), {
          leadId: input.leadId,
          assigneeIds: input.assigneeIds,
        });
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.assignment_updated");
      });
    },

    async updateSchedule(ctx, id, input) {
      return observe(deps, "plan.update_schedule", async () => {
        assertPermission(ctx, [SCHEDULE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = updateSchedule(existing, commandContext(deps, ctx, input.expectedRevision), {
          plannedStart: input.plannedStart,
          plannedEnd: input.plannedEnd,
          milestoneRef: input.milestoneRef,
          timezone: input.timezone,
        });
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.schedule_updated");
      });
    },

    async addItem(ctx, id, input) {
      return observe(deps, "plan.add_item", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const itemInput: CreateTestPlanItemInput = {
          id: input.id ?? `tpi_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
          specificationId: input.specificationId,
          specificationVersionPin: input.specificationVersionPin,
          sequence: input.sequence ?? existing.items.length,
          itemStatus: input.itemStatus as TestPlanItem["itemStatus"] | undefined,
          notes: input.notes,
          requirementRefs: input.requirementRefs,
        };
        const mutated = addPlanItem(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          itemInput,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.item_added", {
          specificationId: input.specificationId,
        });
      });
    },

    async updateItem(ctx, id, itemId, input) {
      return observe(deps, "plan.update_item", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = updatePlanItem(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          itemId,
          {
            specificationVersionPin: input.specificationVersionPin,
            sequence: input.sequence,
            itemStatus: input.itemStatus as TestPlanItem["itemStatus"] | undefined,
            notes: input.notes,
            requirementRefs: input.requirementRefs,
          },
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.item_updated", {
          itemId,
        });
      });
    },

    async removeItem(ctx, id, itemId, input) {
      return observe(deps, "plan.remove_item", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = removePlanItem(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          itemId,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.item_removed", {
          itemId,
        });
      });
    },

    async reorderItems(ctx, id, input) {
      return observe(deps, "plan.reorder_items", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = reorderPlanItems(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          input.orderedItemIds,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.items_reordered");
      });
    },

    async submitForReview(ctx, id, input) {
      return observe(deps, "plan.submit_for_review", async () => {
        assertPermission(ctx, [SUBMIT]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = submitForReview(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.review_submitted");
      });
    },

    async approve(ctx, id, input) {
      return observe(deps, "plan.approve", async () => {
        assertPermission(ctx, [APPROVE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = approvePlan(existing, {
          ...commandContext(deps, ctx, input.expectedRevision),
          allowSelfApproval: input.allowSelfApproval,
          comment: input.comment,
        });
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.approved");
      });
    },

    async reject(ctx, id, input) {
      return observe(deps, "plan.reject", async () => {
        assertPermission(ctx, [REJECT]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = rejectPlan(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          input.comment,
        );
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.rejected");
      });
    },

    async returnToDraft(ctx, id, input) {
      return observe(deps, "plan.return_to_draft", async () => {
        assertPermission(ctx, [UPDATE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = returnToDraft(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.returned_to_draft");
      });
    },

    async markReady(ctx, id, input) {
      return observe(deps, "plan.mark_ready", async () => {
        assertPermission(ctx, [READY]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = markReady(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.marked_ready");
      });
    },

    async startExecution(ctx, id, input) {
      return observe(deps, "plan.start_execution", async () => {
        assertPermission(ctx, [EXECUTE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = startExecution(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.execution_started");
      });
    },

    async complete(ctx, id, input) {
      return observe(deps, "plan.complete", async () => {
        assertPermission(ctx, [COMPLETE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = completePlan(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.completed");
      });
    },

    async archive(ctx, id, input) {
      return observe(deps, "plan.archive", async () => {
        assertPermission(ctx, [ARCHIVE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = archivePlan(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.archived");
      });
    },

    async cancel(ctx, id, input) {
      return observe(deps, "plan.cancel", async () => {
        assertPermission(ctx, [CANCEL]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const mutated = cancelPlan(existing, commandContext(deps, ctx, input.expectedRevision));
        return persistMutation(deps, ctx, mutated, existing.revision, "qep.plan.cancelled");
      });
    },

    async supersede(ctx, id, input) {
      return observe(deps, "plan.supersede", async () => {
        assertPermission(ctx, [SUPERSEDE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const successorId = input.successorId ?? nextPlanId(deps);
        const successorNumber = input.successorNumber ?? (await allocateNumber(deps, ctx));

        const { source, successor } = supersedePlan(
          existing,
          commandContext(deps, ctx, input.expectedRevision),
          { successorId, successorNumber },
        );

        const storedSuccessor = await persistCreate(
          deps,
          ctx,
          successor,
          "qep.plan.successor_created",
          { predecessorPlanId: existing.id },
        );
        const storedSource = await persistMutation(
          deps,
          ctx,
          source,
          existing.revision,
          "qep.plan.superseded",
          { successorPlanId: successorId },
        );
        return { source: storedSource, successor: storedSuccessor };
      });
    },

    async clone(ctx, id, input = {}) {
      return observe(deps, "plan.clone", async () => {
        assertPermission(ctx, [CLONE]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        const cloneId = input.id ?? nextPlanId(deps);
        const cloneNumber = input.number ?? (await allocateNumber(deps, ctx));
        const cloned = cloneTestPlan(existing, commandContext(deps, ctx), {
          id: cloneId,
          number: cloneNumber,
          title: input.title,
        });
        return persistCreate(deps, ctx, cloned, "qep.plan.cloned", { predecessorPlanId: existing.id });
      });
    },

    async get(ctx, id) {
      return observe(deps, "plan.get", async () => {
        assertPermission(ctx, [READ]);
        return deps.plans.get(ctx.tenantId, id);
      });
    },

    async getByNumber(ctx, number) {
      return observe(deps, "plan.get_by_number", async () => {
        assertPermission(ctx, [READ]);
        return deps.plans.getByNumber(ctx.tenantId, number);
      });
    },

    async list(ctx, query = {}) {
      return observe(deps, "plan.list", async () => {
        assertPermission(ctx, [READ]);
        const items = await deps.plans.list(ctx.tenantId, query);
        return filterAndPaginate(items, query.limit ?? 50, query.offset ?? 0);
      });
    },

    async search(ctx, query, queryOptions = {}) {
      return observe(deps, "plan.search", async () => {
        assertPermission(ctx, [READ, SEARCH]);
        const items = await deps.plans.list(ctx.tenantId, { ...queryOptions, query });
        return filterAndPaginate(items, queryOptions.limit ?? 50, queryOptions.offset ?? 0);
      });
    },

    async listHistory(ctx, id) {
      return observe(deps, "plan.history", async () => {
        assertPermission(ctx, [READ, HISTORY_VIEW]);
        return deps.plans.listHistory(ctx.tenantId, id);
      });
    },

    async listRevisions(ctx, id) {
      return observe(deps, "plan.list_revisions", async () => {
        assertPermission(ctx, [READ]);
        return deps.plans.listRevisions(ctx.tenantId, id);
      });
    },

    async getExecutionReadiness(ctx, id) {
      return observe(deps, "plan.execution_readiness", async () => {
        assertPermission(ctx, [READ]);
        const existing = await requirePlan(deps, ctx.tenantId, id);
        return getExecutionReadiness(existing);
      });
    },
  };

  return service;
}
