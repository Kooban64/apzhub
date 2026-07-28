import { PlanValidationError } from "../../shared/errors";
import { createActorId } from "./value-objects";

export type TestPlanAssignment = {
  readonly leadId?: string;
  readonly assigneeIds: readonly string[];
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type CreateTestPlanAssignmentInput = {
  readonly leadId?: string;
  readonly assigneeIds?: readonly string[];
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export function createEmptyTestPlanAssignment(
  updatedAt: string,
  updatedBy: string,
): TestPlanAssignment {
  return createTestPlanAssignment({ updatedAt, updatedBy });
}

export function createTestPlanAssignment(
  input: CreateTestPlanAssignmentInput,
): TestPlanAssignment {
  const updatedBy = createActorId(input.updatedBy);
  const leadId = input.leadId?.trim();
  if (leadId === "") {
    throw new PlanValidationError("leadId must be non-empty when provided");
  }
  const assigneeIds = [
    ...new Set((input.assigneeIds ?? []).map((id) => id.trim()).filter(Boolean)),
  ];
  return {
    ...(leadId ? { leadId } : {}),
    assigneeIds,
    updatedAt: input.updatedAt.trim(),
    updatedBy,
  };
}
