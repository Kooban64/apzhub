import { QepInvariantViolation } from "../../shared/errors";

export const REQUIREMENT_APPROVAL_STATES = [
  "not_submitted",
  "pending",
  "approved",
  "rejected",
] as const;

export type RequirementApprovalState = (typeof REQUIREMENT_APPROVAL_STATES)[number];

export function createRequirementApprovalState(
  value: string,
): RequirementApprovalState {
  if ((REQUIREMENT_APPROVAL_STATES as readonly string[]).includes(value)) {
    return value as RequirementApprovalState;
  }
  throw new QepInvariantViolation(`Invalid RequirementApprovalState: ${value}`);
}
