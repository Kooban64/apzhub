import {
  ExecutionConcurrencyError,
  ExecutionPreconditionError,
} from "../../shared/errors";
import {
  assertManifestNotSealed,
  assertManifestSealed,
  type ResolvedManifestInput,
} from "./manifest";
import { createExecutionObservation, type ExecutionObservation } from "./observation";
import { createExternalExecutionSubmission } from "./external-submission";
import {
  buildExecutionAcceptedEvent,
  buildExecutionAssignedEvent,
  buildExecutionBlockedEvent,
  buildExecutionCancelledEvent,
  buildExecutionCompletedEvent,
  buildExecutionCreatedEvent,
  buildExecutionEvidenceAssociatedEvent,
  buildExecutionExternalResultReceivedEvent,
  buildExecutionObservationRecordedEvent,
  buildExecutionPausedEvent,
  buildExecutionPreparedEvent,
  buildExecutionRejectedEvent,
  buildExecutionResumedEvent,
  buildExecutionStartedEvent,
  buildExecutionStepResultRecordedEvent,
  buildExecutionSubmittedForReviewEvent,
  buildExecutionSupersededEvent,
  type ExecutionDomainEvent,
} from "./events";
import { createEmptyExecutionHistory, appendExecutionHistory } from "./history";
import { ManifestSealer, IngestionCorrelator, OutcomeDeriver } from "./domain-services";
import {
  AssignmentPolicy,
  CancellationPolicy,
  CompletionPolicy,
  DomainPolicyDefaults,
  IngestionPolicy,
  LifecyclePolicy,
  ManifestSealPolicy,
  ReviewPolicy,
  SupersessionPolicy,
  type DomainPolicyConfig,
} from "./policies";
import { createExecutionReview, finaliseOutcome } from "./review";
import {
  applyStepResult,
  createExecutionStepsFromManifest,
  findExecutionStep,
  updateSteps,
  type RecordStepResultInput,
} from "./step";
import {
  createActorId,
  createEvidenceReference,
  createExecutionAssignment,
  createExecutionContext,
  createExecutionMode,
  createExecutionNumber,
  createExecutionSourceRefs,
  createPlatformId,
  createTenantId,
  type EvidenceReference,
  type ExecutionAssignment,
  type ExecutionContext,
  type ExecutionMode,
  type ExecutionOutcome,
  type ExecutionSourceRefs,
  type ExecutionStatus,
} from "./value-objects";
import type { ExecutionManifest } from "./manifest";
import type { ExternalExecutionSubmission } from "./external-submission";
import type { ExecutionReview } from "./review";
import type { ExecutionStep } from "./step";
import type { ExecutionHistory } from "./history";

export type TestExecution = {
  readonly id: string;
  readonly executionNumber: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly status: ExecutionStatus;
  readonly mode: ExecutionMode;
  readonly sourceRefs: ExecutionSourceRefs;
  readonly manifest: ExecutionManifest | null;
  readonly context: ExecutionContext;
  readonly assignment: ExecutionAssignment;
  readonly steps: readonly ExecutionStep[];
  readonly outcome: ExecutionOutcome | null;
  readonly preReviewDerivedOutcome: ExecutionOutcome | null;
  readonly blockReason?: string;
  readonly cancelReason?: string;
  readonly observations: readonly ExecutionObservation[];
  readonly evidenceReferences: readonly EvidenceReference[];
  readonly review: ExecutionReview | null;
  readonly externalSubmissions: readonly ExternalExecutionSubmission[];
  readonly revision: number;
  readonly history: ExecutionHistory;
  readonly supersedesId?: string;
  readonly supersededById?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly uncommittedEvents: readonly ExecutionDomainEvent[];
};

export type CommandContext = {
  readonly actorId: string;
  readonly changedAt: string;
  readonly expectedRevision?: number;
  readonly correlationId?: string;
};

export type CreateExecutionInput = {
  readonly id: string;
  readonly executionNumber: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly mode?: string;
  readonly sourceRefs: ExecutionSourceRefs;
  readonly ownerId: string;
  readonly context?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId?: string;
  readonly supersedesId?: string;
};

