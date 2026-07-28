import type { Relationship } from "../../domain/relationship/relationship";
import type { StoredRequirementsRelationship } from "../../domain/relationship/requirements-relationship-repository";
import { relationshipDuplicateKey } from "../../domain/relationship/relationship-policy";

export function toStoredRelationship(
  relationship: Relationship,
  revision: number,
): StoredRequirementsRelationship {
  const { domainEvents: _events, ...rest } = relationship;
  return {
    ...rest,
    revision,
    domainEvents: [],
  };
}

export function computeRelationshipDuplicateKey(relationship: Relationship): string {
  return relationshipDuplicateKey({
    type: relationship.type,
    source: relationship.direction.source,
    target: relationship.direction.target,
    scope: relationship.scope,
  });
}

export function relationshipMatchesListFilters(
  row: StoredRequirementsRelationship,
  query: {
    readonly type?: string;
    readonly lifecycleState?: string;
    readonly requirementId?: string;
    readonly direction?: "inbound" | "outbound" | "both";
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly conflictsOnly?: boolean;
    readonly supersessionOnly?: boolean;
  },
): boolean {
  if (query.type && row.type !== query.type) return false;
  if (query.lifecycleState && row.lifecycleState !== query.lifecycleState) return false;
  if (query.conflictsOnly && row.type !== "conflicts_with") return false;
  if (query.supersessionOnly && row.type !== "supersedes") return false;
  if (query.baselineId) {
    if (row.scope.kind !== "baseline" || row.scope.referenceId !== query.baselineId) {
      return false;
    }
  }
  if (query.contentVersionId) {
    const sourcePin = row.direction.source.contentVersionId;
    const targetPin = row.direction.target.contentVersionId;
    if (sourcePin !== query.contentVersionId && targetPin !== query.contentVersionId) {
      return false;
    }
  }
  if (query.requirementId) {
    const source = row.direction.source.requirementId === query.requirementId;
    const target = row.direction.target.requirementId === query.requirementId;
    const direction = query.direction ?? "both";
    if (direction === "outbound" && !source) return false;
    if (direction === "inbound" && !target) return false;
    if (direction === "both" && !source && !target) return false;
  }
  return true;
}
