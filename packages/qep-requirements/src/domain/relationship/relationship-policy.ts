import { QepInvariantViolation } from "../../shared/errors";
import {
  assertDistinctEndpoints,
  type RelationshipEndpoint,
} from "./relationship-endpoint";
import { endpointSortKey } from "./relationship-direction";
import type { RelationshipLifecycleState } from "./relationship-lifecycle-state";
import type { RelationshipRationale } from "./relationship-rationale";
import type { RelationshipScope } from "./relationship-scope";
import type { RelationshipType } from "./relationship-type";
import {
  getRelationshipTaxonomyDefinition,
  assertApprovedTaxonomyType,
} from "./relationship-taxonomy";

/** Persistence-independent edge fact for duplicate / cycle / supersession checks. */
export type RelationshipEdgeFact = {
  readonly relationshipId: string;
  readonly type: RelationshipType;
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
  readonly scope: RelationshipScope;
  readonly lifecycleState: RelationshipLifecycleState;
};

export type EndpointExistenceFact = {
  readonly tenantId: string;
  readonly requirementId: string;
  readonly exists: boolean;
};

export type ContentVersionPinFact = {
  readonly tenantId: string;
  readonly requirementId: string;
  readonly contentVersionId: string;
  /** True when the content version exists and belongs to the requirement in-tenant. */
  readonly valid: boolean;
};

export type ScopeReferenceFact = {
  readonly tenantId: string;
  readonly scope: RelationshipScope;
  readonly exists: boolean;
};

export function assertTaxonomyType(type: RelationshipType): void {
  assertApprovedTaxonomyType(type);
}

export function assertEndpointPair(
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
  tenantId: string,
): void {
  if (source.tenantId !== tenantId || target.tenantId !== tenantId) {
    throw new QepInvariantViolation(
      "Relationship and endpoints must share the same tenant",
    );
  }
  assertDistinctEndpoints(source, target);
}

export function assertEndpointExistence(
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
  facts: readonly EndpointExistenceFact[],
): void {
  for (const endpoint of [source, target]) {
    const fact = facts.find(
      (entry) =>
        entry.tenantId === endpoint.tenantId &&
        entry.requirementId === endpoint.requirementId,
    );
    if (!fact || !fact.exists) {
      throw new QepInvariantViolation(
        `Relationship endpoint requirement does not exist: ${endpoint.requirementId}`,
      );
    }
  }
}

export function assertContentVersionPinValidity(
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
  facts: readonly ContentVersionPinFact[],
): void {
  for (const endpoint of [source, target]) {
    if (endpoint.mode !== "content_version_pinned") {
      continue;
    }
    const contentVersionId = endpoint.contentVersionId;
    if (!contentVersionId) {
      throw new QepInvariantViolation("Pinned endpoint is missing contentVersionId");
    }
    const fact = facts.find(
      (entry) =>
        entry.tenantId === endpoint.tenantId &&
        entry.requirementId === endpoint.requirementId &&
        entry.contentVersionId === contentVersionId,
    );
    if (!fact || !fact.valid) {
      throw new QepInvariantViolation(
        `Content Version pin is invalid for requirement ${endpoint.requirementId}`,
      );
    }
  }
}

export function assertScopeReferenceValidity(
  tenantId: string,
  scope: RelationshipScope,
  facts: readonly ScopeReferenceFact[],
): void {
  if (scope.kind === "product") {
    return;
  }
  const fact = facts.find(
    (entry) =>
      entry.tenantId === tenantId &&
      entry.scope.kind === scope.kind &&
      entry.scope.referenceId === scope.referenceId,
  );
  if (!fact || !fact.exists) {
    throw new QepInvariantViolation(
      `Relationship scope reference does not exist for ${scope.kind}`,
    );
  }
}

export function assertRationalePolicy(
  type: RelationshipType,
  rationale: RelationshipRationale | undefined,
): void {
  const taxonomy = getRelationshipTaxonomyDefinition(type);
  if (taxonomy.rationalePolicy === "mandatory" && rationale === undefined) {
    throw new QepInvariantViolation(`Relationship type ${type} requires a rationale`);
  }
}

/**
 * Canonicalise symmetric pairs so only one ordered representation is stored.
 * For conflicts_with, source sort key must be lexicographically ≤ target.
 */
export function canonicaliseSymmetricDirection(
  type: RelationshipType,
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
): { readonly source: RelationshipEndpoint; readonly target: RelationshipEndpoint } {
  const taxonomy = getRelationshipTaxonomyDefinition(type);
  if (!taxonomy.symmetric) {
    return { source, target };
  }
  const sourceKey = endpointSortKey(source);
  const targetKey = endpointSortKey(target);
  if (sourceKey <= targetKey) {
    return { source, target };
  }
  return { source: target, target: source };
}

export function relationshipDuplicateKey(edge: {
  readonly type: RelationshipType;
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
  readonly scope: RelationshipScope;
}): string {
  const canonical = canonicaliseSymmetricDirection(edge.type, edge.source, edge.target);
  const scopeRef = edge.scope.referenceId ?? "";
  return [
    edge.type,
    endpointSortKey(canonical.source),
    endpointSortKey(canonical.target),
    edge.scope.kind,
    scopeRef,
  ].join("|");
}

