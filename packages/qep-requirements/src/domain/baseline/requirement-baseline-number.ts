import { QepInvariantViolation } from "../../shared/errors";

declare const requirementBaselineNumberBrand: unique symbol;

/**
 * Sequence number for baseline identity within its future scope.
 * It is deliberately independent from requirement content-version numbers.
 */
export type RequirementBaselineNumber = number & {
  readonly [requirementBaselineNumberBrand]: "RequirementBaselineNumber";
};

export function createRequirementBaselineNumber(
  value: number,
): RequirementBaselineNumber {
  if (!Number.isInteger(value) || value < 1) {
    throw new QepInvariantViolation(
      "Requirement baseline number must be a positive integer",
    );
  }
  return value as RequirementBaselineNumber;
}
