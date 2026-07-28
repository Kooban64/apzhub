import type { TenantId } from "./value-objects";

export type ExecutionEventType =
  | "test_execution.created"
  | "test_execution.prepared"
  | "test_execution.assigned"
  | "test_execution.started"
  | "test_execution.step_result_recorded"
  | "test_execution.evidence_associated"
  | "test_execution.observation_recorded"
  | "test_execution.paused"
  | "test_execution.blocked"
  | "test_execution.resumed"
  | "test_execution.completed"
  | "test_execution.submitted_for_review"
  | "test_execution.accepted"
  | "test_execution.rejected"
  | "test_execution.cancelled"
  | "test_execution.superseded"
  | "test_execution.external_result_received";

export type ExecutionEventBase = {
  readonly eventId: string;
  readonly type: ExecutionEventType;
  readonly occurredAt: string;
  readonly tenantId: TenantId;
  readonly executionId: string;
  readonly actorId: string;
  readonly correlationId?: string;
  readonly revision?: number;
};

export type ExecutionCreatedEvent = ExecutionEventBase & {
  readonly type: "test_execution.created";
  readonly executionNumber: string;
};

export type ExecutionPreparedEvent = ExecutionEventBase & {
  readonly type: "test_execution.prepared";
  readonly contentHash: string;
};

export type ExecutionAssignedEvent = ExecutionEventBase & {
  readonly type: "test_execution.assigned";
  readonly executorId?: string;
};

export type ExecutionStartedEvent = ExecutionEventBase & {
  readonly type: "test_execution.started";
};

export type ExecutionStepResultRecordedEvent = ExecutionEventBase & {
  readonly type: "test_execution.step_result_recorded";
  readonly stepOrder: number;
  readonly outcome: string;
};

export type ExecutionEvidenceAssociatedEvent = ExecutionEventBase & {
  readonly type: "test_execution.evidence_associated";
  readonly evidenceId: string;
};

export type ExecutionObservationRecordedEvent = ExecutionEventBase & {
  readonly type: "test_execution.observation_recorded";
  readonly observationId: string;
};

export type ExecutionPausedEvent = ExecutionEventBase & {
  readonly type: "test_execution.paused";
};

export type ExecutionBlockedEvent = ExecutionEventBase & {
  readonly type: "test_execution.blocked";
  readonly reason: string;
};

export type ExecutionResumedEvent = ExecutionEventBase & {
  readonly type: "test_execution.resumed";
};

export type ExecutionCompletedEvent = ExecutionEventBase & {
  readonly type: "test_execution.completed";
  readonly derivedOutcome: string;
};

export type ExecutionSubmittedForReviewEvent = ExecutionEventBase & {
  readonly type: "test_execution.submitted_for_review";
};

export type ExecutionAcceptedEvent = ExecutionEventBase & {
  readonly type: "test_execution.accepted";
  readonly finalOutcome: string;
};

export type ExecutionRejectedEvent = ExecutionEventBase & {
  readonly type: "test_execution.rejected";
  readonly reason: string;
};

export type ExecutionCancelledEvent = ExecutionEventBase & {
  readonly type: "test_execution.cancelled";
  readonly reason?: string;
};

export type ExecutionSupersededEvent = ExecutionEventBase & {
  readonly type: "test_execution.superseded";
  readonly successorExecutionId: string;
};

export type ExecutionExternalResultReceivedEvent = ExecutionEventBase & {
  readonly type: "test_execution.external_result_received";
  readonly submissionId: string;
  readonly sourceSystemId: string;
};

export type ExecutionDomainEvent =
  | ExecutionCreatedEvent
  | ExecutionPreparedEvent
  | ExecutionAssignedEvent
  | ExecutionStartedEvent
  | ExecutionStepResultRecordedEvent
  | ExecutionEvidenceAssociatedEvent
  | ExecutionObservationRecordedEvent
  | ExecutionPausedEvent
  | ExecutionBlockedEvent
  | ExecutionResumedEvent
  | ExecutionCompletedEvent
  | ExecutionSubmittedForReviewEvent
  | ExecutionAcceptedEvent
  | ExecutionRejectedEvent
  | ExecutionCancelledEvent
  | ExecutionSupersededEvent
  | ExecutionExternalResultReceivedEvent;

export const EXECUTION_DOMAIN_EVENT_TYPES = [
  "test_execution.created",
  "test_execution.prepared",
  "test_execution.assigned",
  "test_execution.started",
  "test_execution.step_result_recorded",
  "test_execution.evidence_associated",
  "test_execution.observation_recorded",
  "test_execution.paused",
  "test_execution.blocked",
  "test_execution.resumed",
  "test_execution.completed",
  "test_execution.submitted_for_review",
  "test_execution.accepted",
  "test_execution.rejected",
  "test_execution.cancelled",
  "test_execution.superseded",
  "test_execution.external_result_received",
] as const;

