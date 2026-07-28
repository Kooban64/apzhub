import { QepInvariantViolation } from "../../shared/errors";
import {
  createRelationshipClassification,
  type RelationshipClassification,
} from "./relationship-classification";
import {
  createRelationshipCriticality,
  type RelationshipCriticality,
} from "./relationship-criticality";
import {
  createRelationshipDirection,
  type RelationshipDirection,
} from "./relationship-direction";
import {
  assertDistinctEndpoints,
  createRelationshipEndpoint,
  type RelationshipEndpoint,
} from "./relationship-endpoint";
import {
  buildRelationshipActivatedEvent,
  buildRelationshipClassificationChangedEvent,
  buildRelationshipCreatedEvent,
  buildRelationshipDeprecatedEvent,
  buildRelationshipRationaleChangedEvent,
  buildRelationshipRetiredEvent,
  buildRelationshipScopeChangedEvent,
  buildRelationshipSemanticProfileChangedEvent,
  buildRelationshipStrengthChangedEvent,
  buildRelationshipSupersededEvent,
  type RequirementsRelationshipDomainEvent,
} from "./relationship-events";
import { createRelationshipId, type RelationshipId } from "./relationship-id";
import {
  assertRelationshipLifecycleTransition,
  type RelationshipLifecycleState,
} from "./relationship-lifecycle-state";
import {
  createRelationshipRationale,
  type RelationshipRationale,
} from "./relationship-rationale";
import { createRelationshipScope, type RelationshipScope } from "./relationship-scope";
import {
  buildRelationshipSemanticProfile,
  type RelationshipSemanticProfile,
} from "./relationship-semantic-profile";
import {
  createRelationshipStrength,
  type RelationshipStrength,
} from "./relationship-strength";
import { createRelationshipType, type RelationshipType } from "./relationship-type";
import {
  validateRelationshipForActivation,
  defaultStrengthForType,
  type RelationshipActivationContext,
} from "./relationship-domain-service";
import {
  assertBaselineInteractionRules,
  assertRelationshipDraftMutable,
  assertRelationshipNotRetired,
  assertRelationshipProfileMutable,
  assertRationalePolicy,
  assertTaxonomyType,
  canonicaliseSymmetricDirection,
} from "./relationship-policy";
import { getRelationshipTaxonomyDefinition } from "./relationship-taxonomy";

export type RelationshipHistoryEntry = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

/**
 * Relationship entity — first-class governed semantic fact (ARCH-005).
 */
export type Relationship = {
  readonly id: RelationshipId;
  readonly tenantId: string;
  readonly type: RelationshipType;
  readonly direction: RelationshipDirection;
  readonly lifecycleState: RelationshipLifecycleState;
  readonly strength: RelationshipStrength;
  readonly criticality: RelationshipCriticality;
  readonly classification: RelationshipClassification;
  readonly scope: RelationshipScope;
  readonly rationale?: RelationshipRationale;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly activatedAt?: string;
  readonly activatedBy?: string;
  readonly deprecatedAt?: string;
  readonly deprecatedBy?: string;
  readonly retiredAt?: string;
  readonly retiredBy?: string;
  /** Append-only domain history; never rewritten or deleted. */
  readonly history: readonly RelationshipHistoryEntry[];
  /** Pending domain events from the last command (not messaging infrastructure). */
  readonly domainEvents: readonly RequirementsRelationshipDomainEvent[];
};

/** Aggregate root alias required by APZQEP-ENG-020F. */
export type RequirementsRelationship = Relationship;

export type CreateRequirementsRelationshipInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly type: string;
  readonly source: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  };
  readonly target: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  };
  readonly strength?: string;
  readonly criticality?: string;
  readonly classification?: string;
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly rationale?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId: string;
};

function appendHistory(
  history: readonly RelationshipHistoryEntry[],
  entry: RelationshipHistoryEntry,
): readonly RelationshipHistoryEntry[] {
  return [...history, entry];
}

function clearEvents(relationship: Relationship): Relationship {
  return { ...relationship, domainEvents: [] };
}

