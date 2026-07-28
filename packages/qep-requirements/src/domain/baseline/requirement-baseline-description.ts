import { QepInvariantViolation } from "../../shared/errors";
import { REQUIREMENT_BASELINE_DESCRIPTION_MAX_LENGTH } from "./constants";

declare const requirementBaselineDescriptionBrand: unique symbol;

export type RequirementBaselineDescription = string & {
  readonly [requirementBaselineDescriptionBrand]: "RequirementBaselineDescription";
};

export function createRequirementBaselineDescription(
  value: string,
): RequirementBaselineDescription {
  const normalized = value.trim();
  if (normalized.length > REQUIREMENT_BASELINE_DESCRIPTION_MAX_LENGTH) {
    throw new QepInvariantViolation(
      `Requirement baseline description must not exceed ${REQUIREMENT_BASELINE_DESCRIPTION_MAX_LENGTH} characters`,
    );
  }
  return normalized as RequirementBaselineDescription;
}