type BuildEventInput = {
  readonly type: ExecutionEventType;
  readonly tenantId: TenantId;
  readonly executionId: string;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly revision?: number;
  readonly executionNumber?: string;
  readonly contentHash?: string;
  readonly executorId?: string;
  readonly stepOrder?: number;
  readonly outcome?: string;
  readonly evidenceId?: string;
  readonly observationId?: string;
  readonly reason?: string;
  readonly derivedOutcome?: string;
  readonly finalOutcome?: string;
  readonly successorExecutionId?: string;
  readonly submissionId?: string;
  readonly sourceSystemId?: string;
};

function buildEventId(input: BuildEventInput): string {
  return `${input.type}:${input.executionId}:${input.occurredAt}:${input.revision ?? 0}`;
}

function buildBase<T extends ExecutionEventType>(
  input: BuildEventInput & { readonly type: T },
): ExecutionEventBase & { readonly type: T } {
  return {
    eventId: buildEventId(input),
    type: input.type,
    occurredAt: input.occurredAt,
    tenantId: input.tenantId,
    executionId: input.executionId,
    actorId: input.actorId,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    ...(input.revision !== undefined ? { revision: input.revision } : {}),
  };
}

export function buildExecutionCreatedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly executionNumber: string },
): ExecutionCreatedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.created" }),
    executionNumber: input.executionNumber,
  };
}

export function buildExecutionPreparedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly contentHash: string },
): ExecutionPreparedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.prepared" }),
    contentHash: input.contentHash,
  };
}

export function buildExecutionAssignedEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionAssignedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.assigned" }),
    ...(input.executorId ? { executorId: input.executorId } : {}),
  };
}

export function buildExecutionStartedEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionStartedEvent {
  return { ...buildBase({ ...input, type: "test_execution.started" }) };
}

export function buildExecutionStepResultRecordedEvent(
  input: Omit<BuildEventInput, "type"> & {
    readonly stepOrder: number;
    readonly outcome: string;
  },
): ExecutionStepResultRecordedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.step_result_recorded" }),
    stepOrder: input.stepOrder,
    outcome: input.outcome,
  };
}

export function buildExecutionEvidenceAssociatedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly evidenceId: string },
): ExecutionEvidenceAssociatedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.evidence_associated" }),
    evidenceId: input.evidenceId,
  };
}

export function buildExecutionObservationRecordedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly observationId: string },
): ExecutionObservationRecordedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.observation_recorded" }),
    observationId: input.observationId,
  };
}

export function buildExecutionPausedEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionPausedEvent {
  return { ...buildBase({ ...input, type: "test_execution.paused" }) };
}

export function buildExecutionBlockedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly reason: string },
): ExecutionBlockedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.blocked" }),
    reason: input.reason,
  };
}

export function buildExecutionResumedEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionResumedEvent {
  return { ...buildBase({ ...input, type: "test_execution.resumed" }) };
}

export function buildExecutionCompletedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly derivedOutcome: string },
): ExecutionCompletedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.completed" }),
    derivedOutcome: input.derivedOutcome,
  };
}

export function buildExecutionSubmittedForReviewEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionSubmittedForReviewEvent {
  return { ...buildBase({ ...input, type: "test_execution.submitted_for_review" }) };
}

export function buildExecutionAcceptedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly finalOutcome: string },
): ExecutionAcceptedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.accepted" }),
    finalOutcome: input.finalOutcome,
  };
}

export function buildExecutionRejectedEvent(
  input: Omit<BuildEventInput, "type"> & { readonly reason: string },
): ExecutionRejectedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.rejected" }),
    reason: input.reason,
  };
}

export function buildExecutionCancelledEvent(
  input: Omit<BuildEventInput, "type">,
): ExecutionCancelledEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.cancelled" }),
    ...(input.reason ? { reason: input.reason } : {}),
  };
}

export function buildExecutionSupersededEvent(
  input: Omit<BuildEventInput, "type"> & { readonly successorExecutionId: string },
): ExecutionSupersededEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.superseded" }),
    successorExecutionId: input.successorExecutionId,
  };
}

export function buildExecutionExternalResultReceivedEvent(
  input: Omit<BuildEventInput, "type"> & {
    readonly submissionId: string;
    readonly sourceSystemId: string;
  },
): ExecutionExternalResultReceivedEvent {
  return {
    ...buildBase({ ...input, type: "test_execution.external_result_received" }),
    submissionId: input.submissionId,
    sourceSystemId: input.sourceSystemId,
  };
}
