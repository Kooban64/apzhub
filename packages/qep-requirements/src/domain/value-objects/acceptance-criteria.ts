import { QepInvariantViolation } from "../../shared/errors";

export type AcceptanceCriteria = {
  readonly items: readonly string[];
};

export function createAcceptanceCriteria(items: readonly string[]): AcceptanceCriteria {
  const normalised = items.map((i) => i.trim()).filter(Boolean);
  if (normalised.length === 0) {
    throw new QepInvariantViolation("AcceptanceCriteria requires at least one item");
  }
  if (normalised.length > 100) {
    throw new QepInvariantViolation("AcceptanceCriteria max 100 items");
  }
  return { items: normalised };
}
