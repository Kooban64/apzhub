import type { RelationshipStrength } from "./relationship-strength";
import type { RelationshipType } from "./relationship-type";
import { RELATIONSHIP_TYPES } from "./constants";
import { QepInvariantViolation } from "../../shared/errors";

export type RelationshipCyclePolicy =
  | "forbidden"
  | "default_forbidden_detectable"
  | "permitted"
  | "not_applicable_symmetric";

export type RelationshipRationalePolicy = "optional" | "recommended" | "mandatory";

/**
 * Domain representation of a Relationship Taxonomy Definition (ARCH-005 §22).
 * Normative set is embedded; extension requires governed taxonomy change (Part 2+).
 */
export type RelationshipTaxonomyDefinition = {
  readonly type: RelationshipType;
  readonly displayName: string;
  readonly description: string;
  readonly symmetric: boolean;
  readonly inverseLabel: string;
  readonly cyclePolicy: RelationshipCyclePolicy;
  readonly rationalePolicy: RelationshipRationalePolicy;
  readonly defaultStrength: RelationshipStrength;
  readonly certificationRelevant: boolean | "conditional";
  readonly baselineProjectionDefault: "included" | "optional" | "included_where_relevant";
  readonly strictTraceabilityDefault: boolean;
  readonly highlightInTraceability: boolean;
};

export const NORMATIVE_RELATIONSHIP_TAXONOMY: readonly RelationshipTaxonomyDefinition[] = [
  {
    type: "refines",
    displayName: "Refines",
    description: "Target elaborates or specialises source",
    symmetric: false,
    inverseLabel: "refined_by",
    cyclePolicy: "forbidden",
    rationalePolicy: "optional",
    defaultStrength: "mandatory",
    certificationRelevant: true,
    baselineProjectionDefault: "included",
    strictTraceabilityDefault: true,
    highlightInTraceability: false,
  },
  {
    type: "derives_from",
    displayName: "Derives From",
    description: "Source is derived from target",
    symmetric: false,
    inverseLabel: "derives",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    certificationRelevant: true,
    baselineProjectionDefault: "included",
    strictTraceabilityDefault: true,
    highlightInTraceability: false,
  },
  {
    type: "depends_on",
    displayName: "Depends On",
    description: "Source depends on target for meaning or satisfaction",
    symmetric: false,
    inverseLabel: "dependency_of",
    cyclePolicy: "default_forbidden_detectable",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    certificationRelevant: "conditional",
    baselineProjectionDefault: "included",
    strictTraceabilityDefault: true,
    highlightInTraceability: false,
  },
  {
    type: "constrains",
    displayName: "Constrains",
    description: "Source imposes constraint on target",
    symmetric: false,
    inverseLabel: "constrained_by",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    certificationRelevant: true,
    baselineProjectionDefault: "included",
    strictTraceabilityDefault: true,
    highlightInTraceability: false,
  },
  {
    type: "conflicts_with",
    displayName: "Conflicts With",
    description: "Known or suspected conflict",
    symmetric: true,
    inverseLabel: "conflicts_with",
    cyclePolicy: "not_applicable_symmetric",
    rationalePolicy: "mandatory",
    defaultStrength: "mandatory",
    certificationRelevant: true,
    baselineProjectionDefault: "included",
    strictTraceabilityDefault: true,
    highlightInTraceability: true,
  },
  {
    type: "supersedes",
    displayName: "Supersedes",
    description: "Source replaces target for forward work",
    symmetric: false,
    inverseLabel: "superseded_by",
    cyclePolicy: "forbidden",
    rationalePolicy: "mandatory",
    defaultStrength: "mandatory",
    certificationRelevant: true,
    baselineProjectionDefault: "included_where_relevant",
    strictTraceabilityDefault: true,
    highlightInTraceability: false,
  },
  {
    type: "relates_to",
    displayName: "Relates To",
    description: "Weak associative relationship with mandatory rationale",
    symmetric: false,
    inverseLabel: "related_from",
    cyclePolicy: "permitted",
    rationalePolicy: "mandatory",
    defaultStrength: "informational",
    certificationRelevant: false,
    baselineProjectionDefault: "optional",
    strictTraceabilityDefault: false,
    highlightInTraceability: false,
  },
] as const;

const taxonomyByType = new Map(
  NORMATIVE_RELATIONSHIP_TAXONOMY.map((definition) => [definition.type, definition]),
);

export function getRelationshipTaxonomyDefinition(
  type: RelationshipType,
): RelationshipTaxonomyDefinition {
  const definition = taxonomyByType.get(type);
  if (!definition) {
    throw new QepInvariantViolation(`Unknown relationship taxonomy type: ${type}`);
  }
  return definition;
}

export function assertApprovedTaxonomyType(type: RelationshipType): void {
  if (!(RELATIONSHIP_TYPES as readonly string[]).includes(type)) {
    throw new QepInvariantViolation("Relationship type is not in the approved taxonomy");
  }
  getRelationshipTaxonomyDefinition(type);
}
