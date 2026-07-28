import { QepInvariantViolation } from "../../shared/errors";

declare const requirementContentVersionNumberBrand: unique symbol;
export type RequirementContentVersionNumber = number & {
  readonly [requirementContentVersionNumberBrand]: "RequirementContentVersionNumber";
};

export function createRequirementContentVersionNumber(
  value: number,
): RequirementContentVersionNumber {
  if (!Number.isInteger(value) || value < 1) {
    throw new QepInvariantViolation("Requirement content version number must be a positive integer");
  }
  return value as RequirementContentVersionNumber;
}