function withChange(
  relationship: Relationship,
  patch: Partial<Relationship>,
  changedAt: string,
  changedBy: string,
  historyKind: string,
  historySummary: string,
  events: readonly RequirementsRelationshipDomainEvent[],
): Relationship {
  assertRelationshipNotRetired(relationship.lifecycleState);
  const at = changedAt.trim();
  const by = changedBy.trim();
  if (!at || !by) {
    throw new QepInvariantViolation(
      "Relationship change requires changedAt and changedBy",
    );
  }
  return {
    ...relationship,
    ...patch,
    updatedAt: at,
    updatedBy: by,
    history: appendHistory(relationship.history, {
      at,
      by,
      kind: historyKind,
      summary: historySummary,
    }),
    domainEvents: [...relationship.domainEvents, ...events],
  };
}

function buildEndpoints(
  tenantId: string,
  sourceInput: CreateRequirementsRelationshipInput["source"],
  targetInput: CreateRequirementsRelationshipInput["target"],
  type: RelationshipType,
): RelationshipDirection {
  const source = createRelationshipEndpoint({ ...sourceInput, tenantId });
  const target = createRelationshipEndpoint({ ...targetInput, tenantId });
  assertDistinctEndpoints(source, target);
  const canonical = canonicaliseSymmetricDirection(type, source, target);
  return createRelationshipDirection(canonical.source, canonical.target);
}

/**
 * Creates a Requirements Relationship aggregate exclusively in `draft`.
 */
export function createRequirementsRelationship(
  input: CreateRequirementsRelationshipInput,
): RequirementsRelationship {
  const tenantId = input.tenantId.trim();
  const createdAt = input.createdAt.trim();
  const createdBy = input.createdBy.trim();
  const correlationId = input.correlationId.trim();
  if (!tenantId || !createdAt || !createdBy || !correlationId) {
    throw new QepInvariantViolation(
      "Requirements relationship requires tenantId, createdAt, createdBy, and correlationId",
    );
  }

  assertBaselineInteractionRules({});

  const type = createRelationshipType(input.type);
  assertTaxonomyType(type);
  const taxonomy = getRelationshipTaxonomyDefinition(type);
  const direction = buildEndpoints(tenantId, input.source, input.target, type);
  const strength = createRelationshipStrength(
    input.strength ?? taxonomy.defaultStrength,
  );
  const criticality = createRelationshipCriticality(input.criticality ?? "medium");
  const classification = createRelationshipClassification(
    input.classification ?? "structural",
  );
  const scope = createRelationshipScope(input.scope ?? { kind: "product" });
  const rationale =
    input.rationale !== undefined
      ? createRelationshipRationale(input.rationale)
      : undefined;

  // Draft may defer mandatory rationale until activation, except we still accept create;
  // activation enforces rationale policy. Soft-check recommended types do not fail create.
  void taxonomy;

  const id = createRelationshipId(input.id);
  const relationship: Relationship = {
    id,
    tenantId,
    type,
    direction,
    lifecycleState: "draft",
    strength,
    criticality,
    classification,
    scope,
    ...(rationale !== undefined ? { rationale } : {}),
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    correlationId,
    history: [
      {
        at: createdAt,
        by: createdBy,
        kind: "created",
        summary: `Created draft ${type} relationship`,
      },
    ],
    domainEvents: [
      buildRelationshipCreatedEvent({
        tenantId,
        relationshipId: id,
        correlationId,
        occurredAt: createdAt,
        relationshipType: type,
        lifecycleState: "draft",
      }),
    ],
  };
  return relationship;
}

export type ActivateRequirementsRelationshipContext = Omit<
  RelationshipActivationContext,
  | "tenantId"
  | "relationshipId"
  | "type"
  | "source"
  | "target"
  | "scope"
  | "strength"
  | "classification"
  | "rationale"
>;