function eventBase(execution: TestExecution, ctx: CommandContext) {
  return {
    tenantId: execution.tenantId,
    executionId: execution.id,
    actorId: ctx.actorId,
    occurredAt: ctx.changedAt,
    revision: execution.revision + 1,
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  };
}

function assertRevision(execution: TestExecution, expectedRevision?: number): void {
  if (expectedRevision !== undefined && execution.revision !== expectedRevision) {
    throw new ExecutionConcurrencyError(
      execution.id,
      expectedRevision,
      execution.revision,
    );
  }
}

function beginCommand(execution: TestExecution, ctx: CommandContext): TestExecution {
  assertRevision(execution, ctx.expectedRevision);
  createActorId(ctx.actorId);
  return { ...execution, uncommittedEvents: [] };
}

function withMutation(
  execution: TestExecution,
  ctx: CommandContext,
  patch: Partial<TestExecution>,
  action: string,
  summary: string,
  events: readonly ExecutionDomainEvent[],
  statusChange?: { from: ExecutionStatus; to: ExecutionStatus },
): TestExecution {
  const nextRevision = execution.revision + 1;
  const history = appendExecutionHistory(execution.history, {
    at: ctx.changedAt,
    actorId: ctx.actorId,
    action,
    summary,
    ...(statusChange
      ? { fromStatus: statusChange.from, toStatus: statusChange.to }
      : {}),
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  });
  return {
    ...execution,
    ...patch,
    revision: nextRevision,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
    history,
    uncommittedEvents: [...execution.uncommittedEvents, ...events],
  };
}

