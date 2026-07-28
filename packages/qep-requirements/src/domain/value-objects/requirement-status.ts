import { QepInvariantViolation } from "../../shared/errors";

export const REQUIREMENT_STATUSES = [
  "draft",
  "proposed",
  "in_review",
  "approved",
  "rejected",
  "implemented",
  "verified",
  "deprecated",
  "archived",
] as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

export function createRequirementStatus(value: string): RequirementStatus {
  if ((REQUIREMENT_STATUSES as readonly string[]).includes(value)) {
    return value as RequirementStatus;
  }
  throw new QepInvariantViolation(`Invalid RequirementStatus: ${value}`);
}
