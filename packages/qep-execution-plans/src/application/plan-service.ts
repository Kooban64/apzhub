/**
 * Execution Plan Application Service — APZQEP-140-B.
 * Intent and readiness only; no test execution.
 */

import { assertTransition } from "../domain/lifecycle";
import { evaluateExecutionPlanReadiness } from "../domain/readiness";
import type {
  ConfigurationReference,
  EnvironmentReference,
  ExecutionPlanAggregate,
  ExecutionPlanHistoryEntry,
  ExecutionPlanLifecycleState,
  ExecutionPlanNode,
  ExecutionPlanScope,
  PlanAssignments,
  PlanPrerequisite,
  PlanSchedule,
  ReadinessSnapshot,
} from "../domain/types";
import {
  defaultAssignments,
  defaultSchedule,
  defaultScope,
  emptyReadiness,
} from "../domain/types";
import {
  buildExecutionPlanDomainEvent,
  QEP_EXECUTION_PLAN_EVENTS,
  type ExecutionPlanDomainEvent,
  type QepExecutionPlanEventId,
} from "./events";
import type { ExecutionPlanListFilter, ExecutionPlanRepository } from "./repository";
import type { SuiteReferencePort } from "./suite-port";

export type PlanActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
};

export type PlanEventPublisher = {
  publish(event: ExecutionPlanDomainEvent): Promise<void>;
};

export type CreateExecutionPlanInput = {
  readonly planId?: string;
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly suiteId: string;
  readonly suiteVersion?: number;
  readonly scope?: Partial<ExecutionPlanScope>;
  readonly priority?: ExecutionPlanNode["priority"];
  readonly risk?: string;
  readonly releaseReference?: string;
  readonly milestoneReference?: string;
  readonly iterationReference?: string;
  readonly environmentReferences?: readonly EnvironmentReference[];
  readonly configurationReferences?: readonly ConfigurationReference[];
  readonly schedule?: Partial<PlanSchedule>;
  readonly assignments?: Partial<PlanAssignments>;
  readonly prerequisites?: readonly PlanPrerequisite[];
  readonly tags?: readonly string[];
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

function requirePermission(actor: PlanActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.execution_plans.admin")
  ) {
    throw new Error(`execution_plan.permission.denied:${permission}`);
  }
}