export function createExecution(input: CreateExecutionInput): TestExecution {
  const tenantId = createTenantId(input.tenantId);
  const createdBy = createActorId(input.createdBy);
  const sourceRefs = createExecutionSourceRefs(input.sourceRefs);
  const mode = createExecutionMode(input.mode ?? "manual");
  const executionNumber = createExecutionNumber(input.executionNumber);
  const createdAt = input.createdAt.trim();
  const assignment = createExecutionAssignment({
    ownerId: input.ownerId,
    updatedAt: createdAt,
    updatedBy: createdBy,
  });
  const history = appendExecutionHistory(createEmptyExecutionHistory(), {
    at: createdAt,
    actorId: createdBy,
    action: "createExecution",
    summary: `Test execution ${executionNumber} created as draft`,
    toStatus: "draft",
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
  const createdEvent = buildExecutionCreatedEvent({
    tenantId,
    executionId: input.id.trim(),
    actorId: createdBy,
    occurredAt: createdAt,
    executionNumber,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  });
  return {
    id: input.id.trim(),
    executionNumber,
    tenantId,
    projectId: createPlatformId(input.projectId, "projectId"),
    workspaceId: createPlatformId(input.workspaceId, "workspaceId"),
    status: "draft",
    mode,
    sourceRefs,
    manifest: null,
    context: createExecutionContext(input.context),
    assignment,
    steps: [],
    outcome: null,
    preReviewDerivedOutcome: null,
    observations: [],
    evidenceReferences: [],
    review: null,
    externalSubmissions: [],
    revision: 1,
    history,
    ...(input.supersedesId?.trim() ? { supersedesId: input.supersedesId.trim() } : {}),
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    uncommittedEvents: [createdEvent],
  };
}

export function prepareExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input: { readonly resolved: ResolvedManifestInput },
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStatus(current.status, "draft", "prepareExecution");
  assertManifestNotSealed(current.manifest);
  ManifestSealPolicy.assertResolvable(
    Boolean(current.sourceRefs.planRef || current.sourceRefs.specRef),
  );
  const { manifest, contentHash } = ManifestSealer.seal({
    resolved: input.resolved,
    sourceRefs: current.sourceRefs,
    sealedAt: ctx.changedAt,
    sealedBy: ctx.actorId,
  });
  const steps = createExecutionStepsFromManifest(manifest.steps);
  return withMutation(
    current,
    ctx,
    {
      status: "ready",
      manifest,
      steps,
    },
    "prepareExecution",
    "Execution manifest sealed and execution marked ready",
    [
      buildExecutionPreparedEvent({
        ...eventBase(current, ctx),
        contentHash,
      }),
    ],
    { from: "draft", to: "ready" },
  );
}

export function assignExecutor(
  execution: TestExecution,
  ctx: CommandContext,
  input: {
    readonly executorId?: string;
    readonly reviewerId?: string;
    readonly agentIdentity?: string;
    readonly allowReassignInProgress?: boolean;
  },
): TestExecution {
  const current = beginCommand(execution, ctx);
  AssignmentPolicy.assertCanAssign(current.status);
  AssignmentPolicy.assertCanReassignInProgress(
    current.status,
    input.allowReassignInProgress ?? false,
  );
  const assignment = createExecutionAssignment({
    ownerId: current.assignment.ownerId,
    executorId: input.executorId ?? current.assignment.executorId,
    reviewerId: input.reviewerId ?? current.assignment.reviewerId,
    agentIdentity: input.agentIdentity ?? current.assignment.agentIdentity,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
  });
  AssignmentPolicy.assertValidExecutor(assignment);
  const nextStatus: ExecutionStatus =
    current.status === "ready" ? "assigned" : current.status;
  return withMutation(
    current,
    ctx,
    {
      assignment,
      status: nextStatus,
    },
    "assignExecutor",
    "Executor assignment updated",
    [
      buildExecutionAssignedEvent({
        ...eventBase(current, ctx),
        ...(assignment.executorId ? { executorId: assignment.executorId } : {}),
      }),
    ],
    current.status === "ready" ? { from: "ready", to: "assigned" } : undefined,
  );
}

export function startExecution(
  execution: TestExecution,
  ctx: CommandContext,
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStatus(current.status, "assigned", "startExecution");
  assertManifestSealed(current.manifest);
  if (current.steps.length === 0) {
    throw new ExecutionPreconditionError(
      "Execution must have sealed steps before start",
    );
  }
  return withMutation(
    current,
    ctx,
    { status: "in_progress" },
    "startExecution",
    "Execution started",
    [buildExecutionStartedEvent(eventBase(current, ctx))],
    { from: "assigned", to: "in_progress" },
  );
}

export function recordStepResult(
  execution: TestExecution,
  ctx: CommandContext,
  input: RecordStepResultInput,
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStepMutable(current.status);
  findExecutionStep(current.steps, input.order);
  const steps = updateSteps(current.steps, input.order, (step) =>
    applyStepResult(step, input, ctx.changedAt),
  );
  const updatedStep = findExecutionStep(steps, input.order);
  CompletionPolicy.assertPassedRequiresActual(updatedStep);
  return withMutation(
    current,
    ctx,
    { steps },
    "recordStepResult",
    `Step ${input.order} result recorded`,
    [
      buildExecutionStepResultRecordedEvent({
        ...eventBase(current, ctx),
        stepOrder: input.order,
        outcome: input.outcome,
      }),
    ],
  );
}

export function associateEvidence(
  execution: TestExecution,
  ctx: CommandContext,
  input: {
    readonly id: string;
    readonly uri: string;
    readonly integrityHash?: string;
    readonly stepOrder?: number;
  },
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertContentMutable(current.status);
  const evidence = createEvidenceReference({
    id: input.id,
    uri: input.uri,
    integrityHash: input.integrityHash,
    associatedAt: ctx.changedAt,
    associatedBy: ctx.actorId,
    stepOrder: input.stepOrder,
  });
  if (input.stepOrder !== undefined) {
    findExecutionStep(current.steps, input.stepOrder);
  }
  const evidenceReferences = [...current.evidenceReferences, evidence];
  let steps = current.steps;
  if (input.stepOrder !== undefined) {
    steps = updateSteps(current.steps, input.stepOrder, (step) => ({
      ...step,
      evidenceIds: [...step.evidenceIds, evidence.id],
    }));
  }
  return withMutation(
    current,
    ctx,
    { evidenceReferences, steps },
    "associateEvidence",
    `Evidence ${evidence.id} associated`,
    [
      buildExecutionEvidenceAssociatedEvent({
        ...eventBase(current, ctx),
        evidenceId: evidence.id,
      }),
    ],
  );
}

export function recordObservation(
  execution: TestExecution,
  ctx: CommandContext,
  input: {
    readonly id: string;
    readonly body: string;
    readonly severityHint?: "info" | "warning" | "critical";
    readonly structured?: Readonly<Record<string, string>>;
  },
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertNotTerminal(current.status);
  LifecyclePolicy.assertContentMutable(current.status);
  const observation = createExecutionObservation({
    id: input.id,
    body: input.body,
    actorId: ctx.actorId,
    recordedAt: ctx.changedAt,
    severityHint: input.severityHint,
    structured: input.structured,
  });
  return withMutation(
    current,
    ctx,
    { observations: [...current.observations, observation] },
    "recordObservation",
    `Observation ${observation.id} recorded`,
    [
      buildExecutionObservationRecordedEvent({
        ...eventBase(current, ctx),
        observationId: observation.id,
      }),
    ],
  );
}

export function pauseExecution(
  execution: TestExecution,
  ctx: CommandContext,
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStatus(current.status, "in_progress", "pauseExecution");
  return withMutation(
    current,
    ctx,
    { status: "paused" },
    "pauseExecution",
    "Execution paused",
    [buildExecutionPausedEvent(eventBase(current, ctx))],
    { from: "in_progress", to: "paused" },
  );
}

export function blockExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input: { readonly reason: string },
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStatus(current.status, "in_progress", "blockExecution");
  ReviewPolicy.assertRejectReason(input.reason);
  return withMutation(
    current,
    ctx,
    { status: "blocked", blockReason: input.reason.trim() },
    "blockExecution",
    "Execution blocked",
    [
      buildExecutionBlockedEvent({
        ...eventBase(current, ctx),
        reason: input.reason.trim(),
      }),
    ],
    { from: "in_progress", to: "blocked" },
  );
}

