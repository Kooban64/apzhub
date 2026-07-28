import { QepInvariantViolation } from "../../shared/errors";
import { REQUIREMENT_BASELINE_NAME_MAX_LENGTH } from "./constants";

declare const requirementBaselineNameBrand: unique symbol;

export type RequirementBaselineName = string & {
  readonly [requirementBaselineNameBrand]: "RequirementBaselineName";
};

export function createRequirementBaselineName(value: string): RequirementBaselineName {
  const normalized = value.trim();
  if (!normalized) {
    throw new QepInvariantViolation("Requirement baseline name is required");
  }
  if (normalized.length > REQUIREMENT_BASELINE_NAME_MAX_LENGTH) {
    throw new QepInvariantViolation(
      `Requirement baseline name must not exceed ${REQUIREMENT_BASELINE_NAME_MAX_LENGTH} characters`,
    );
  }
  return normalized as RequirementBaselineName;
}