function history(
  actorId: string,
  at: string,
  action: string,
  from?: ExecutionPlanLifecycleState,
  to?: ExecutionPlanLifecycleState,
  detail?: string,
): ExecutionPlanHistoryEntry {
  return {
    at,
    actorId,
    action,
    ...(from ? { fromStatus: from } : {}),
    ...(to ? { toStatus: to } : {}),
    ...(detail ? { detail } : {}),
  };
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

function mergeAssignments(
  base: PlanAssignments,
  patch?: Partial<PlanAssignments>,
): PlanAssignments {
  if (!patch) return base;
  return {
    ...base,
    ...(patch.testLeadId !== undefined ? { testLeadId: patch.testLeadId } : {}),
    ...(patch.testerIds !== undefined ? { testerIds: patch.testerIds } : {}),
    ...(patch.reviewerIds !== undefined ? { reviewerIds: patch.reviewerIds } : {}),
    ...(patch.approverIds !== undefined ? { approverIds: patch.approverIds } : {}),
    ...(patch.responsibleTeamId !== undefined
      ? { responsibleTeamId: patch.responsibleTeamId }
      : {}),
    ...(patch.observerIds !== undefined ? { observerIds: patch.observerIds } : {}),
  };
}

export type ExecutionPlanApplicationService = {
  create(
    actor: PlanActor,
    input: CreateExecutionPlanInput,
    now: string,
  ): Promise<ExecutionPlanNode>;
  update(
    actor: PlanActor,
    planId: string,
    patch: Partial<CreateExecutionPlanInput> & {
      readonly ownerId?: string;
      readonly expectedRevision?: number;
    },
    now: string,
  ): Promise<ExecutionPlanNode>;
  transition(
    actor: PlanActor,
    planId: string,
    to: ExecutionPlanLifecycleState,
    now: string,
    options?: { readonly reason?: string },
  ): Promise<ExecutionPlanNode>;
  evaluateReadiness(
    actor: PlanActor,
    planId: string,
    now: string,
  ): Promise<ReadinessSnapshot>;
  schedule(
    actor: PlanActor,
    planId: string,
    schedule: Partial<PlanSchedule>,
    now: string,
  ): Promise<ExecutionPlanNode>;
  assign(
    actor: PlanActor,
    planId: string,
    assignments: Partial<PlanAssignments>,
    now: string,
  ): Promise<ExecutionPlanNode>;
  clone(
    actor: PlanActor,
    planId: string,
    now: string,
    options?: { readonly name?: string },
  ): Promise<ExecutionPlanNode>;
  handoff(actor: PlanActor, planId: string, now: string): Promise<ExecutionPlanNode>;
  get(actor: PlanActor, planId: string): Promise<ExecutionPlanAggregate>;
  list(
    actor: PlanActor,
    filter: Omit<ExecutionPlanListFilter, "tenantId">,
  ): Promise<readonly ExecutionPlanNode[]>;
  history(
    actor: PlanActor,
    planId: string,
  ): Promise<readonly ExecutionPlanHistoryEntry[]>;
  drainEvents(): readonly ExecutionPlanDomainEvent[];
};

export function createExecutionPlanApplicationService(deps: {
  readonly repository: ExecutionPlanRepository;
  readonly suites: SuiteReferencePort;
  readonly publisher?: PlanEventPublisher;
}): ExecutionPlanApplicationService {
  const pending: ExecutionPlanDomainEvent[] = [];

  async function emit(
    eventId: QepExecutionPlanEventId,
    plan: ExecutionPlanNode,
    actorId: string,
    now: string,
    extra?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event = buildExecutionPlanDomainEvent({
      eventId,
      plan,
      actorId,
      correlationId: `corr-${plan.planId}-${plan.revision}`,
      timestamp: now,
      ...(extra ? { extra } : {}),
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function load(
    tenantId: string,
    planId: string,
  ): Promise<ExecutionPlanAggregate> {
    const agg = await deps.repository.get(tenantId, planId);
    if (!agg) throw new Error(`execution_plan.not_found:${planId}`);
    return agg;
  }

  async function resolveSuite(actor: PlanActor, suiteId: string, projectId?: string) {
    const suite = await deps.suites.get(actor.tenantId, suiteId);
    if (!suite) throw new Error(`execution_plan.suite.not_found:${suiteId}`);
    if (suite.tenantId !== actor.tenantId) {
      throw new Error("execution_plan.suite.cross_tenant");
    }
    if (projectId && suite.projectId && suite.projectId !== projectId) {
      throw new Error("execution_plan.suite.cross_project");
    }
    if (
      suite.status === "archived" ||
      suite.status === "retired" ||
      suite.status === "deleted"
    ) {
      throw new Error(`execution_plan.suite.not_plannable:${suite.status}`);
    }
    return suite;
  }

  async function suiteCtx(actor: PlanActor, plan: ExecutionPlanNode) {
    const suite = await deps.suites.get(actor.tenantId, plan.suiteRef.suiteId);
    if (!suite) {
      return { exists: false, accessible: false };
    }
    const accessible =
      suite.tenantId === actor.tenantId &&
      (!plan.projectId || !suite.projectId || suite.projectId === plan.projectId);
    return {
      exists: true,
      accessible,
      status: suite.status,
      version: suite.version,
    };
  }

  return {
    drainEvents() {
      return [...pending];
    },

    async create(actor, input, now) {
      requirePermission(actor, "qep.execution_plans.create");
      if (!input.name.trim()) {
        throw new Error("execution_plan.validation.name_required");
      }
      if (!input.suiteId) {
        throw new Error("execution_plan.validation.suite_required");
      }

      const suite = await resolveSuite(actor, input.suiteId, input.projectId);
      const suiteVersion = input.suiteVersion ?? suite.version;
      const planId = input.planId ?? nextId("eplan");

      const plan: ExecutionPlanNode = {
        planId,
        tenantId: actor.tenantId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        name: input.name.trim(),
        description: input.description?.trim() ?? "",
        ownerId: actor.userId,
        suiteRef: {
          suiteId: suite.suiteId,
          suiteVersion,
          suiteName: suite.name,
          suiteStatusAtBind: suite.status,
        },
        scope: { ...defaultScope(), ...(input.scope ?? {}) },
        status: "draft",
        priority: input.priority ?? "normal",
        ...(input.risk ? { risk: input.risk } : {}),
        ...(input.releaseReference ? { releaseReference: input.releaseReference } : {}),
        ...(input.milestoneReference
          ? { milestoneReference: input.milestoneReference }
          : {}),
        ...(input.iterationReference
          ? { iterationReference: input.iterationReference }
          : {}),
        environmentReferences: input.environmentReferences ?? [],
        configurationReferences: input.configurationReferences ?? [],
        schedule: { ...defaultSchedule(), ...(input.schedule ?? {}) },
        assignments: mergeAssignments(defaultAssignments(), input.assignments),
        prerequisites: input.prerequisites ?? [],
        readiness: emptyReadiness(now),
        tags: input.tags ?? [],
        version: 1,
        revision: 1,
        createdAt: now,
        createdBy: actor.userId,
        updatedAt: now,
        updatedBy: actor.userId,
        customMetadata: input.customMetadata ?? {},
      };

      await deps.repository.save({
        plan,
        history: [history(actor.userId, now, "created", undefined, "draft")],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.created, plan, actor.userId, now);
      return plan;
    },

    async update(actor, planId, patch, now) {
      requirePermission(actor, "qep.execution_plans.update");
      const agg = await load(actor.tenantId, planId);
      const p = agg.plan;
      if (
        p.status === "handed_off" ||
        p.status === "retired" ||
        p.status === "cancelled"
      ) {
        throw new Error(`execution_plan.validation.immutable:${p.status}`);
      }
      if (patch.expectedRevision != null && patch.expectedRevision !== p.revision) {
        throw new Error("execution_plan.concurrency.stale_revision");
      }

      let suiteRef = p.suiteRef;
      if (patch.suiteId && patch.suiteId !== p.suiteRef.suiteId) {
        if (p.status !== "draft" && p.status !== "in_review") {
          throw new Error("execution_plan.suite.locked_after_approval");
        }
        const suite = await resolveSuite(
          actor,
          patch.suiteId,
          patch.projectId ?? p.projectId,
        );
        suiteRef = {
          suiteId: suite.suiteId,
          suiteVersion: patch.suiteVersion ?? suite.version,
          suiteName: suite.name,
          suiteStatusAtBind: suite.status,
        };
      } else if (patch.suiteVersion != null) {
        if (p.status !== "draft" && p.status !== "in_review") {
          throw new Error("execution_plan.suite.locked_after_approval");
        }
        suiteRef = { ...suiteRef, suiteVersion: patch.suiteVersion };
      }

      const next: ExecutionPlanNode = {
        ...p,
        suiteRef,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() }
          : {}),
        ...(patch.ownerId !== undefined ? { ownerId: patch.ownerId } : {}),
        ...(patch.projectId !== undefined ? { projectId: patch.projectId } : {}),
        ...(patch.scope !== undefined ? { scope: { ...p.scope, ...patch.scope } } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.risk !== undefined ? { risk: patch.risk } : {}),
        ...(patch.releaseReference !== undefined
          ? { releaseReference: patch.releaseReference }
          : {}),
        ...(patch.milestoneReference !== undefined
          ? { milestoneReference: patch.milestoneReference }
          : {}),
        ...(patch.iterationReference !== undefined
          ? { iterationReference: patch.iterationReference }
          : {}),
        ...(patch.environmentReferences !== undefined
          ? { environmentReferences: patch.environmentReferences }
          : {}),
        ...(patch.configurationReferences !== undefined
          ? { configurationReferences: patch.configurationReferences }
          : {}),
        ...(patch.schedule !== undefined
          ? { schedule: { ...p.schedule, ...patch.schedule } }
          : {}),
        ...(patch.assignments !== undefined
          ? { assignments: mergeAssignments(p.assignments, patch.assignments) }
          : {}),
        ...(patch.prerequisites !== undefined
          ? { prerequisites: patch.prerequisites }
          : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.customMetadata !== undefined
          ? { customMetadata: patch.customMetadata }
          : {}),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: p.revision + 1,
      };

      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "updated", p.status, p.status),
        ],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async transition(actor, planId, to, now, options = {}) {
      requirePermission(actor, "qep.execution_plans.lifecycle");
      const agg = await load(actor.tenantId, planId);
      const from = agg.plan.status;
      assertTransition(from, to);

      if (to === "scheduled") {
        if (
          !agg.plan.schedule.plannedStartAt ||
          agg.plan.schedule.scheduleStatus === "unset"
        ) {
          throw new Error("execution_plan.schedule.required");
        }
      }

      let readiness = agg.plan.readiness;
      if (to === "ready") {
        readiness = evaluateExecutionPlanReadiness(
          agg.plan,
          await suiteCtx(actor, agg.plan),
          now,
        );
        if (readiness.readinessState === "not_ready") {
          throw new Error("execution_plan.readiness.not_ready");
        }
      }

      const next: ExecutionPlanNode = {
        ...agg.plan,
        status: to,
        readiness,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.plan.revision + 1,
        ...(to === "approved" ? { approvedAt: now } : {}),
        ...(to === "archived" ? { archivedAt: now } : {}),
        ...(to === "cancelled" ? { cancelledAt: now } : {}),
      };

      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "lifecycle", from, to, options.reason),
        ],
      });

      let eventId: QepExecutionPlanEventId = QEP_EXECUTION_PLAN_EVENTS.updated;
      if (to === "in_review") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.submittedForReview;
      } else if (to === "approved") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.approved;
      } else if (to === "ready") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.ready;
      } else if (to === "scheduled") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.scheduled;
      } else if (to === "cancelled") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.cancelled;
      } else if (to === "archived") {
        eventId = QEP_EXECUTION_PLAN_EVENTS.archived;
      }

      await emit(eventId, next, actor.userId, now, {
        fromStatus: from,
        toStatus: to,
      });
      return next;
    },

    async evaluateReadiness(actor, planId, now) {
      requirePermission(actor, "qep.execution_plans.read");
      const agg = await load(actor.tenantId, planId);
      const readiness = evaluateExecutionPlanReadiness(
        agg.plan,
        await suiteCtx(actor, agg.plan),
        now,
      );
      const next: ExecutionPlanNode = {
        ...agg.plan,
        readiness,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.plan.revision + 1,
      };
      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "readiness_evaluated",
            agg.plan.status,
            agg.plan.status,
            readiness.readinessState,
          ),
        ],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.readinessEvaluated, next, actor.userId, now);
      return readiness;
    },

    async schedule(actor, planId, schedule, now) {
      requirePermission(actor, "qep.execution_plans.update");
      const agg = await load(actor.tenantId, planId);
      const nextSchedule: PlanSchedule = {
        ...agg.plan.schedule,
        ...schedule,
        scheduleStatus:
          schedule.scheduleStatus ??
          (schedule.plannedStartAt || agg.plan.schedule.plannedStartAt
            ? "planned"
            : agg.plan.schedule.scheduleStatus),
      };
      if (
        nextSchedule.plannedStartAt &&
        nextSchedule.plannedEndAt &&
        nextSchedule.plannedStartAt > nextSchedule.plannedEndAt
      ) {
        throw new Error("execution_plan.schedule.invalid_window");
      }
      const next: ExecutionPlanNode = {
        ...agg.plan,
        schedule: nextSchedule,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.plan.revision + 1,
      };
      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "schedule_updated", next.status, next.status),
        ],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async assign(actor, planId, assignments, now) {
      requirePermission(actor, "qep.execution_plans.update");
      const agg = await load(actor.tenantId, planId);
      const next: ExecutionPlanNode = {
        ...agg.plan,
        assignments: mergeAssignments(agg.plan.assignments, assignments),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.plan.revision + 1,
      };
      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "assignments_updated", next.status, next.status),
        ],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async clone(actor, planId, now, options = {}) {
      requirePermission(actor, "qep.execution_plans.create");
      const source = await load(actor.tenantId, planId);
      return this.create(
        actor,
        {
          name: options.name ?? `${source.plan.name} (Copy)`,
          description: source.plan.description,
          ...(source.plan.projectId ? { projectId: source.plan.projectId } : {}),
          suiteId: source.plan.suiteRef.suiteId,
          suiteVersion: source.plan.suiteRef.suiteVersion,
          scope: source.plan.scope,
          priority: source.plan.priority,
          ...(source.plan.risk ? { risk: source.plan.risk } : {}),
          environmentReferences: [...source.plan.environmentReferences],
          configurationReferences: [...source.plan.configurationReferences],
          schedule: { ...source.plan.schedule, scheduleStatus: "unset" },
          assignments: source.plan.assignments,
          prerequisites: source.plan.prerequisites.map((p) => ({
            ...p,
            satisfied: false,
          })),
          tags: [...source.plan.tags],
          customMetadata: {
            ...source.plan.customMetadata,
            clonedFrom: planId,
          },
        },
        now,
      );
    },

    async handoff(actor, planId, now) {
      requirePermission(actor, "qep.execution_plans.handoff");
      const agg = await load(actor.tenantId, planId);
      if (agg.plan.status === "handed_off" && agg.plan.handoff) {
        // Idempotent — return existing handoff
        return agg.plan;
      }
      assertTransition(agg.plan.status, "handed_off");
      if (agg.plan.status !== "scheduled") {
        throw new Error("execution_plan.handoff.requires_scheduled");
      }

      const handoffId = nextId("handoff");
      const next: ExecutionPlanNode = {
        ...agg.plan,
        status: "handed_off",
        handoff: {
          handoffId,
          handedOffAt: now,
          handedOffBy: actor.userId,
          correlationId: `handoff-${planId}-${handoffId}`,
        },
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.plan.revision + 1,
      };
      await deps.repository.save({
        plan: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "handed_off",
            agg.plan.status,
            "handed_off",
            handoffId,
          ),
        ],
      });
      await emit(QEP_EXECUTION_PLAN_EVENTS.handedOff, next, actor.userId, now);
      return next;
    },

    async get(actor, planId) {
      requirePermission(actor, "qep.execution_plans.read");
      return load(actor.tenantId, planId);
    },

    async list(actor, filter) {
      requirePermission(actor, "qep.execution_plans.read");
      return deps.repository.list({ ...filter, tenantId: actor.tenantId });
    },

    async history(actor, planId) {
      requirePermission(actor, "qep.execution_plans.read");
      const agg = await load(actor.tenantId, planId);
      return agg.history;
    },
  };
}
