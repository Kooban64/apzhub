import { QepInvariantViolation } from "../../shared/errors";
import type { RelationshipEndpoint } from "./relationship-endpoint";

/**
 * Directed source → target. Symmetric types use canonical ordering of endpoints
 * rather than a separate undirected storage model (ARCH-005 §6).
 */
export type RelationshipDirection = {
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
};

export function createRelationshipDirection(
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
): RelationshipDirection {
  if (source.tenantId !== target.tenantId) {
    throw new QepInvariantViolation("Direction endpoints must share the same tenant");
  }
  return { source, target };
}

export function endpointSortKey(endpoint: RelationshipEndpoint): string {
  return `${endpoint.requirementId}|${endpoint.contentVersionId ?? ""}`;
}
