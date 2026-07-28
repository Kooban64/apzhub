import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_CRITICALITIES } from "./constants";

export type RelationshipCriticality = (typeof RELATIONSHIP_CRITICALITIES)[number];

export function createRelationshipCriticality(value: string): RelationshipCriticality {
  const normalized = value.trim() as RelationshipCriticality;
  if (!(RELATIONSHIP_CRITICALITIES as readonly string[]).includes(normalized)) {
    throw new QepInvariantViolation(
      `Relationship criticality must be one of: ${RELATIONSHIP_CRITICALITIES.join(", ")}`,
    );
  }
  return normalized;
}
