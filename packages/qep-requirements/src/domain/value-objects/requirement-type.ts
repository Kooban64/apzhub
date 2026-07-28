import { QepInvariantViolation } from "../../shared/errors";

export const REQUIREMENT_TYPES = [
  "business",
  "functional",
  "non_functional",
  "security",
  "compliance",
  "acceptance",
] as const;

export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

export function createRequirementType(value: string): RequirementType {
  if ((REQUIREMENT_TYPES as readonly string[]).includes(value)) {
    return value as RequirementType;
  }
  throw new QepInvariantViolation(`Invalid RequirementType: ${value}`);
}
