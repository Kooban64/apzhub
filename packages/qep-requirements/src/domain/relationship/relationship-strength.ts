import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_STRENGTHS } from "./constants";

export type RelationshipStrength = (typeof RELATIONSHIP_STRENGTHS)[number];

export function createRelationshipStrength(value: string): RelationshipStrength {
  const normalized = value.trim() as RelationshipStrength;
  if (!(RELATIONSHIP_STRENGTHS as readonly string[]).includes(normalized)) {
    throw new QepInvariantViolation(
      `Relationship strength must be one of: ${RELATIONSHIP_STRENGTHS.join(", ")}`,
    );
  }
  return normalized;
}
