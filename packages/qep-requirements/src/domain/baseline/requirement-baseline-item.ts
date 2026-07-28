import type { RequirementContentVersionId } from "../content-version/requirement-content-version-id";
import {
  createRequirementContentVersionId,
} from "../content-version/requirement-content-version-id";
import type { RequirementContentVersionNumber } from "../content-version/requirement-content-version-number";
import {
  createRequirementContentVersionNumber,
} from "../content-version/requirement-content-version-number";
import type { RequirementId } from "../value-objects/requirement-id";
import { createRequirementId } from "../value-objects/requirement-id";
import { QepInvariantViolation } from "../../shared/errors";

/**
 * An immutable configuration-item membership record. It pins an exact content
 * version; it intentionally has no pointer to a mutable Requirement or "latest".
 */
export type RequirementBaselineItem = {
  readonly requirementId: RequirementId;
  readonly contentVersionId: RequirementContentVersionId;
  readonly contentVersionNumber: RequirementContentVersionNumber;
  readonly includedAt: string;
  readonly includedBy: string;
};

export function createRequirementBaselineItem(input: {
  readonly requirementId: string;
  readonly contentVersionId: string;
  readonly contentVersionNumber: number;
  readonly includedAt: string;
  readonly includedBy: string;
}): RequirementBaselineItem {
  const includedAt = input.includedAt.trim();
  const includedBy = input.includedBy.trim();
  if (!includedAt || !includedBy) {
    throw new QepInvariantViolation("Baseline item requires includedAt and includedBy");
  }

  return {
    requirementId: createRequirementId(input.requirementId),
    contentVersionId: createRequirementContentVersionId(input.contentVersionId),
    contentVersionNumber: createRequirementContentVersionNumber(input.contentVersionNumber),
    includedAt,
    includedBy,
  };
}
