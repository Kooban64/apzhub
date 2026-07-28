import type { RequirementId } from "./requirement-id";
import { QepInvariantViolation } from "../../shared/errors";

export const REQUIREMENT_RELATIONSHIP_KINDS = [
  "parent_child",
  "depends_on",
  "related",
  "duplicates",
  "supersedes",
] as const;

export type RequirementRelationshipKind =
  (typeof REQUIREMENT_RELATIONSHIP_KINDS)[number];

export type RequirementRelationship = {
  readonly kind: RequirementRelationshipKind;
  readonly fromId: RequirementId;
  readonly toId: RequirementId;
};

export function createRequirementRelationship(input: {
  kind: RequirementRelationshipKind;
  fromId: RequirementId;
  toId: RequirementId;
}): RequirementRelationship {
  if (input.fromId === input.toId) {
    throw new QepInvariantViolation(
      "RequirementRelationship cannot be self-referential",
    );
  }
  if (!(REQUIREMENT_RELATIONSHIP_KINDS as readonly string[]).includes(input.kind)) {
    throw new QepInvariantViolation(
      `Invalid RequirementRelationshipKind: ${input.kind}`,
    );
  }
  return {
    kind: input.kind,
    fromId: input.fromId,
    toId: input.toId,
  };
}
