import { randomUUID } from "node:crypto";

import type { RelationshipClassification } from "./relationship-classification";
import type { RelationshipId } from "./relationship-id";
import type { RelationshipLifecycleState } from "./relationship-lifecycle-state";
import type { RelationshipScope } from "./relationship-scope";
import type { RelationshipSemanticProfile } from "./relationship-semantic-profile";
import type { RelationshipStrength } from "./relationship-strength";
import type { RelationshipType } from "./relationship-type";

export type RelationshipEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly relationshipId: RelationshipId;
};

export type RelationshipCreated = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.created";
  readonly relationshipType: RelationshipType;
  readonly lifecycleState: RelationshipLifecycleState;
};

export type RelationshipActivated = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.activated";
};

export type RelationshipDeprecated = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.deprecated";
};

export type RelationshipRetired = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.retired";
};

export type RelationshipSuperseded = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.superseded";
  readonly supersededRequirementId: string;
  readonly successorRequirementId: string;
};

export type RelationshipRationaleChanged = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.rationale_changed";
};

export type RelationshipSemanticProfileChanged = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.semantic_profile_changed";
  readonly profile: RelationshipSemanticProfile;
};

export type RelationshipStrengthChanged = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.strength_changed";
  readonly strength: RelationshipStrength;
};

export type RelationshipClassificationChanged = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.classification_changed";
  readonly classification: RelationshipClassification;
};

export type RelationshipScopeChanged = RelationshipEventBase & {
  readonly type: "qep.requirements_relationship.scope_changed";
  readonly scope: RelationshipScope;
};

export type RequirementsRelationshipDomainEvent =
  | RelationshipCreated
  | RelationshipActivated
  | RelationshipDeprecated
  | RelationshipRetired
  | RelationshipSuperseded
  | RelationshipRationaleChanged
  | RelationshipSemanticProfileChanged
  | RelationshipStrengthChanged
  | RelationshipClassificationChanged
  | RelationshipScopeChanged;

type RelationshipEventInput = {
  readonly tenantId: string;
  readonly relationshipId: RelationshipId;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function baseEvent(input: RelationshipEventInput): RelationshipEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    relationshipId: input.relationshipId,
  };
}

export function buildRelationshipCreatedEvent(
  input: RelationshipEventInput & {
    readonly relationshipType: RelationshipType;
    readonly lifecycleState: RelationshipLifecycleState;
  },
): RelationshipCreated {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.created",
    relationshipType: input.relationshipType,
    lifecycleState: input.lifecycleState,
  };
}

export function buildRelationshipActivatedEvent(
  input: RelationshipEventInput,
): RelationshipActivated {
  return { ...baseEvent(input), type: "qep.requirements_relationship.activated" };
}

export function buildRelationshipDeprecatedEvent(
  input: RelationshipEventInput,
): RelationshipDeprecated {
  return { ...baseEvent(input), type: "qep.requirements_relationship.deprecated" };
}

export function buildRelationshipRetiredEvent(input: RelationshipEventInput): RelationshipRetired {
  return { ...baseEvent(input), type: "qep.requirements_relationship.retired" };
}

export function buildRelationshipSupersededEvent(
  input: RelationshipEventInput & {
    readonly supersededRequirementId: string;
    readonly successorRequirementId: string;
  },
): RelationshipSuperseded {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.superseded",
    supersededRequirementId: input.supersededRequirementId,
    successorRequirementId: input.successorRequirementId,
  };
}

export function buildRelationshipRationaleChangedEvent(
  input: RelationshipEventInput,
): RelationshipRationaleChanged {
  return { ...baseEvent(input), type: "qep.requirements_relationship.rationale_changed" };
}

export function buildRelationshipSemanticProfileChangedEvent(
  input: RelationshipEventInput & { readonly profile: RelationshipSemanticProfile },
): RelationshipSemanticProfileChanged {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.semantic_profile_changed",
    profile: input.profile,
  };
}

export function buildRelationshipStrengthChangedEvent(
  input: RelationshipEventInput & { readonly strength: RelationshipStrength },
): RelationshipStrengthChanged {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.strength_changed",
    strength: input.strength,
  };
}

export function buildRelationshipClassificationChangedEvent(
  input: RelationshipEventInput & { readonly classification: RelationshipClassification },
): RelationshipClassificationChanged {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.classification_changed",
    classification: input.classification,
  };
}

export function buildRelationshipScopeChangedEvent(
  input: RelationshipEventInput & { readonly scope: RelationshipScope },
): RelationshipScopeChanged {
  return {
    ...baseEvent(input),
    type: "qep.requirements_relationship.scope_changed",
    scope: input.scope,
  };
}
