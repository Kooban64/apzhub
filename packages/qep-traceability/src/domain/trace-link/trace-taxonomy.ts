import { TraceInvariantViolation } from "../../shared/errors";
import {
  TRACE_CYCLE_POLICIES,
  TRACE_GOVERNANCE_CLASSES,
  TRACE_TYPES,
} from "./constants";
import type { TraceEndpointKind } from "./trace-endpoint";
import type { TraceStrength } from "./trace-strength";
import type { TraceType } from "./trace-type";

export type TraceGovernanceClass = (typeof TRACE_GOVERNANCE_CLASSES)[number];
export type TraceCyclePolicy = (typeof TRACE_CYCLE_POLICIES)[number];
export type TraceRationalePolicy = "optional" | "recommended" | "mandatory";

export type TraceTaxonomyDefinition = {
  readonly type: TraceType;
  readonly displayName: string;
  readonly description: string;
  readonly family: string;
  readonly allowedSourceKinds: readonly TraceEndpointKind[];
  readonly allowedTargetKinds: readonly TraceEndpointKind[];
  readonly directionDefault: "forward" | "reverse" | "symmetric";
  readonly symmetric: boolean;
  readonly governanceClass: TraceGovernanceClass;
  readonly cyclePolicy: TraceCyclePolicy;
  readonly rationalePolicy: TraceRationalePolicy;
  readonly defaultStrength: TraceStrength;
  /** When true, only system_rule / migration origins may create. */
  readonly projectionOnly: boolean;
  readonly allowsSelfLink: boolean;
};

const REQ: TraceEndpointKind[] = ["requirement", "requirement_content_version"];
const SPEC: TraceEndpointKind[] = ["test_specification"];
const CASE: TraceEndpointKind[] = ["test_case"];
const EXEC: TraceEndpointKind[] = ["test_execution"];
const EVID: TraceEndpointKind[] = ["evidence"];
const DEF: TraceEndpointKind[] = ["defect"];
const RISK: TraceEndpointKind[] = ["risk"];
const VERA: TraceEndpointKind[] = ["verification_activity"];
const VERR: TraceEndpointKind[] = ["verification_result"];
const CERT: TraceEndpointKind[] = ["certification_artefact"];
const DOC: TraceEndpointKind[] = ["document"];
const EXT: TraceEndpointKind[] = ["external_reference"];

