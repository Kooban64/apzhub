import { QepInvariantViolation } from "../../shared/errors";

/**
 * Lightweight reference stored on mutable Requirement content. This is distinct
 * from the `RequirementBaseline` aggregate, which pins content-version items.
 */
export type RequirementBaselineReference = {
  readonly baselineId: string;
  readonly label: string;
};

export function createRequirementBaselineReference(input: {
  baselineId: string;
  label: string;
}): RequirementBaselineReference {
  const baselineId = input.baselineId.trim();
  const label = input.label.trim();
  if (!baselineId || !label) {
    throw new QepInvariantViolation(
      "RequirementBaselineReference requires baselineId and label",
    );
  }
  return { baselineId, label };
}
