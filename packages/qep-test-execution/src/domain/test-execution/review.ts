import { ExecutionValidationError } from "../../shared/errors";
import { EXECUTION_REASON_MIN, REVIEW_DECISIONS } from "./constants";
import type { ExecutionOutcome } from "./value-objects";
import { createActorId, createExecutionOutcome } from "./value-objects";

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export type ExecutionReview = {
  readonly reviewerId: string;
  readonly decision: ReviewDecision;
  readonly reason?: string;
  readonly decidedAt: string;
  readonly preReviewDerivedOutcome: ExecutionOutcome;
  readonly outcomeOverride?: ExecutionOutcome;
};

export function createExecutionReview(input: {
  readonly reviewerId: string;
  readonly decision: ReviewDecision;
  readonly reason?: string;
  readonly decidedAt: string;
  readonly preReviewDerivedOutcome: string;
  readonly outcomeOverride?: string;
}): ExecutionReview {
  const decision = input.decision;
  if (!REVIEW_DECISIONS.includes(decision)) {
    throw new ExecutionValidationError(`Invalid review decision: ${input.decision}`);
  }
  if (decision === "rejected") {
    const reason = input.reason?.trim() ?? "";
    if (reason.length < EXECUTION_REASON_MIN) {
      throw new ExecutionValidationError(
        `Reject reason must be at least ${EXECUTION_REASON_MIN} characters`,
      );
    }
  }
  return {
    reviewerId: createActorId(input.reviewerId),
    decision,
    ...(input.reason?.trim() ? { reason: input.reason.trim() } : {}),
    decidedAt: input.decidedAt.trim(),
    preReviewDerivedOutcome: createExecutionOutcome(input.preReviewDerivedOutcome),
    ...(input.outcomeOverride
      ? { outcomeOverride: createExecutionOutcome(input.outcomeOverride) }
      : {}),
  };
}

export function finaliseOutcome(
  review: ExecutionReview | null,
  derived: ExecutionOutcome,
): ExecutionOutcome {
  if (review?.decision === "accepted" && review.outcomeOverride) {
    return review.outcomeOverride;
  }
  if (review?.decision === "accepted") {
    return derived;
  }
  return derived;
}
