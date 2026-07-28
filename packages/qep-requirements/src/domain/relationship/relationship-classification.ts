import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_CLASSIFICATIONS } from "./constants";

export type RelationshipClassification = (typeof RELATIONSHIP_CLASSIFICATIONS)[number];

export function createRelationshipClassification(
  value: string,
): RelationshipClassification {
  const normalized = value.trim() as RelationshipClassification;
  if (!(RELATIONSHIP_CLASSIFICATIONS as readonly string[]).includes(normalized)) {
    throw new QepInvariantViolation(
      `Relationship classification must be one of: ${RELATIONSHIP_CLASSIFICATIONS.join(", ")}`,
    );
  }
  return normalized;
}
