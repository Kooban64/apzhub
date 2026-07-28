import type { Requirement } from "./requirement";
import type { RequirementId } from "../value-objects/requirement-id";
import { QepInvariantViolation } from "../../shared/errors";

export type RequirementCollection = {
  readonly items: readonly Requirement[];
};

export function createRequirementCollection(
  items: readonly Requirement[],
): RequirementCollection {
  const seen = new Set<RequirementId>();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new QepInvariantViolation(
        `Duplicate RequirementId in collection: ${item.id}`,
      );
    }
    seen.add(item.id);
  }
  return { items };
}

export function findRequirementById(
  collection: RequirementCollection,
  id: RequirementId,
): Requirement | undefined {
  return collection.items.find((item) => item.id === id);
}