export const NORMATIVE_TRACE_TAXONOMY: readonly TraceTaxonomyDefinition[] = [
  {
    type: "projects_relationship",
    displayName: "Projects Relationship",
    description: "Projection of an ARCH-005 Requirements Relationship into Trace views",
    family: "requirements_projection",
    allowedSourceKinds: REQ,
    allowedTargetKinds: REQ,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "projection_only",
    cyclePolicy: "allow",
    rationalePolicy: "optional",
    defaultStrength: "informative",
    projectionOnly: true,
    allowsSelfLink: false,
  },
  {
    type: "requirement_specified_by",
    displayName: "Specified By",
    description: "Requirement → Test Specification",
    family: "specification",
    allowedSourceKinds: REQ,
    allowedTargetKinds: SPEC,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_tested_by",
    displayName: "Tested By",
    description: "Requirement → Test Case",
    family: "test_design",
    allowedSourceKinds: REQ,
    allowedTargetKinds: CASE,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_executed_by",
    displayName: "Executed By",
    description: "Requirement → Test Execution",
    family: "execution",
    allowedSourceKinds: REQ,
    allowedTargetKinds: EXEC,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "forbidden",
    rationalePolicy: "optional",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "testcase_executed_by",
    displayName: "Test Case Executed By",
    description: "Test Case → Test Execution",
    family: "execution",
    allowedSourceKinds: CASE,
    allowedTargetKinds: EXEC,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "forbidden",
    rationalePolicy: "optional",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_evidenced_by",
    displayName: "Evidenced By",
    description: "Requirement → Evidence",
    family: "evidence",
    allowedSourceKinds: REQ,
    allowedTargetKinds: EVID,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "execution_evidenced_by",
    displayName: "Execution Evidenced By",
    description: "Execution → Evidence",
    family: "evidence",
    allowedSourceKinds: EXEC,
    allowedTargetKinds: EVID,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "forbidden",
    rationalePolicy: "optional",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_defected_by",
    displayName: "Defected By",
    description: "Requirement → Defect",
    family: "defect",
    allowedSourceKinds: REQ,
    allowedTargetKinds: DEF,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "informative",
    cyclePolicy: "warn",
    rationalePolicy: "recommended",
    defaultStrength: "informative",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "execution_defected_by",
    displayName: "Execution Defected By",
    description: "Execution → Defect",
    family: "defect",
    allowedSourceKinds: EXEC,
    allowedTargetKinds: DEF,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "informative",
    cyclePolicy: "warn",
    rationalePolicy: "optional",
    defaultStrength: "informative",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_risk_related",
    displayName: "Risk Related",
    description: "Requirement → Risk",
    family: "risk",
    allowedSourceKinds: REQ,
    allowedTargetKinds: RISK,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "warn",
    rationalePolicy: "recommended",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_verified_by",
    displayName: "Verified By",
    description: "Requirement → Verification Activity",
    family: "verification",
    allowedSourceKinds: REQ,
    allowedTargetKinds: VERA,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "mandatory",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "activity_produces_result",
    displayName: "Activity Produces Result",
    description: "Verification Activity → Verification Result",
    family: "verification",
    allowedSourceKinds: VERA,
    allowedTargetKinds: VERR,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "forbidden",
    rationalePolicy: "optional",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_certified_by",
    displayName: "Certified By",
    description: "Requirement → Certification Artefact",
    family: "certification",
    allowedSourceKinds: REQ,
    allowedTargetKinds: CERT,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "mandatory_for_coverage",
    cyclePolicy: "forbidden",
    rationalePolicy: "mandatory",
    defaultStrength: "mandatory",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "evidence_supports_certification",
    displayName: "Evidence Supports Certification",
    description: "Evidence → Certification Artefact",
    family: "certification",
    allowedSourceKinds: EVID,
    allowedTargetKinds: CERT,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "recommended",
    cyclePolicy: "forbidden",
    rationalePolicy: "recommended",
    defaultStrength: "recommended",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_documented_by",
    displayName: "Documented By",
    description: "Requirement → Document",
    family: "documents",
    allowedSourceKinds: REQ,
    allowedTargetKinds: DOC,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "informative",
    cyclePolicy: "allow",
    rationalePolicy: "optional",
    defaultStrength: "informative",
    projectionOnly: false,
    allowsSelfLink: false,
  },
  {
    type: "requirement_references_external",
    displayName: "References External",
    description: "Requirement → External Reference",
    family: "external",
    allowedSourceKinds: REQ,
    allowedTargetKinds: EXT,
    directionDefault: "forward",
    symmetric: false,
    governanceClass: "informative",
    cyclePolicy: "allow",
    rationalePolicy: "recommended",
    defaultStrength: "informative",
    projectionOnly: false,
    allowsSelfLink: false,
  },
];

export function assertNormativeTaxonomyComplete(): void {
  const taxonomyTypes = new Set(NORMATIVE_TRACE_TAXONOMY.map((d) => d.type));
  for (const type of TRACE_TYPES) {
    if (!taxonomyTypes.has(type)) {
      throw new TraceInvariantViolation(`Missing taxonomy definition for Trace Type ${type}`);
    }
  }
}

export function getTraceTaxonomyDefinition(type: TraceType): TraceTaxonomyDefinition {
  const definition = NORMATIVE_TRACE_TAXONOMY.find((entry) => entry.type === type);
  if (!definition) {
    throw new TraceInvariantViolation(`Unknown Trace Type: ${type}`);
  }
  return definition;
}

export function assertApprovedTraceType(type: TraceType): void {
  getTraceTaxonomyDefinition(type);
}

/** Reserved for future taxonomy extensions without changing core semantics. */
export function assertTraceTypeExtensibility(type: string): void {
  if (!type.trim()) {
    throw new TraceInvariantViolation("Trace type extension key must not be empty");
  }
}
