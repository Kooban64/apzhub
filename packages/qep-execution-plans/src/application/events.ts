import { QEP_EXECUTION_PLAN_EVENT_VERSION } from "../version";
import type { ExecutionPlanNode } from "../domain/types";

export const QEP_EXECUTION_PLAN_EVENTS = {
  created: "qep.execution-plan.created",
  updated: "qep.execution-plan.updated",
  submittedForReview: "qep.execution-plan.submitted-for-review",
  approved: "qep.execution-plan.approved",
  readinessEvaluated: "qep.execution-plan.readiness-evaluated",
  ready: "qep.execution-plan.ready",
  scheduled: "qep.execution-plan.scheduled",
  handedOff: "qep.execution-plan.handed-off",
  cancelled: "qep.execution-plan.cancelled",
  archived: "qep.execution-plan.archived",
} as const;

export type QepExecutionPlanEventId =
  (typeof QEP_EXECUTION_PLAN_EVENTS)[keyof typeof QEP_EXECUTION_PLAN_EVENTS];

export type ExecutionPlanDomainEvent = {
  readonly eventId: QepExecutionPlanEventId;
  readonly eventVersion: string;
  readonly planId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function planToEventPayload(
  plan: ExecutionPlanNode,
): Readonly<Record<string, unknown>> {
  return {
    planId: plan.planId,
    tenantId: plan.tenantId,
    ...(plan.projectId ? { projectId: plan.projectId } : {}),
    name: plan.name,
    description: plan.description,
    ownerId: plan.ownerId,
    status: plan.status,
    priority: plan.priority,
    suiteId: plan.suiteRef.suiteId,
    suiteVersion: plan.suiteRef.suiteVersion,
    suiteName: plan.suiteRef.suiteName,
    readinessState: plan.readiness.readinessState,
    tags: plan.tags,
    assigneeIds: [
      ...(plan.assignments.testLeadId ? [plan.assignments.testLeadId] : []),
      ...plan.assignments.testerIds,
    ],
    plannedStartAt: plan.schedule.plannedStartAt,
    plannedEndAt: plan.schedule.plannedEndAt,
    revision: plan.revision,
    version: plan.version,
    ...(plan.handoff ? { handoffId: plan.handoff.handoffId } : {}),
  };
}

export function buildExecutionPlanDomainEvent(input: {
  readonly eventId: QepExecutionPlanEventId;
  readonly plan: ExecutionPlanNode;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly extra?: Readonly<Record<string, unknown>>;
}): ExecutionPlanDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_EXECUTION_PLAN_EVENT_VERSION,
    planId: input.plan.planId,
    tenantId: input.plan.tenantId,
    ...(input.plan.projectId ? { projectId: input.plan.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: {
      ...planToEventPayload(input.plan),
      ...(input.extra ?? {}),
    },
  };
}
