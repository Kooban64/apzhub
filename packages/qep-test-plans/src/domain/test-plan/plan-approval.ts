import { PlanValidationError } from "../../shared/errors";
import { REJECT_COMMENT_MIN_LENGTH } from "./constants";
import type { PlanStatus } from "./value-objects";
import { createActorId } from "./value-objects";

export type TestPlanApproval = {
  readonly id: string;
  readonly decision: "approved" | "rejected";
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly comment?: string;
  readonly fromStatus: PlanStatus;
  readonly toStatus: PlanStatus;
};

export type CreateTestPlanApprovalInput = {
  readonly id: string;
  readonly decision: "approved" | "rejected";
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly comment?: string;
  readonly fromStatus: PlanStatus;
  readonly toStatus: PlanStatus;
};

export function createTestPlanApproval(input: CreateTestPlanApprovalInput): TestPlanApproval {
  const decidedBy = createActorId(input.decidedBy);
  const comment = input.comment?.trim();
  if (input.decision === "rejected") {
    if (!comment || comment.length < REJECT_COMMENT_MIN_LENGTH) {
      throw new PlanValidationError(
        `Reject comment must be at least ${REJECT_COMMENT_MIN_LENGTH} characters`,
      );
    }
  }
  return {
    id: input.id.trim(),
    decision: input.decision,
    decidedBy,
    decidedAt: input.decidedAt.trim(),
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    ...(comment ? { comment } : {}),
  };
}
