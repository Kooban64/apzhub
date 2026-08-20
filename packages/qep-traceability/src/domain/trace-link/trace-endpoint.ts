import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_ENDPOINT_KINDS } from "./constants";

export type TraceEndpointKind = (typeof TRACE_ENDPOINT_KINDS)[number];

/**
 * Value object: typed reference to an artefact (ARCH-007 TraceEndpointReference).
 */
export type TraceEndpointReference = {
  readonly kind: TraceEndpointKind;
  readonly artefactId: string;
  readonly tenantId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
  readonly owningDomain: string;
};

/**
 * Entity: Trace endpoint bound into a Trace Link aggregate.
 */
export type TraceEndpoint = TraceEndpointReference & {
  readonly role: "source" | "target";
};

const KIND_OWNING_DOMAIN: Record<TraceEndpointKind, string> = {
  requirement: "requirements",
  requirement_content_version: "requirements",
  requirement_baseline: "requirements",
  requirement_relationship: "requirements",
  test_specification: "verification",
  test_case: "verification",
  acceptance_criterion: "definition",
  test_execution: "execution",
  evidence: "evidence",
  defect: "defects",
  risk: "risks",
  verification_activity: "verification",
  verification_result: "verification",
  certification_artefact: "certification",
  document: "documents",
  external_reference: "cross_cutting",
  exploratory_session: "experience",
  experience_plan: "experience",
  experience_verification: "experience",
  quality_observation: "experience",
  quality_issue: "experience",
  test_plan: "verification",
  suite: "verification",
  user_story: "definition",
};

const KIND_ID_PREFIX: Partial<Record<TraceEndpointKind, RegExp>> = {
  requirement: /^req_[A-Za-z0-9_-]+$/,
  requirement_content_version: /^rcv_[A-Za-z0-9_-]+$/,
  requirement_baseline: /^rbl_[A-Za-z0-9_-]+$/,
  requirement_relationship: /^rrl_[A-Za-z0-9_-]+$/,
  acceptance_criterion: /^qac[-_][A-Za-z0-9_-]+$/,
};

function assertArtefactIdShape(kind: TraceEndpointKind, artefactId: string): void {
  const prefix = KIND_ID_PREFIX[kind];
  if (prefix && !prefix.test(artefactId)) {
    throw new TraceInvariantViolation(
      `Trace endpoint kind ${kind} requires artefactId matching ${prefix}`,
    );
  }
  if (
    !prefix &&
    !/^[a-z][a-z0-9]*_[A-Za-z0-9_-]+$/.test(artefactId) &&
    kind !== "external_reference"
  ) {
    throw new TraceInvariantViolation(
      `Trace endpoint artefactId must use prefix_id form for kind ${kind}`,
    );
  }
}

export function createTraceEndpointReference(input: {
  readonly kind: string;
  readonly artefactId: string;
  readonly tenantId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
}): TraceEndpointReference {
  const kind = input.kind.trim() as TraceEndpointKind;
  if (!(TRACE_ENDPOINT_KINDS as readonly string[]).includes(kind)) {
    throw new TraceInvariantViolation(
      `Trace endpoint kind must be one of: ${TRACE_ENDPOINT_KINDS.join(", ")}`,
    );
  }
  const tenantId = input.tenantId.trim();
  if (!tenantId) {
    throw new TraceInvariantViolation("Trace endpoint requires tenantId");
  }

  if (kind === "external_reference") {
    const externalUri = input.externalUri?.trim();
    if (!externalUri) {
      throw new TraceInvariantViolation(
        "external_reference endpoint requires externalUri",
      );
    }
    try {
      new URL(externalUri);
    } catch {
      throw new TraceInvariantViolation(
        "external_reference externalUri must be a valid URI",
      );
    }
    const artefactId = input.artefactId.trim();
    if (!artefactId) {
      throw new TraceInvariantViolation(
        "external_reference endpoint requires artefactId",
      );
    }
    return {
      kind,
      artefactId,
      tenantId,
      externalUri,
      owningDomain: KIND_OWNING_DOMAIN[kind],
    };
  }

  const artefactId = input.artefactId.trim();
  if (!artefactId) {
    throw new TraceInvariantViolation("Trace endpoint requires artefactId");
  }
  assertArtefactIdShape(kind, artefactId);

  const contentVersionId = input.contentVersionId?.trim() || undefined;
  const baselineId = input.baselineId?.trim() || undefined;
  if (contentVersionId && !/^rcv_[A-Za-z0-9_-]+$/.test(contentVersionId)) {
    throw new TraceInvariantViolation("Endpoint contentVersionId must start with rcv_");
  }
  if (baselineId && !/^rbl_[A-Za-z0-9_-]+$/.test(baselineId)) {
    throw new TraceInvariantViolation("Endpoint baselineId must start with rbl_");
  }
  if (
    kind === "requirement_content_version" &&
    !contentVersionId &&
    !artefactId.startsWith("rcv_")
  ) {
    throw new TraceInvariantViolation(
      "requirement_content_version endpoint requires contentVersionId or rcv_ artefactId",
    );
  }

  return {
    kind,
    artefactId,
    tenantId,
    contentVersionId,
    baselineId,
    owningDomain: KIND_OWNING_DOMAIN[kind],
  };
}

export function createTraceEndpoint(
  role: "source" | "target",
  input: Parameters<typeof createTraceEndpointReference>[0],
): TraceEndpoint {
  return { ...createTraceEndpointReference(input), role };
}

export function endpointIdentityKey(endpoint: TraceEndpointReference): string {
  return [
    endpoint.kind,
    endpoint.artefactId,
    endpoint.contentVersionId ?? "",
    endpoint.baselineId ?? "",
    endpoint.externalUri ?? "",
  ].join("|");
}

export function assertDistinctTraceEndpoints(
  source: TraceEndpointReference,
  target: TraceEndpointReference,
): void {
  if (source.tenantId !== target.tenantId) {
    throw new TraceInvariantViolation("Trace endpoints must share the same tenant");
  }
  if (endpointIdentityKey(source) === endpointIdentityKey(target)) {
    throw new TraceInvariantViolation("Trace Link must not be self-referential");
  }
}
