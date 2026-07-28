import { QepInvariantViolation } from "../../shared/errors";

declare const brand: unique symbol;
export type RequirementCategory = string & {
  readonly [brand]: "QepRequirementCategory";
};

export function createRequirementCategory(value: string): RequirementCategory {
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 128) {
    throw new QepInvariantViolation("RequirementCategory must be 1–128 characters");
  }
  return trimmed as RequirementCategory;
}
