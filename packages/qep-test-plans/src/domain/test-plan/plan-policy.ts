import {
  InvalidPlanStateError,
  PlanInvariantViolationError,
  PlanValidationError,
} from "../../shared/errors";
import {
  ASSIGNMENT_EDITABLE_STATUSES,
  CONTENT_EDITABLE_STATUSES,
  REJECT_COMMENT_MIN_LENGTH,
  SCHEDULE_EDITABLE_STATUSES,
  SUPERSEDE_ELIGIBLE_STATUSES,
  TERMINAL_STATUSES,
} from "./constants";
import type { TestPlanApproval } from "./plan-approval";
import type { TestPlanSchedule } from "./plan-schedule";
import { isActiveItem, itemSpecPinKey, type TestPlanItem } from "./plan-item";
import type { PlanScope, PlanStatus } from "./value-objects";
import { isScopeValid } from "./value-objects";

export type ApprovalPolicyInput = {
  readonly status: PlanStatus;
  readonly ownerId: string;
  readonly actorId: string;
  readonly allowSelfApproval?: boolean;
  readonly decision: "approved" | "rejected";
  readonly comment?: string;
};

export const ApprovalPolicy = {
  assertCanDecide(input: ApprovalPolicyInput): void {
    if (input.status !== "review") {
      throw new InvalidPlanStateError(
        "Approval decisions are only allowed in review status",
      );
    }
    if (
      input.decision === "approved" &&
      input.actorId === input.ownerId &&
      !input.allowSelfApproval
    ) {
      throw new PlanInvariantViolationError("Self-approval is not permitted");
    }
    if (input.decision === "rejected") {
      const comment = input.comment?.trim() ?? "";
      if (comment.length < REJECT_COMMENT_MIN_LENGTH) {
        throw new PlanValidationError(
          `Reject comment must be at least ${REJECT_COMMENT_MIN_LENGTH} characters`,
        );
      }
    }
  },
};

export const SchedulingPolicy = {
  assertEditable(status: PlanStatus): void {
    if (
      !SCHEDULE_EDITABLE_STATUSES.includes(
        status as (typeof SCHEDULE_EDITABLE_STATUSES)[number],
      )
    ) {
      throw new InvalidPlanStateError(`Schedule cannot be edited in ${status} status`);
    }
  },

  assertValidSchedule(schedule: TestPlanSchedule): void {
    if (
      schedule.plannedStart &&
      schedule.plannedEnd &&
      schedule.plannedEnd < schedule.plannedStart
    ) {
      throw new PlanValidationError(
        "plannedEnd must be greater than or equal to plannedStart",
      );
    }
  },
};

export const AssignmentPolicy = {
  assertEditable(status: PlanStatus): void {
    if (
      !ASSIGNMENT_EDITABLE_STATUSES.includes(
        status as (typeof ASSIGNMENT_EDITABLE_STATUSES)[number],
      )
    ) {
      throw new InvalidPlanStateError(
        `Assignment cannot be edited in ${status} status`,
      );
    }
  },

  assertOwnerPresent(ownerId: string): void {
    if (!ownerId.trim()) {
      throw new PlanInvariantViolationError("ownerId is required");
    }
  },
};

export const ContentPolicy = {
  assertEditable(status: PlanStatus): void {
    if (
      !CONTENT_EDITABLE_STATUSES.includes(
        status as (typeof CONTENT_EDITABLE_STATUSES)[number],
      )
    ) {
      throw new InvalidPlanStateError(
        `Plan content cannot be edited in ${status} status`,
      );
    }
  },
};

export const ArchivalPolicy = {
  assertCanArchive(status: PlanStatus): void {
    if (status !== "completed") {
      throw new InvalidPlanStateError("Only completed plans can be archived");
    }
  },
};

export const LifecyclePolicy = {
  assertNotTerminal(status: PlanStatus): void {
    if (TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number])) {
      throw new InvalidPlanStateError(
        `Plan in terminal status ${status} cannot be mutated`,
      );
    }
  },

  assertCanTransferOwnership(status: PlanStatus): void {
    if (
      !CONTENT_EDITABLE_STATUSES.includes(
        status as (typeof CONTENT_EDITABLE_STATUSES)[number],
      )
    ) {
      throw new InvalidPlanStateError(
        "Ownership can only be transferred in draft or rejected status",
      );
    }
  },

  assertCanSubmitForReview(input: {
    readonly status: PlanStatus;
    readonly title: string;
    readonly objective: string;
    readonly scope: PlanScope;
    readonly items: readonly TestPlanItem[];
  }): void {
    if (input.status !== "draft") {
      throw new InvalidPlanStateError("Only draft plans can be submitted for review");
    }
    if (!input.title.trim()) {
      throw new PlanValidationError("title is required for review submission");
    }
    if (!input.objective.trim()) {
      throw new PlanValidationError("objective is required for review submission");
    }
    if (!isScopeValid(input.scope)) {
      throw new PlanValidationError("scope is invalid for review submission");
    }
    const includedCount = input.items.filter(
      (item) => isActiveItem(item) && item.itemStatus === "included",
    ).length;
    if (includedCount < 1) {
      throw new PlanInvariantViolationError(
        "At least one included item is required for review",
      );
    }
  },

  assertCanSupersede(status: PlanStatus): void {
    if (
      !SUPERSEDE_ELIGIBLE_STATUSES.includes(
        status as (typeof SUPERSEDE_ELIGIBLE_STATUSES)[number],
      )
    ) {
      throw new InvalidPlanStateError(`Plan in ${status} status cannot be superseded`);
    }
  },
};

export const ItemPolicy = {
  assertNoDuplicateSpecPin(
    items: readonly TestPlanItem[],
    candidate: TestPlanItem,
    excludeId?: string,
  ): void {
    const key = itemSpecPinKey(candidate);
    for (const item of items) {
      if (!isActiveItem(item)) {
        continue;
      }
      if (excludeId && item.id === excludeId) {
        continue;
      }
      if (itemSpecPinKey(item) === key) {
        throw new PlanInvariantViolationError(
          "Duplicate specificationId and specificationVersionPin pair is not allowed",
        );
      }
    }
  },
};

export function projectApprovalState(
  status: PlanStatus,
  approvals: readonly TestPlanApproval[],
): "none" | "pending_review" | "approved" | "rejected" {
  if (status === "review") {
    return "pending_review";
  }
  const latest = approvals.at(-1);
  if (!latest) {
    return "none";
  }
  return latest.decision;
}
