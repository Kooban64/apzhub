import { QepInvariantViolation } from "../../shared/errors";
import { REQUIREMENT_BASELINE_STATUSES } from "./constants";

export type RequirementBaselineStatus = (typeof REQUIREMENT_BASELINE_STATUSES)[number];

export function createRequirementBaselineStatus(
  value: string,
): RequirementBaselineStatus {
  if (!(REQUIREMENT_BASELINE_STATUSES as readonly string[]).includes(value)) {
    throw new QepInvariantViolation(
      `Requirement baseline status must be one of: ${REQUIREMENT_BASELINE_STATUSES.join(", ")}`,
    );
  }
  return value as RequirementBaselineStatus;
}
