import { QepInvariantViolation } from "../../shared/errors";

declare const requirementBaselineIdBrand: unique symbol;

export type RequirementBaselineId = string & {
  readonly [requirementBaselineIdBrand]: "RequirementBaselineId";
};

export function createRequirementBaselineId(value: string): RequirementBaselineId {
  const normalized = value.trim();
  if (!/^rbl_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new QepInvariantViolation("Requirement baseline id must start with rbl_");
  }
  return normalized as RequirementBaselineId;
}
