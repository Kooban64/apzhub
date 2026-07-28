import { TraceConflictError, TraceInvariantViolation } from "../../shared/errors";
import {
  assertDistinctTraceEndpoints,
  endpointIdentityKey,
  type TraceEndpointReference,
} from "./trace-endpoint";
import type { TraceAuthority } from "./trace-authority";
import type { TraceConfidence } from "./trace-confidence";
import type { TraceLifecycleState } from "./trace-lifecycle-state";
import type { TraceOrigin } from "./trace-origin";
import type { TraceProvenance } from "./trace-provenance";
import type { TraceRationale } from "./trace-rationale";
import { createTraceRationale } from "./trace-rationale";
import type { TraceScope } from "./trace-scope";
import { traceScopeKey } from "./trace-scope";
import type { TraceType } from "./trace-type";
import { assertApprovedTraceType, getTraceTaxonomyDefinition } from "./trace-taxonomy";
import type { TraceContext } from "./trace-context";

/** Persistence-independent edge fact for duplicate / cycle checks. */
export type TraceEdgeFact = {
  readonly traceId: string;
  readonly type: TraceType;
  readonly source: TraceEndpointReference;
  readonly target: TraceEndpointReference;
  readonly scope: TraceScope;
  readonly lifecycleState: TraceLifecycleState;
};

export type EndpointExistenceFact = {
  readonly tenantId: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly exists: boolean;
  readonly owningDomain?: string;
};

export function assertTaxonomyType(type: TraceType): void {
  assertApprovedTraceType(type);
}

export function assertEndpointPair(
  source: TraceEndpointReference,
  target: TraceEndpointReference,
  tenantId: string,
  type: TraceType,
): void {
  if (source.tenantId !== tenantId || target.tenantId !== tenantId) {
    throw new TraceInvariantViolation(
      "Trace Link and endpoints must share the same tenant",
    );
  }
  const taxonomy = getTraceTaxonomyDefinition(type);
  if (!taxonomy.allowsSelfLink) {
    assertDistinctTraceEndpoints(source, target);
  }
  if (!taxonomy.allowedSourceKinds.includes(source.kind)) {
    throw new TraceInvariantViolation(
      `Trace type ${type} does not allow source kind ${source.kind}`,
    );
  }
  if (!taxonomy.allowedTargetKinds.includes(target.kind)) {
    throw new TraceInvariantViolation(
      `Trace type ${type} does not allow target kind ${target.kind}`,
    );
  }
}

export function assertCrossDomainOwnership(
  source: TraceEndpointReference,
  target: TraceEndpointReference,
  type: TraceType,
): void {
  const taxonomy = getTraceTaxonomyDefinition(type);
  if (!taxonomy.allowedSourceKinds.includes(source.kind)) {
    throw new TraceInvariantViolation(
      `Invalid ownership: source domain ${source.owningDomain} not allowed for ${type}`,
    );
  }
  if (!taxonomy.allowedTargetKinds.includes(target.kind)) {
    throw new TraceInvariantViolation(
      `Invalid ownership: target domain ${target.owningDomain} not allowed for ${type}`,
    );
  }
}

export function assertEndpointExistence(
  source: TraceEndpointReference,
  target: TraceEndpointReference,
  facts: readonly EndpointExistenceFact[],
): void {
  for (const endpoint of [source, target]) {
    if (endpoint.kind === "external_reference") {
      continue;
    }
    const fact = facts.find(
      (entry) =>
        entry.tenantId === endpoint.tenantId &&
        entry.kind === endpoint.kind &&
        entry.artefactId === endpoint.artefactId,
    );
    if (!fact || !fact.exists) {
      throw new TraceInvariantViolation(
        `Trace endpoint does not exist: ${endpoint.kind}:${endpoint.artefactId}`,
      );
    }
  }
}

export function assertAuthority(authority: TraceAuthority): void {
  if (!authority.actorId.trim()) {
    throw new TraceInvariantViolation("Trace authority is required");
  }
}

export function assertProvenance(provenance: TraceProvenance): void {
  if (!provenance.actorId.trim() || !provenance.correlationId.trim()) {
    throw new TraceInvariantViolation("Trace provenance is required");
  }
}

export function assertConfidenceForOrigin(
  confidence: TraceConfidence,
  origin: TraceOrigin,
): void {
  if (origin === "ai_suggestion") {
    if (confidence === "authoritative") {
      throw new TraceInvariantViolation(
        "AI-suggested traces cannot have authoritative confidence",
      );
    }
  }
  if (origin === "user" && confidence === "inferred") {
    throw new TraceInvariantViolation(
      "User-origin traces must not use inferred confidence",
    );
  }
}