export function assertNoDuplicateActiveRelationship(
  candidate: {
    readonly relationshipId: string;
    readonly type: RelationshipType;
    readonly source: RelationshipEndpoint;
    readonly target: RelationshipEndpoint;
    readonly scope: RelationshipScope;
  },
  existing: readonly RelationshipEdgeFact[],
): void {
  const candidateKey = relationshipDuplicateKey(candidate);
  for (const edge of existing) {
    if (edge.lifecycleState !== "active" && edge.lifecycleState !== "deprecated") {
      continue;
    }
    if (edge.relationshipId === candidate.relationshipId) {
      continue;
    }
    if (relationshipDuplicateKey(edge) === candidateKey) {
      throw new QepInvariantViolation(
        "Duplicate relationship for the same type, endpoints, and scope is not allowed",
      );
    }
  }
}

function edgeNodeKey(endpoint: RelationshipEndpoint): string {
  return endpointSortKey(endpoint);
}

/**
 * Domain-only cycle validation against an in-memory edge set.
 * Forbidden / default-forbidden types reject cycles; permitted / N/A skip.
 */
export function assertCyclePolicy(
  candidate: {
    readonly type: RelationshipType;
    readonly source: RelationshipEndpoint;
    readonly target: RelationshipEndpoint;
  },
  existing: readonly RelationshipEdgeFact[],
): void {
  const taxonomy = getRelationshipTaxonomyDefinition(candidate.type);
  if (
    taxonomy.cyclePolicy === "permitted" ||
    taxonomy.cyclePolicy === "not_applicable_symmetric"
  ) {
    return;
  }

  const relevant = existing.filter(
    (edge) =>
      edge.type === candidate.type &&
      (edge.lifecycleState === "active" || edge.lifecycleState === "deprecated"),
  );

  const adjacency = new Map<string, Set<string>>();
  const addEdge = (from: RelationshipEndpoint, to: RelationshipEndpoint) => {
    const fromKey = edgeNodeKey(from);
    const toKey = edgeNodeKey(to);
    const neighbours = adjacency.get(fromKey) ?? new Set<string>();
    neighbours.add(toKey);
    adjacency.set(fromKey, neighbours);
  };

  for (const edge of relevant) {
    addEdge(edge.source, edge.target);
  }
  addEdge(candidate.source, candidate.target);

  const start = edgeNodeKey(candidate.target);
  const goal = edgeNodeKey(candidate.source);
  const visited = new Set<string>();
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === goal) {
      throw new QepInvariantViolation(
        `Relationship type ${candidate.type} would introduce a prohibited cycle`,
      );
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next);
    }
  }
}

/**
 * At most one active supersession successor per superseded Requirement in a given scope.
 */
export function assertSupersessionUniqueness(
  candidate: {
    readonly relationshipId: string;
    readonly type: RelationshipType;
    readonly source: RelationshipEndpoint;
    readonly target: RelationshipEndpoint;
    readonly scope: RelationshipScope;
  },
  existing: readonly RelationshipEdgeFact[],
): void {
  if (candidate.type !== "supersedes") {
    return;
  }
  const supersededRequirementId = candidate.target.requirementId;
  const scopeKey = `${candidate.scope.kind}|${candidate.scope.referenceId ?? ""}`;
  for (const edge of existing) {
    if (edge.type !== "supersedes" || edge.lifecycleState !== "active") {
      continue;
    }
    if (edge.relationshipId === candidate.relationshipId) {
      continue;
    }
    if (edge.target.requirementId !== supersededRequirementId) {
      continue;
    }
    const edgeScopeKey = `${edge.scope.kind}|${edge.scope.referenceId ?? ""}`;
    if (edgeScopeKey === scopeKey) {
      throw new QepInvariantViolation(
        "A Requirement cannot be actively superseded by multiple successors in the same scope",
      );
    }
  }
}

/**
 * Relationships never mutate Baseline membership or Content Version immutability.
 * Domain rule: no operation may claim to alter locked baseline membership.
 */
export function assertBaselineInteractionRules(input: {
  readonly claimsBaselineMembershipMutation?: boolean;
  readonly claimsContentVersionMutation?: boolean;
}): void {
  if (input.claimsBaselineMembershipMutation) {
    throw new QepInvariantViolation(
      "Relationships must not add or remove Requirement Content Versions from a Baseline",
    );
  }
  if (input.claimsContentVersionMutation) {
    throw new QepInvariantViolation(
      "Relationships must not mutate or unlock Requirement Content Versions",
    );
  }
}

export function assertRelationshipDraftMutable(
  state: RelationshipLifecycleState,
): void {
  if (state !== "draft") {
    throw new QepInvariantViolation(
      "Only draft relationships may change type or endpoints",
    );
  }
}

export function assertRelationshipProfileMutable(
  state: RelationshipLifecycleState,
): void {
  if (state !== "draft" && state !== "active") {
    throw new QepInvariantViolation(
      "Only draft or active relationships may change semantic profile attributes",
    );
  }
}

export function assertRelationshipNotRetired(state: RelationshipLifecycleState): void {
  if (state === "retired") {
    throw new QepInvariantViolation(
      "Retired relationships are immutable historical facts",
    );
  }
}
