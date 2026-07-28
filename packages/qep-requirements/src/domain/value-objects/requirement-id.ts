import { QepInvariantViolation } from "../../shared/errors";

declare const brand: unique symbol;
export type RequirementId = string & { readonly [brand]: "QepRequirementId" };

const ID_PATTERN = /^req_[a-zA-Z0-9_-]{1,64}$/;

export function createRequirementId(value: string): RequirementId {
  const trimmed = value.trim();
  if (!ID_PATTERN.test(trimmed)) {
    throw new QepInvariantViolation(
      `Invalid RequirementId: expected req_* form, received "${value}"`,
    );
  }
  return trimmed as RequirementId;
}

export function isRequirementId(value: string): value is RequirementId {
  return ID_PATTERN.test(value.trim());
}
