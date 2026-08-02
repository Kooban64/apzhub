import { QEP_EXECUTION_SESSION_EVENT_VERSION } from "../version";
import type { ExecutionSessionNode } from "../domain/types";

export const QEP_EXECUTION_SESSION_EVENTS = {
  started: "qep.execution.started",
  paused: "qep.execution.paused",
  resumed: "qep.execution.resumed",
  blocked: "qep.execution.blocked",
  completed: "qep.execution.completed",
  cancelled: "qep.execution.cancelled",
  resultRecorded: "qep.execution.result_recorded",
  evidenceAttached: "qep.execution.evidence_attached",
  progressUpdated: "qep.execution.progress_updated",
  created: "qep.execution.created",
  archived: "qep.execution.archived",
  amended: "qep.execution.amended",
} as const;

export type QepExecutionSessionEventId =
  (typeof QEP_EXECUTION_SESSION_EVENTS)[keyof typeof QEP_EXECUTION_SESSION_EVENTS];

export type ExecutionSessionDomainEvent = {
  readonly eventId: QepExecutionSessionEventId;
  readonly eventVersion: string;
  readonly sessionId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export function sessionToEventPayload(
  session: ExecutionSessionNode,
): Readonly<Record<string, unknown>> {
  return {
    sessionId: session.sessionId,
    tenantId: session.tenantId,
    ...(session.projectId ? { projectId: session.projectId } : {}),
    name: session.name,
    status: session.status,
    ownerId: session.ownerId,
    assigneeIds: session.assigneeIds,
    planId: session.planning.planId,
    handoffId: session.planning.handoffId,
    suiteId: session.planning.suiteId,
    suiteName: session.planning.suiteName,
    percentComplete: session.progress.percentComplete,
    totalSteps: session.progress.totalSteps,
    executedSteps: session.progress.executedSteps,
    revision: session.revision,
  };
}

export function buildExecutionSessionDomainEvent(input: {
  readonly eventId: QepExecutionSessionEventId;
  readonly session: ExecutionSessionNode;
  readonly actorId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly extra?: Readonly<Record<string, unknown>>;
}): ExecutionSessionDomainEvent {
  return {
    eventId: input.eventId,
    eventVersion: QEP_EXECUTION_SESSION_EVENT_VERSION,
    sessionId: input.session.sessionId,
    tenantId: input.session.tenantId,
    ...(input.session.projectId ? { projectId: input.session.projectId } : {}),
    correlationId: input.correlationId,
    timestamp: input.timestamp,
    actorId: input.actorId,
    payload: {
      ...sessionToEventPayload(input.session),
      ...(input.extra ?? {}),
    },
  };
}
