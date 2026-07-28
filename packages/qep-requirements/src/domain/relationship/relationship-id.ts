import { QepInvariantViolation } from "../../shared/errors";

declare const relationshipIdBrand: unique symbol;

export type RelationshipId = string & {
  readonly [relationshipIdBrand]: "RelationshipId";
};

export function createRelationshipId(value: string): RelationshipId {
  const normalized = value.trim();
  if (!/^rrl_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new QepInvariantViolation("Relationship id must start with rrl_");
  }
  return normalized as RelationshipId;
}
