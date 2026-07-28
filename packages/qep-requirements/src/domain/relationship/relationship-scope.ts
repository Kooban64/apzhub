import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_SCOPES } from "./constants";

export type RelationshipScopeKind = (typeof RELATIONSHIP_SCOPES)[number];

export type RelationshipScope = {
  readonly kind: RelationshipScopeKind;
  /** Required for project | release | baseline scopes. */
  readonly referenceId?: string;
};

export function createRelationshipScope(input: {
  readonly kind: string;
  readonly referenceId?: string;
}): RelationshipScope {
  const kind = input.kind.trim() as RelationshipScopeKind;
  if (!(RELATIONSHIP_SCOPES as readonly string[]).includes(kind)) {
    throw new QepInvariantViolation(
      `Relationship scope must be one of: ${RELATIONSHIP_SCOPES.join(", ")}`,
    );
  }
  if (kind === "product") {
    if (input.referenceId !== undefined && input.referenceId.trim() !== "") {
      throw new QepInvariantViolation("Product scope must not carry a reference id");
    }
    return { kind };
  }
  const referenceId = input.referenceId?.trim();
  if (!referenceId) {
    throw new QepInvariantViolation(`Scope ${kind} requires a reference id`);
  }
  if (kind === "baseline" && !/^rbl_[A-Za-z0-9_-]+$/.test(referenceId)) {
    throw new QepInvariantViolation(
      "Baseline scope reference must be a requirement baseline id (rbl_)",
    );
  }
  return { kind, referenceId };
}
