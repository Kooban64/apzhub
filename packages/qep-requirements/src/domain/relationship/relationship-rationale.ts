import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_RATIONALE_MAX_LENGTH } from "./constants";

declare const relationshipRationaleBrand: unique symbol;

export type RelationshipRationale = string & {
  readonly [relationshipRationaleBrand]: "RelationshipRationale";
};

export function createRelationshipRationale(value: string): RelationshipRationale {
  const normalized = value.trim();
  if (!normalized) {
    throw new QepInvariantViolation(
      "Relationship rationale must not be empty when provided",
    );
  }
  if (normalized.length > RELATIONSHIP_RATIONALE_MAX_LENGTH) {
    throw new QepInvariantViolation(
      `Relationship rationale must not exceed ${RELATIONSHIP_RATIONALE_MAX_LENGTH} characters`,
    );
  }
  return normalized as RelationshipRationale;
}
