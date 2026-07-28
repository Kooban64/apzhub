import type { RelationshipClassification } from "./relationship-classification";
import type { RelationshipEndpoint } from "./relationship-endpoint";
import type { RelationshipRationale } from "./relationship-rationale";
import type { RelationshipScope } from "./relationship-scope";
import type { RelationshipStrength } from "./relationship-strength";
import type { RelationshipType } from "./relationship-type";
import {
  assertBaselineInteractionRules,
  assertContentVersionPinValidity,
  assertCyclePolicy,
  assertEndpointExistence,
  assertEndpointPair,
  assertNoDuplicateActiveRelationship,
  assertRationalePolicy,
  assertScopeReferenceValidity,
  assertSupersessionUniqueness,
  assertTaxonomyType,
  canonicaliseSymmetricDirection,
  type ContentVersionPinFact,
  type EndpointExistenceFact,
  type RelationshipEdgeFact,
  type ScopeReferenceFact,
} from "./relationship-policy";
import { getRelationshipTaxonomyDefinition } from "./relationship-taxonomy";

/**
 * Pure domain service: activation and create-time validation for Requirements Relationships.
 * No Platform services, repositories, HTTP, or persistence.
 */
export type RelationshipActivationContext = {
  readonly tenantId: string;
  readonly relationshipId: string;
  readonly type: RelationshipType;
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
  readonly scope: RelationshipScope;
  readonly strength: RelationshipStrength;
  readonly classification: RelationshipClassification;
  readonly rationale?: RelationshipRationale;
  readonly existingEdges: readonly RelationshipEdgeFact[];
  readonly endpointFacts: readonly EndpointExistenceFact[];
  readonly pinFacts: readonly ContentVersionPinFact[];
  readonly scopeFacts: readonly ScopeReferenceFact[];
  readonly claimsBaselineMembershipMutation?: boolean;
  readonly claimsContentVersionMutation?: boolean;
};

export type RelationshipActivationResult = {
  readonly source: RelationshipEndpoint;
  readonly target: RelationshipEndpoint;
};

export function validateRelationshipForActivation(
  context: RelationshipActivationContext,
): RelationshipActivationResult {
  assertTaxonomyType(context.type);
  assertBaselineInteractionRules({
    claimsBaselineMembershipMutation: context.claimsBaselineMembershipMutation,
    claimsContentVersionMutation: context.claimsContentVersionMutation,
  });
  assertEndpointPair(context.source, context.target, context.tenantId);
  assertEndpointExistence(context.source, context.target, context.endpointFacts);
  assertContentVersionPinValidity(context.source, context.target, context.pinFacts);
  assertScopeReferenceValidity(context.tenantId, context.scope, context.scopeFacts);
  assertRationalePolicy(context.type, context.rationale);

  const canonical = canonicaliseSymmetricDirection(
    context.type,
    context.source,
    context.target,
  );

  const candidate = {
    relationshipId: context.relationshipId,
    type: context.type,
    source: canonical.source,
    target: canonical.target,
    scope: context.scope,
  };

  assertNoDuplicateActiveRelationship(candidate, context.existingEdges);
  assertCyclePolicy(candidate, context.existingEdges);
  assertSupersessionUniqueness(candidate, context.existingEdges);

  // Strength / classification already validated by value objects; taxonomy default is advisory.
  void getRelationshipTaxonomyDefinition(context.type);
  void context.strength;
  void context.classification;

  return canonical;
}

export function defaultStrengthForType(type: RelationshipType): RelationshipStrength {
  return getRelationshipTaxonomyDefinition(type).defaultStrength;
}