export function resumeExecution(
  execution: TestExecution,
  ctx: CommandContext,
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertOneOf(current.status, ["paused", "blocked"], "resumeExecution");
  const fromStatus = current.status;
  return withMutation(
    current,
    ctx,
    { status: "in_progress", blockReason: undefined },
    "resumeExecution",
    "Execution resumed",
    [buildExecutionResumedEvent(eventBase(current, ctx))],
    { from: fromStatus, to: "in_progress" },
  );
}

export function completeExecution(
  execution: TestExecution,
  ctx: CommandContext,
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertCanCompleteFrom(current.status);
  LifecyclePolicy.assertCannotCompleteWhenCancelled(current.status);
  CompletionPolicy.assertStepsAccounted(current.steps);
  CompletionPolicy.assertAllPassedRules(current.steps);
  const derivedOutcome = OutcomeDeriver.deriveFromSteps(current.steps);
  return withMutation(
    current,
    ctx,
    {
      status: "completed",
      outcome: derivedOutcome,
      preReviewDerivedOutcome: derivedOutcome,
    },
    "completeExecution",
    `Execution completed with derived outcome ${derivedOutcome}`,
    [
      buildExecutionCompletedEvent({
        ...eventBase(current, ctx),
        derivedOutcome,
      }),
    ],
    { from: "in_progress", to: "completed" },
  );
}

export function submitForReview(
  execution: TestExecution,
  ctx: CommandContext,
  policy: DomainPolicyConfig = DomainPolicyDefaults,
): TestExecution {
  const current = beginCommand(execution, ctx);
  ReviewPolicy.assertReviewRequired(policy, current.status);
  if (current.outcome === null) {
    throw new ExecutionPreconditionError(
      "Completed execution must have a derived outcome",
    );
  }
  return withMutation(
    current,
    ctx,
    { status: "submitted_for_review" },
    "submitForReview",
    "Execution submitted for review",
    [buildExecutionSubmittedForReviewEvent(eventBase(current, ctx))],
    { from: "completed", to: "submitted_for_review" },
  );
}