export function activateRequirementsRelationship(
  relationship: RequirementsRelationship,
  changedAt: string,
  changedBy: string,
  context: ActivateRequirementsRelationshipContext,
): RequirementsRelationship {
  assertRelationshipLifecycleTransition(relationship.lifecycleState, "active");
  assertRationalePolicy(relationship.type, relationship.rationale);

  const canonical = validateRelationshipForActivation({
    tenantId: relationship.tenantId,
    relationshipId: relationship.id,
    type: relationship.type,
    source: relationship.direction.source,
    target: relationship.direction.target,
    scope: relationship.scope,
    strength: relationship.strength,
    classification: relationship.classification,
    rationale: relationship.rationale,
    ...context,
  });

  const at = changedAt.trim();
  const by = changedBy.trim();
  if (!at || !by) {
    throw new QepInvariantViolation("Activation requires changedAt and changedBy");
  }

  const direction = createRelationshipDirection(canonical.source, canonical.target);
  const events: RequirementsRelationshipDomainEvent[] = [
    buildRelationshipActivatedEvent({
      tenantId: relationship.tenantId,
      relationshipId: relationship.id,
      correlationId: relationship.correlationId,
      occurredAt: at,
    }),
  ];
  if (relationship.type === "supersedes") {
    events.push(
      buildRelationshipSupersededEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: at,
        supersededRequirementId: direction.target.requirementId,
        successorRequirementId: direction.source.requirementId,
      }),
    );
  }

  return {
    ...clearEvents(relationship),
    direction,
    lifecycleState: "active",
    updatedAt: at,
    updatedBy: by,
    activatedAt: at,
    activatedBy: by,
    history: appendHistory(relationship.history, {
      at,
      by,
      kind: "activated",
      summary: "Relationship activated",
    }),
    domainEvents: events,
  };
}

export function deprecateRequirementsRelationship(
  relationship: RequirementsRelationship,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipLifecycleTransition(relationship.lifecycleState, "deprecated");
  const at = changedAt.trim();
  const by = changedBy.trim();
  if (!at || !by) {
    throw new QepInvariantViolation("Deprecation requires changedAt and changedBy");
  }
  return {
    ...clearEvents(relationship),
    lifecycleState: "deprecated",
    updatedAt: at,
    updatedBy: by,
    deprecatedAt: at,
    deprecatedBy: by,
    history: appendHistory(relationship.history, {
      at,
      by,
      kind: "deprecated",
      summary: "Relationship deprecated",
    }),
    domainEvents: [
      buildRelationshipDeprecatedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: at,
      }),
    ],
  };
}

export function retireRequirementsRelationship(
  relationship: RequirementsRelationship,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipLifecycleTransition(relationship.lifecycleState, "retired");
  const at = changedAt.trim();
  const by = changedBy.trim();
  if (!at || !by) {
    throw new QepInvariantViolation("Retirement requires changedAt and changedBy");
  }
  return {
    ...clearEvents(relationship),
    lifecycleState: "retired",
    updatedAt: at,
    updatedBy: by,
    retiredAt: at,
    retiredBy: by,
    history: appendHistory(relationship.history, {
      at,
      by,
      kind: "retired",
      summary: "Relationship retired — historical fact retained",
    }),
    domainEvents: [
      buildRelationshipRetiredEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: at,
      }),
    ],
  };
}

export function changeRelationshipRationale(
  relationship: RequirementsRelationship,
  rationale: string,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  const next = createRelationshipRationale(rationale);
  return withChange(
    clearEvents(relationship),
    { rationale: next },
    changedAt,
    changedBy,
    "rationale_changed",
    "Rationale changed",
    [
      buildRelationshipRationaleChangedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: changedAt.trim(),
      }),
    ],
  );
}

export function changeRelationshipStrength(
  relationship: RequirementsRelationship,
  strength: string,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  const next = createRelationshipStrength(strength);
  return withChange(
    clearEvents(relationship),
    { strength: next },
    changedAt,
    changedBy,
    "strength_changed",
    `Strength changed to ${next}`,
    [
      buildRelationshipStrengthChangedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: changedAt.trim(),
        strength: next,
      }),
    ],
  );
}

export function changeRelationshipClassification(
  relationship: RequirementsRelationship,
  classification: string,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  const next = createRelationshipClassification(classification);
  return withChange(
    clearEvents(relationship),
    { classification: next },
    changedAt,
    changedBy,
    "classification_changed",
    `Classification changed to ${next}`,
    [
      buildRelationshipClassificationChangedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: changedAt.trim(),
        classification: next,
      }),
    ],
  );
}

