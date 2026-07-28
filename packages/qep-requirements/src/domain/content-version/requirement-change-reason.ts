import { MAX_REASON_LENGTH } from "./constants";
import { QepInvalidChangeReasonError } from "../../shared/errors";

declare const requirementChangeReasonBrand: unique symbol;
export type RequirementChangeReason = string & {
  readonly [requirementChangeReasonBrand]: "RequirementChangeReason";
};

export function createRequirementChangeReason(value: string): RequirementChangeReason {
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_REASON_LENGTH) {
    throw new QepInvalidChangeReasonError(
      `Change reason must be non-empty and no longer than ${MAX_REASON_LENGTH} characters`,
    );
  }
  return normalized as RequirementChangeReason;
}