export function assertOriginForProjection(type: TraceType, origin: TraceOrigin): void {
  const taxonomy = getTraceTaxonomyDefinition(type);
  if (taxonomy.projectionOnly && origin !== "system_rule" && origin !== "migration") {
    throw new TraceInvariantViolation(
      `Projection-only Trace Type ${type} may only be created by system_rule or migration`,
    );
  }
}

export function assertScope(scope: TraceScope): void {
  if (scope.kind !== "tenant_global" && !scope.referenceId) {
    throw new TraceInvariantViolation(`Trace scope ${scope.kind} requires referenceId`);
  }
}

export function assertRationalePolicy(
  type: TraceType,
  rationale: TraceRationale | undefined,
): void {
  const taxonomy = getTraceTaxonomyDefinition(type);
  if (taxonomy.rationalePolicy === "mandatory" && !rationale) {
    throw new TraceInvariantViolation(`Trace type ${type} requires rationale`);
  }
  if (rationale) {
    createTraceRationale(rationale);
  }
}

export function assertTraceMutable(state: TraceLifecycleState): void {
  if (state === "retired" || state === "superseded") {
    throw new TraceInvariantViolation(`Trace Link in ${state} state is immutable`);
  }
}

export function assertTraceDraftOrValidated(state: TraceLifecycleState): void {
  if (state !== "draft" && state !== "validated") {
    throw new TraceInvariantViolation(
      "Endpoint changes are only permitted in draft or validated states",
    );
  }
}

export function assertHistoricalContextMutable(context: TraceContext): void {
  if (context.immutable) {
    throw new TraceInvariantViolation(
      "Immutable Trace context (Baseline-bound) forbids mutation",
    );
  }
}

export function assertDuplicateTrace(
  candidate: {
    readonly type: TraceType;
    readonly source: TraceEndpointReference;
    readonly target: TraceEndpointReference;
    readonly scope: TraceScope;
  },
  existing: readonly TraceEdgeFact[],
  excludeTraceId?: string,
): void {
  for (const edge of existing) {
    if (excludeTraceId && edge.traceId === excludeTraceId) {
      continue;
    }
    if (edge.lifecycleState === "retired" || edge.lifecycleState === "superseded") {
      continue;
    }
    if (
      edge.type === candidate.type &&
      endpointIdentityKey(edge.source) === endpointIdentityKey(candidate.source) &&
      endpointIdentityKey(edge.target) === endpointIdentityKey(candidate.target) &&
      traceScopeKey(edge.scope) === traceScopeKey(candidate.scope)
    ) {
      throw new TraceConflictError(
        `Duplicate Trace Link already exists: ${edge.traceId}`,
      );
    }
  }
}

/**
 * Detects a directed cycle if adding source→target would close a path.
 * Facts are in-memory only (persistence-independent).
 */
export function assertCircularTracePolicy(
  type: TraceType,
  source: TraceEndpointReference,
  target: TraceEndpointReference,
  existing: readonly TraceEdgeFact[],
): void {
  const taxonomy = getTraceTaxonomyDefinition(type);
  if (taxonomy.cyclePolicy === "allow") {
    return;
  }

  const sourceKey = endpointIdentityKey(source);
  const targetKey = endpointIdentityKey(target);
  const adjacency = new Map<string, string[]>();

  for (const edge of existing) {
    if (edge.type !== type) {
      continue;
    }
    if (edge.lifecycleState === "retired" || edge.lifecycleState === "superseded") {
      continue;
    }
    const from = endpointIdentityKey(edge.source);
    const to = endpointIdentityKey(edge.target);
    const list = adjacency.get(from) ?? [];
    list.push(to);
    adjacency.set(from, list);
  }

  const queue = [targetKey];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);
    if (current === sourceKey) {
      if (taxonomy.cyclePolicy === "forbidden") {
        throw new TraceInvariantViolation(
          `Circular Trace Link forbidden for type ${type}`,
        );
      }
      // cyclePolicy === "warn": detected but permitted (application may surface warning later)
      return;
    }
    for (const next of adjacency.get(current) ?? []) {
      queue.push(next);
    }
  }
}

export function assertAiAuthorityPromotion(
  origin: TraceOrigin,
  confidence: TraceConfidence,
  targetState: TraceLifecycleState,
): void {
  if (
    origin === "ai_suggestion" &&
    (targetState === "approved" || confidence === "authoritative")
  ) {
    throw new TraceInvariantViolation(
      "AI-suggested traces cannot be approved or marked authoritative without origin change",
    );
  }
}