export function changeRelationshipCriticality(
  relationship: RequirementsRelationship,
  criticality: string,
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  const next = createRelationshipCriticality(criticality);
  return withChange(
    clearEvents(relationship),
    { criticality: next },
    changedAt,
    changedBy,
    "criticality_changed",
    `Criticality changed to ${next}`,
    [],
  );
}

export function changeRelationshipScope(
  relationship: RequirementsRelationship,
  scope: { readonly kind: string; readonly referenceId?: string },
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  const next = createRelationshipScope(scope);
  return withChange(
    clearEvents(relationship),
    { scope: next },
    changedAt,
    changedBy,
    "scope_changed",
    `Scope changed to ${next.kind}`,
    [
      buildRelationshipScopeChangedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: changedAt.trim(),
        scope: next,
      }),
    ],
  );
}

export function changeRelationshipSemanticProfile(
  relationship: RequirementsRelationship,
  input: {
    readonly strength?: string;
    readonly criticality?: string;
    readonly classification?: string;
    readonly scope?: { readonly kind: string; readonly referenceId?: string };
    readonly rationale?: string;
  },
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipProfileMutable(relationship.lifecycleState);
  let next: Relationship = clearEvents(relationship);
  if (input.strength !== undefined) {
    next = { ...next, strength: createRelationshipStrength(input.strength) };
  }
  if (input.criticality !== undefined) {
    next = { ...next, criticality: createRelationshipCriticality(input.criticality) };
  }
  if (input.classification !== undefined) {
    next = {
      ...next,
      classification: createRelationshipClassification(input.classification),
    };
  }
  if (input.scope !== undefined) {
    next = { ...next, scope: createRelationshipScope(input.scope) };
  }
  if (input.rationale !== undefined) {
    next = { ...next, rationale: createRelationshipRationale(input.rationale) };
  }
  if (next.lifecycleState === "active") {
    assertRationalePolicy(next.type, next.rationale);
  }
  const profile = getRelationshipSemanticProfile(next);
  return withChange(
    next,
    {},
    changedAt,
    changedBy,
    "semantic_profile_changed",
    "Semantic profile changed",
    [
      buildRelationshipSemanticProfileChangedEvent({
        tenantId: relationship.tenantId,
        relationshipId: relationship.id,
        correlationId: relationship.correlationId,
        occurredAt: changedAt.trim(),
        profile,
      }),
    ],
  );
}

/** Draft-only: replace endpoints (reversing meaning requires explicit replace). */
export function changeRelationshipEndpoints(
  relationship: RequirementsRelationship,
  source: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  },
  target: {
    readonly mode: string;
    readonly requirementId: string;
    readonly contentVersionId?: string;
  },
  changedAt: string,
  changedBy: string,
): RequirementsRelationship {
  assertRelationshipDraftMutable(relationship.lifecycleState);
  const direction = buildEndpoints(
    relationship.tenantId,
    source,
    target,
    relationship.type,
  );
  return withChange(
    clearEvents(relationship),
    { direction },
    changedAt,
    changedBy,
    "endpoints_changed",
    "Endpoints changed while draft",
    [],
  );
}

export function getRelationshipSemanticProfile(
  relationship: Pick<
    Relationship,
    | "type"
    | "direction"
    | "lifecycleState"
    | "strength"
    | "criticality"
    | "classification"
    | "scope"
    | "rationale"
  >,
): RelationshipSemanticProfile {
  return buildRelationshipSemanticProfile({
    type: relationship.type,
    direction: relationship.direction,
    lifecycleState: relationship.lifecycleState,
    strength: relationship.strength,
    criticality: relationship.criticality,
    classification: relationship.classification,
    scope: relationship.scope,
    rationale: relationship.rationale,
  });
}

export function toRelationshipEdgeFact(relationship: Relationship) {
  return {
    relationshipId: relationship.id as string,
    type: relationship.type,
    source: relationship.direction.source,
    target: relationship.direction.target,
    scope: relationship.scope,
    lifecycleState: relationship.lifecycleState,
  };
}

export { defaultStrengthForType };
export type { RelationshipEndpoint };
