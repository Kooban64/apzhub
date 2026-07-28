import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_TYPES } from "./constants";

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export function createRelationshipType(value: string): RelationshipType {
  const normalized = value.trim() as RelationshipType;
  if (!(RELATIONSHIP_TYPES as readonly string[]).includes(normalized)) {
    throw new QepInvariantViolation(
      `Relationship type must be one of: ${RELATIONSHIP_TYPES.join(", ")}`,
    );
  }
  return normalized;
}

export function isApprovedRelationshipType(value: string): value is RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value.trim());
}
