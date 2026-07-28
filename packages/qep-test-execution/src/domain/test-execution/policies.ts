import {
  ExecutionConflictError,
  ExecutionPreconditionError,
  ExecutionValidationError,
} from "../../shared/errors";
import {
  CANCELLABLE_STATUSES,
  CONTENT_MUTABLE_STATUSES,
  DEFAULT_DOMAIN_POLICY,
  EXECUTION_REASON_MIN,
  STEP_MUTABLE_STATUSES,
  SUPERSEDE_ELIGIBLE_STATUSES,
  TERMINAL_STATUSES,
} from "./constants";
import type { ExecutionStep } from "./step";
import type { ExecutionReview } from "./review";
import type {
  ExecutionAssignment,
  ExecutionStatus,
  StepOutcome,
} from "./value-objects";

export type DomainPolicyConfig = {
  readonly reviewRequired: boolean;
  readonly fastPathAccept: boolean;
  readonly reviewerMustDifferFromExecutor: boolean;
};

export const DomainPolicyDefaults: DomainPolicyConfig = { ...DEFAULT_DOMAIN_POLICY };

export const ManifestSealPolicy = {
  assertResolvable(sourceRefsPresent: boolean): void {
    if (!sourceRefsPresent) {
      throw new ExecutionPreconditionError(
        "Source references must be resolvable to seal manifest",
      );
    }
  },
};

export const AssignmentPolicy = {
  assertValidExecutor(assignment: ExecutionAssignment): void {
    if (!assignment.executorId && !assignment.agentIdentity) {
      throw new ExecutionValidationError("Executor or agent identity is required");
    }
  },

  assertCanAssign(status: ExecutionStatus): void {
    if (status !== "ready" && status !== "assigned") {
      throw new ExecutionPreconditionError(
        "Executor assignment is only allowed in ready or assigned status",
      );
    }
  },

  assertCanReassignInProgress(status: ExecutionStatus, allowReassign: boolean): void {
    if (status === "in_progress" && !allowReassign) {
      throw new ExecutionPreconditionError(
        "Reassignment during in_progress requires explicit policy allowance",
      );
    }
  },
};

export const CompletionPolicy = {
  assertStepsAccounted(steps: readonly ExecutionStep[]): void {
    if (steps.length === 0) {
      throw new ExecutionPreconditionError(
        "Execution must have steps before completion",
      );
    }
    for (const step of steps) {
      if (step.outcome === undefined) {
        throw new ExecutionPreconditionError(
          `Step ${step.order} must have an outcome before completion`,
        );
      }
    }
  },

  assertPassedRequiresActual(step: ExecutionStep): void {
    if (step.outcome !== "passed") {
      return;
    }
    if (step.requireActualResult && !step.actualResult?.trim()) {
      throw new ExecutionPreconditionError(
        `Step ${step.order} requires actualResult when outcome is passed`,
      );
    }
  },

  assertAllPassedRules(steps: readonly ExecutionStep[]): void {
    for (const step of steps) {
      this.assertPassedRequiresActual(step);
    }
  },
};

export const ReviewPolicy = {
  assertReviewRequired(policy: DomainPolicyConfig, status: ExecutionStatus): void {
    if (!policy.reviewRequired) {
      throw new ExecutionPreconditionError("Review is not required for this execution");
    }
    if (status !== "completed") {
      throw new ExecutionPreconditionError(
        "Only completed executions can be submitted for review",
      );
    }
  },

  assertFastPathAllowed(policy: DomainPolicyConfig, status: ExecutionStatus): void {
    if (!policy.fastPathAccept) {
      throw new ExecutionPreconditionError(
        "Fast-path accept is not permitted by policy",
      );
    }
    if (status !== "completed") {
      throw new ExecutionPreconditionError(
        "Fast-path accept is only allowed from completed status",
      );
    }
  },

  assertCanAccept(status: ExecutionStatus, policy: DomainPolicyConfig): void {
    if (status === "submitted_for_review") {
      return;
    }
    if (status === "completed" && policy.fastPathAccept) {
      return;
    }
    throw new ExecutionPreconditionError(
      "Accept is only allowed from submitted_for_review or completed with fast-path policy",
    );
  },

  assertReviewerIndependence(
    policy: DomainPolicyConfig,
    reviewerId: string,
    executorId?: string,
  ): void {
    if (
      policy.reviewerMustDifferFromExecutor &&
      executorId &&
      reviewerId === executorId
    ) {
      throw new ExecutionPreconditionError("Reviewer must differ from executor");
    }
  },

  assertRejectReason(reason?: string): void {
    const trimmed = reason?.trim() ?? "";
    if (trimmed.length < EXECUTION_REASON_MIN) {
      throw new ExecutionValidationError(
        `Reject reason must be at least ${EXECUTION_REASON_MIN} characters`,
      );
    }
  },
};