export function acceptExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input?: {
    readonly outcomeOverride?: string;
    readonly policy?: DomainPolicyConfig;
  },
): TestExecution {
  const current = beginCommand(execution, ctx);
  const policy = input?.policy ?? DomainPolicyDefaults;
  ReviewPolicy.assertCanAccept(current.status, policy);
  const derived = current.preReviewDerivedOutcome ?? current.outcome;
  if (!derived) {
    throw new ExecutionPreconditionError(
      "Cannot accept execution without derived outcome",
    );
  }
  ReviewPolicy.assertReviewerIndependence(
    policy,
    ctx.actorId,
    current.assignment.executorId,
  );
  const review = createExecutionReview({
    reviewerId: ctx.actorId,
    decision: "accepted",
    decidedAt: ctx.changedAt,
    preReviewDerivedOutcome: derived,
    outcomeOverride: input?.outcomeOverride,
  });
  const finalOutcome = finaliseOutcome(review, derived);
  return withMutation(
    current,
    ctx,
    {
      status: "accepted",
      review,
      outcome: finalOutcome,
    },
    "acceptExecution",
    "Execution accepted",
    [
      buildExecutionAcceptedEvent({
        ...eventBase(current, ctx),
        finalOutcome,
      }),
    ],
    { from: current.status, to: "accepted" },
  );
}

export function rejectExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input: { readonly reason: string },
): TestExecution {
  const current = beginCommand(execution, ctx);
  LifecyclePolicy.assertStatus(
    current.status,
    "submitted_for_review",
    "rejectExecution",
  );
  ReviewPolicy.assertRejectReason(input.reason);
  const derived = current.preReviewDerivedOutcome ?? current.outcome;
  if (!derived) {
    throw new ExecutionPreconditionError(
      "Cannot reject execution without derived outcome",
    );
  }
  const review = createExecutionReview({
    reviewerId: ctx.actorId,
    decision: "rejected",
    reason: input.reason,
    decidedAt: ctx.changedAt,
    preReviewDerivedOutcome: derived,
  });
  return withMutation(
    current,
    ctx,
    {
      status: "rejected",
      review,
      preReviewDerivedOutcome: derived,
      outcome: derived,
    },
    "rejectExecution",
    "Execution rejected",
    [
      buildExecutionRejectedEvent({
        ...eventBase(current, ctx),
        reason: input.reason.trim(),
      }),
    ],
    { from: "submitted_for_review", to: "rejected" },
  );
}

export function cancelExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input?: { readonly reason?: string },
): TestExecution {
  const current = beginCommand(execution, ctx);
  CancellationPolicy.assertCanCancel(current.status);
  return withMutation(
    current,
    ctx,
    {
      status: "cancelled",
      ...(input?.reason?.trim() ? { cancelReason: input.reason.trim() } : {}),
    },
    "cancelExecution",
    "Execution cancelled",
    [
      buildExecutionCancelledEvent({
        ...eventBase(current, ctx),
        ...(input?.reason ? { reason: input.reason.trim() } : {}),
      }),
    ],
    { from: current.status, to: "cancelled" },
  );
}

export function supersedeExecution(
  execution: TestExecution,
  ctx: CommandContext,
  input: { readonly successorExecutionId: string },
): TestExecution {
  const current = beginCommand(execution, ctx);
  SupersessionPolicy.assertNotAlreadySuperseded(current.supersededById);
  SupersessionPolicy.assertEligible(current.status);
  SupersessionPolicy.assertSuccessorProvided(input.successorExecutionId);
  return withMutation(
    current,
    ctx,
    {
      status: "superseded",
      supersededById: input.successorExecutionId.trim(),
    },
    "supersedeExecution",
    `Execution superseded by ${input.successorExecutionId.trim()}`,
    [
      buildExecutionSupersededEvent({
        ...eventBase(current, ctx),
        successorExecutionId: input.successorExecutionId.trim(),
      }),
    ],
    { from: current.status, to: "superseded" },
  );
}

export type IngestExternalResultInput = {
  readonly submissionId: string;
  readonly sourceSystemId: string;
  readonly agentIdentity: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly signatureMetadata?: string;
  readonly isComplete: boolean;
  readonly stepResults?: readonly RecordStepResultInput[];
  readonly createInput?: CreateExecutionInput;
  readonly resolved?: ResolvedManifestInput;
};

