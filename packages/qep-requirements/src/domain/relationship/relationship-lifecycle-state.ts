import { QepInvariantViolation } from "../../shared/errors";
import { RELATIONSHIP_LIFECYCLE_STATES } from "./constants";

export type RelationshipLifecycleState = (typeof RELATIONSHIP_LIFECYCLE_STATES)[number];

export function createRelationshipLifecycleState(
  value: string,
): RelationshipLifecycleState {
  const normalized = value.trim() as RelationshipLifecycleState;
  if (!(RELATIONSHIP_LIFECYCLE_STATES as readonly string[]).includes(normalized)) {
    throw new QepInvariantViolation(
      `Relationship lifecycle state must be one of: ${RELATIONSHIP_LIFECYCLE_STATES.join(", ")}`,
    );
  }
  return normalized;
}

/** Permitted transitions: draft→active→deprecated→retired. No reverse. No delete. */
export function assertRelationshipLifecycleTransition(
  from: RelationshipLifecycleState,
  to: RelationshipLifecycleState,
): void {
  const allowed =
    (from === "draft" && to === "active") ||
    (from === "active" && to === "deprecated") ||
    (from === "deprecated" && to === "retired");
  if (!allowed) {
    throw new QepInvariantViolation(
      `Relationship lifecycle transition ${from} -> ${to} is not allowed`,
    );
  }
}