export const CancellationPolicy = {
  assertCanCancel(status: ExecutionStatus): void {
    if (status === "accepted" || status === "superseded") {
      throw new ExecutionPreconditionError(
        `Execution in ${status} status cannot be cancelled`,
      );
    }
    if (
      !CANCELLABLE_STATUSES.includes(status as (typeof CANCELLABLE_STATUSES)[number])
    ) {
      throw new ExecutionPreconditionError(
        `Execution in ${status} status cannot be cancelled`,
      );
    }
  },
};

export const SupersessionPolicy = {
  assertEligible(status: ExecutionStatus): void {
    if (
      !SUPERSEDE_ELIGIBLE_STATUSES.includes(
        status as (typeof SUPERSEDE_ELIGIBLE_STATUSES)[number],
      )
    ) {
      throw new ExecutionPreconditionError(
        `Execution in ${status} status cannot be superseded`,
      );
    }
  },

  assertSuccessorProvided(successorExecutionId?: string): void {
    if (!successorExecutionId?.trim()) {
      throw new ExecutionValidationError(
        "successorExecutionId is required for supersession",
      );
    }
  },

  assertNotAlreadySuperseded(supersededById?: string): void {
    if (supersededById) {
      throw new ExecutionConflictError("Execution already has a successor");
    }
  },
};

export const IngestionPolicy = {
  assertNotFinal(status: ExecutionStatus): void {
    if (status === "accepted" || status === "cancelled") {
      throw new ExecutionPreconditionError(
        `External ingestion is forbidden when execution is ${status}`,
      );
    }
  },

  assertImportedMode(mode: string): void {
    if (mode !== "imported") {
      throw new ExecutionPreconditionError(
        "External ingestion requires imported execution mode",
      );
    }
  },
};

export const OutcomeDerivationPolicy = {
  precedence: [
    "failed",
    "blocked",
    "inconclusive",
    "cancelled",
  ] as const satisfies readonly StepOutcome[],
};

export const LifecyclePolicy = {
  assertStatus(
    current: ExecutionStatus,
    expected: ExecutionStatus,
    command: string,
  ): void {
    if (current !== expected) {
      throw new ExecutionPreconditionError(
        `${command} requires status ${expected}, found ${current}`,
      );
    }
  },

  assertOneOf(
    current: ExecutionStatus,
    allowed: readonly ExecutionStatus[],
    command: string,
  ): void {
    if (!allowed.includes(current)) {
      throw new ExecutionPreconditionError(
        `${command} is not allowed in ${current} status`,
      );
    }
  },

  assertNotTerminal(status: ExecutionStatus): void {
    if (TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number])) {
      throw new ExecutionPreconditionError(
        `Execution in terminal status ${status} cannot be mutated`,
      );
    }
  },

  assertContentMutable(status: ExecutionStatus): void {
    if (
      !CONTENT_MUTABLE_STATUSES.includes(
        status as (typeof CONTENT_MUTABLE_STATUSES)[number],
      )
    ) {
      throw new ExecutionPreconditionError(
        `Execution content is immutable in ${status} status`,
      );
    }
  },

  assertStepMutable(status: ExecutionStatus): void {
    if (
      !STEP_MUTABLE_STATUSES.includes(status as (typeof STEP_MUTABLE_STATUSES)[number])
    ) {
      throw new ExecutionPreconditionError(
        "Step results can only be recorded while in_progress",
      );
    }
  },

  assertCanCompleteFrom(status: ExecutionStatus): void {
    if (status !== "in_progress") {
      throw new ExecutionPreconditionError(
        "Only in_progress executions can be completed",
      );
    }
  },

  assertCannotCompleteWhenCancelled(status: ExecutionStatus): void {
    if (status === "cancelled") {
      throw new ExecutionPreconditionError("Cancelled executions cannot be completed");
    }
  },
};

export const ReviewRetentionPolicy = {
  retainPreReviewOutcome(review: ExecutionReview): ExecutionReview {
    return {
      ...review,
      preReviewDerivedOutcome: review.preReviewDerivedOutcome,
    };
  },
};
