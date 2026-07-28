import type { RelationshipClassification } from "./relationship-classification";
import type { RelationshipCriticality } from "./relationship-criticality";
import type { RelationshipDirection } from "./relationship-direction";
import type { RelationshipEndpointMode } from "./relationship-endpoint";
import type { RelationshipLifecycleState } from "./relationship-lifecycle-state";
import type { RelationshipRationale } from "./relationship-rationale";
import type { RelationshipScope } from "./relationship-scope";
import type { RelationshipStrength } from "./relationship-strength";
import type { RelationshipType } from "./relationship-type";

/**
 * Complete semantic profile (ARCH-005 §14). No single property is sufficient.
 */
export type RelationshipSemanticProfile = {
  readonly type: RelationshipType;
  readonly direction: RelationshipDirection;
  readonly sourceEndpointMode: RelationshipEndpointMode;
  readonly targetEndpointMode: RelationshipEndpointMode;
  readonly lifecycleState: RelationshipLifecycleState;
  readonly strength: RelationshipStrength;
  readonly criticality: RelationshipCriticality;
  readonly classification: RelationshipClassification;
  readonly scope: RelationshipScope;
  readonly rationale?: RelationshipRationale;
};

export function buildRelationshipSemanticProfile(input: {
  readonly type: RelationshipType;
  readonly direction: RelationshipDirection;
  readonly lifecycleState: RelationshipLifecycleState;
  readonly strength: RelationshipStrength;
  readonly criticality: RelationshipCriticality;
  readonly classification: RelationshipClassification;
  readonly scope: RelationshipScope;
  readonly rationale?: RelationshipRationale;
}): RelationshipSemanticProfile {
  return {
    type: input.type,
    direction: input.direction,
    sourceEndpointMode: input.direction.source.mode,
    targetEndpointMode: input.direction.target.mode,
    lifecycleState: input.lifecycleState,
    strength: input.strength,
    criticality: input.criticality,
    classification: input.classification,
    scope: input.scope,
    ...(input.rationale !== undefined ? { rationale: input.rationale } : {}),
  };
}
