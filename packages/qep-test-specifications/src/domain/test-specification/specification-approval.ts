import { TestSpecificationInvariantViolation } from "../../shared/errors";
import {
  createSpecificationOwner,
  createSpecificationReviewer,
  createSpecificationTimestamp,
  type SpecificationOwner,
  type SpecificationReviewer,
  type SpecificationTimestamp,
} from "./value-objects";

export type SpecificationApprovalDecision = "approved" | "rejected";

/**
 * Governance record for a review/approval decision on a Specification version.
 */
export type SpecificationApproval = {
  readonly decision: SpecificationApprovalDecision;
  readonly decidedAt: SpecificationTimestamp;
  readonly decidedBy: SpecificationOwner | SpecificationReviewer;
  readonly reviewComment?: string;
  readonly approvalComment?: string;
};

export function createSpecificationApproval(input: {
  readonly decision: string;
  readonly decidedAt: string;
  readonly decidedBy: string;
  readonly reviewComment?: string;
  readonly approvalComment?: string;
}): SpecificationApproval {
  const decision = input.decision.trim().toLowerCase();
  if (decision !== "approved" && decision !== "rejected") {
    throw new TestSpecificationInvariantViolation(
      `Unknown Specification approval decision: ${input.decision}`,
    );
  }
  const decidedBy = createSpecificationOwner(input.decidedBy);
  const reviewComment = input.reviewComment?.trim();
  const approvalComment = input.approvalComment?.trim();
  if (decision === "rejected" && !reviewComment && !approvalComment) {
    throw new TestSpecificationInvariantViolation(
      "Specification rejection requires a review or approval comment",
    );
  }
  return {
    decision,
    decidedAt: createSpecificationTimestamp(input.decidedAt),
    decidedBy,
    ...(reviewComment ? { reviewComment } : {}),
    ...(approvalComment ? { approvalComment } : {}),
  };
}

export function createReviewerAssignment(reviewerId: string): SpecificationReviewer {
  return createSpecificationReviewer(reviewerId);
}
