import { QepInvariantViolation } from "../../shared/errors";

declare const requirementContentVersionIdBrand: unique symbol;
export type RequirementContentVersionId = string & {
  readonly [requirementContentVersionIdBrand]: "RequirementContentVersionId";
};

export function createRequirementContentVersionId(
  value: string,
): RequirementContentVersionId {
  const normalized = value.trim();
  if (!/^rcv_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new QepInvariantViolation(
      "Requirement content version id must start with rcv_",
    );
  }
  return normalized as RequirementContentVersionId;
}
