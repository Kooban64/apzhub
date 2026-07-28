import { QepInvariantViolation } from "../../shared/errors";

export const REQUIREMENT_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export type RequirementPriority = (typeof REQUIREMENT_PRIORITIES)[number];

export function createRequirementPriority(value: string): RequirementPriority {
  if ((REQUIREMENT_PRIORITIES as readonly string[]).includes(value)) {
    return value as RequirementPriority;
  }
  throw new QepInvariantViolation(`Invalid RequirementPriority: ${value}`);
}