export function ingestExternalResult(
  execution: TestExecution | null,
  ctx: CommandContext,
  input: IngestExternalResultInput,
): TestExecution {
  createActorId(ctx.actorId);

  if (execution === null) {
    if (!input.createInput) {
      throw new ExecutionPreconditionError(
        "createInput is required when ingesting into a new execution",
      );
    }
    const created = createExecution({
      ...input.createInput,
      mode: "imported",
    });
    return ingestExternalResult(created, ctx, { ...input, createInput: undefined });
  }

  const current = beginCommand(execution, ctx);
  IngestionPolicy.assertNotFinal(current.status);
  IngestionPolicy.assertImportedMode(current.mode);

  const replay = IngestionCorrelator.isReplay(
    current.externalSubmissions,
    input.sourceSystemId,
    input.idempotencyKey,
  );
  if (replay) {
    return current;
  }

  IngestionCorrelator.assertUnique({
    tenantId: current.tenantId,
    sourceSystemId: input.sourceSystemId,
    idempotencyKey: input.idempotencyKey,
    existingSubmissions: current.externalSubmissions,
  });

  const submission = createExternalExecutionSubmission({
    id: input.submissionId,
    sourceSystemId: input.sourceSystemId,
    agentIdentity: input.agentIdentity,
    idempotencyKey: input.idempotencyKey,
    payloadHash: input.payloadHash,
    signatureMetadata: input.signatureMetadata,
    isComplete: input.isComplete,
    correlationId: ctx.correlationId,
    receivedAt: ctx.changedAt,
    receivedBy: ctx.actorId,
  });

  let patch: Partial<TestExecution> = {
    externalSubmissions: [...current.externalSubmissions, submission],
    assignment: createExecutionAssignment({
      ...current.assignment,
      agentIdentity: input.agentIdentity,
      updatedAt: ctx.changedAt,
      updatedBy: ctx.actorId,
    }),
  };

  if (current.status === "draft" && input.resolved) {
    assertManifestNotSealed(current.manifest);
    const { manifest } = ManifestSealer.seal({
      resolved: input.resolved,
      sourceRefs: current.sourceRefs,
      sealedAt: ctx.changedAt,
      sealedBy: ctx.actorId,
    });
    patch = {
      ...patch,
      status: "ready",
      manifest,
      steps: createExecutionStepsFromManifest(manifest.steps),
    };
  }

  if (input.stepResults && input.stepResults.length > 0) {
    const effectiveStatus = patch.status ?? current.status;
    if (effectiveStatus !== "in_progress" && effectiveStatus !== "ready") {
      throw new ExecutionPreconditionError(
        "Step results can only be ingested when execution is in_progress or ready",
      );
    }
    const baseSteps = patch.steps ?? current.steps;
    let steps = baseSteps;
    for (const stepResult of input.stepResults) {
      findExecutionStep(steps, stepResult.order);
      steps = updateSteps(steps, stepResult.order, (step) =>
        applyStepResult(step, stepResult, ctx.changedAt),
      );
      CompletionPolicy.assertPassedRequiresActual(
        findExecutionStep(steps, stepResult.order),
      );
    }
    patch = { ...patch, steps, status: "in_progress" };
  }

  if (input.isComplete) {
    const steps = patch.steps ?? current.steps;
    CompletionPolicy.assertStepsAccounted(steps);
    CompletionPolicy.assertAllPassedRules(steps);
    const derivedOutcome = OutcomeDeriver.deriveFromSteps(steps);
    patch = {
      ...patch,
      status: "completed",
      steps,
      outcome: derivedOutcome,
      preReviewDerivedOutcome: derivedOutcome,
    };
  }

  return withMutation(
    current,
    ctx,
    patch,
    "ingestExternalResult",
    `External result ingested from ${input.sourceSystemId}`,
    [
      buildExecutionExternalResultReceivedEvent({
        ...eventBase(current, ctx),
        submissionId: submission.id,
        sourceSystemId: submission.sourceSystemId,
      }),
    ],
  );
}

export { DomainPolicyDefaults, type DomainPolicyConfig };
