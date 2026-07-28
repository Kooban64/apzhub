import { TraceInvariantViolation } from "../../shared/errors";
import { createTraceAuthority, type TraceAuthority } from "./trace-authority";
import { createTraceConfidence, type TraceConfidence } from "./trace-confidence";
import { createTraceContext, type TraceContext } from "./trace-context";
import { createTraceEndpoint, type TraceEndpoint } from "./trace-endpoint";
import { createTraceDirection, type TraceDirection } from "./trace-direction";
import {
  buildTraceApprovedEvent,
  buildTraceAuthorityChangedEvent,
  buildTraceConfidenceChangedEvent,
  buildTraceCreatedEvent,
  buildTraceEndpointChangedEvent,
  buildTraceOriginChangedEvent,
  buildTraceRetiredEvent,
  buildTraceScopeChangedEvent,
  buildTraceSupersededEvent,
  buildTraceValidatedEvent,
  type TraceLinkDomainEvent,
} from "./trace-link-events";
import { createTraceId, type TraceId } from "./trace-id";
import {
  assertTraceLifecycleTransition,
  type TraceLifecycleState,
} from "./trace-lifecycle-state";
import {
  appendTraceHistory,
  createEmptyTraceHistory,
  type TraceHistory,
} from "./trace-history";
import {
  createTraceMetadata,
  mergeTraceMetadata,
  type TraceMetadata,
} from "./trace-metadata";
import { createTraceOrigin, type TraceOrigin } from "./trace-origin";
import { createTraceProvenance, type TraceProvenance } from "./trace-provenance";
import { createTraceRationale, type TraceRationale } from "./trace-rationale";
import { createTraceScope, type TraceScope } from "./trace-scope";
import { createTraceStrength, type TraceStrength } from "./trace-strength";
import { createTraceType, type TraceType } from "./trace-type";
import {
  defaultStrengthForTraceType,
  validateTraceLinkForValidation,
  validateTraceLinkStructure,
  type TraceValidationContext,
} from "./trace-domain-service";
import {
  assertAiAuthorityPromotion,
  assertAuthority,
  assertConfidenceForOrigin,
  assertHistoricalContextMutable,
  assertProvenance,
  assertTraceDraftOrValidated,
  assertTraceMutable,
  assertTaxonomyType,
} from "./trace-policy";
import { getTraceTaxonomyDefinition } from "./trace-taxonomy";

/**
 * TraceLink aggregate — governed cross-domain lineage edge (ARCH-007 / ENG-030A).
 */
export type TraceLink = {
  readonly id: TraceId;
  readonly tenantId: string;
  readonly type: TraceType;
  readonly direction: TraceDirection;
  readonly source: TraceEndpoint;
  readonly target: TraceEndpoint;
  readonly lifecycleState: TraceLifecycleState;
  readonly strength: TraceStrength;
  readonly confidence: TraceConfidence;
  readonly origin: TraceOrigin;
  readonly authority: TraceAuthority;
  readonly provenance: TraceProvenance;
  readonly scope: TraceScope;
  readonly context: TraceContext;
  readonly rationale?: TraceRationale;
  readonly metadata: TraceMetadata;
  readonly history: TraceHistory;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly validatedAt?: string;
  readonly validatedBy?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly retiredAt?: string;
  readonly retiredBy?: string;
  readonly supersededAt?: string;
  readonly supersededBy?: string;
  readonly successorTraceId?: TraceId;
  readonly domainEvents: readonly TraceLinkDomainEvent[];
};

export type CreateTraceLinkInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly type: string;
  readonly source: {
    readonly kind: string;
    readonly artefactId: string;
    readonly contentVersionId?: string;
    readonly baselineId?: string;
    readonly externalUri?: string;
  };
  readonly target: {
    readonly kind: string;
    readonly artefactId: string;
    readonly contentVersionId?: string;
    readonly baselineId?: string;
    readonly externalUri?: string;
  };
  readonly direction?: string;
  readonly strength?: string;
  readonly confidence?: string;
  readonly origin?: string;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly provenance: {
    readonly actorId: string;
    readonly correlationId: string;
    readonly sourceSystem?: string;
    readonly importBatchId?: string;
    readonly rationaleRef?: string;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly rationale?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId: string;
};

function clearEvents(trace: TraceLink): TraceLink {
  return { ...trace, domainEvents: [] };
}

function withChange(
  trace: TraceLink,
  patch: Partial<TraceLink>,
  changedAt: string,
  changedBy: string,
  historyKind: string,
  historySummary: string,
  events: readonly TraceLinkDomainEvent[],
): TraceLink {
  assertTraceMutable(trace.lifecycleState);
  assertHistoricalContextMutable(trace.context);
  const at = changedAt.trim();
  const by = changedBy.trim();
  if (!at || !by) {
    throw new TraceInvariantViolation("Trace change requires changedAt and changedBy");
  }
  return {
    ...trace,
    ...patch,
    revision: trace.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendTraceHistory(trace.history, {
      at,
      by,
      kind: historyKind,
      summary: historySummary,
    }),
    domainEvents: [...trace.domainEvents, ...events],
  };
}

/**
 * Creates a Trace Link aggregate exclusively in `draft`.
 */
export function createTraceLink(input: CreateTraceLinkInput): TraceLink {
  const tenantId = input.tenantId.trim();
  const createdAt = input.createdAt.trim();
  const createdBy = input.createdBy.trim();
  const correlationId = input.correlationId.trim();
  if (!tenantId || !createdAt || !createdBy || !correlationId) {
    throw new TraceInvariantViolation(
      "Trace Link requires tenantId, createdAt, createdBy, and correlationId",
    );
  }

  const id = createTraceId(input.id);
  const type = createTraceType(input.type);
  assertTaxonomyType(type);
  const taxonomy = getTraceTaxonomyDefinition(type);

  const source = createTraceEndpoint("source", { ...input.source, tenantId });
  const target = createTraceEndpoint("target", { ...input.target, tenantId });
  const origin = createTraceOrigin(input.origin ?? "user");
  const confidence = createTraceConfidence(
    input.confidence ?? (origin === "ai_suggestion" ? "provisional" : "asserted"),
  );
  const authority = createTraceAuthority(input.authority);
  const provenance = createTraceProvenance({
    ...input.provenance,
    correlationId: input.provenance.correlationId || correlationId,
  });
  const scope = createTraceScope(input.scope ?? { kind: "tenant_global" });
  const context = createTraceContext(input.context);
  const rationale = input.rationale ? createTraceRationale(input.rationale) : undefined;
  const strength = createTraceStrength(
    input.strength ?? defaultStrengthForTraceType(type),
  );
  const direction = createTraceDirection(input.direction ?? taxonomy.directionDefault);
  const metadata = createTraceMetadata(input.metadata);

  assertAuthority(authority);
  assertProvenance(provenance);
  assertConfidenceForOrigin(confidence, origin);

  validateTraceLinkStructure({
    tenantId,
    type,
    source,
    target,
    scope,
    origin,
    rationale,
  });

  const history = appendTraceHistory(createEmptyTraceHistory(), {
    at: createdAt,
    by: createdBy,
    kind: "created",
    summary: `Trace Link created as draft (${type})`,
  });

  const createdEvent = buildTraceCreatedEvent({
    tenantId,
    traceId: id,
    correlationId,
    occurredAt: createdAt,
    traceType: type,
    lifecycleState: "draft",
  });

  return {
    id,
    tenantId,
    type,
    direction,
    source,
    target,
    lifecycleState: "draft",
    strength,
    confidence,
    origin,
    authority,
    provenance,
    scope,
    context,
    rationale,
    metadata,
    history,
    revision: 1,
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    correlationId,
    domainEvents: [createdEvent],
  };
}

export function validateTraceLink(
  trace: TraceLink,
  changedAt: string,
  changedBy: string,
  context: Omit<
    TraceValidationContext,
    "tenantId" | "type" | "source" | "target" | "scope" | "origin" | "rationale"
  >,
): TraceLink {
  const base = clearEvents(trace);
  assertTraceLifecycleTransition(base.lifecycleState, "validated");
  validateTraceLinkForValidation({
    tenantId: base.tenantId,
    type: base.type,
    source: base.source,
    target: base.target,
    scope: base.scope,
    origin: base.origin,
    rationale: base.rationale,
    existingEdges: context.existingEdges,
    endpointFacts: context.endpointFacts,
    excludeTraceId: base.id,
  });

  const at = changedAt.trim();
  const by = changedBy.trim();
  return {
    ...base,
    lifecycleState: "validated",
    validatedAt: at,
    validatedBy: by,
    revision: base.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendTraceHistory(base.history, {
      at,
      by,
      kind: "validated",
      summary: "Trace Link validated",
    }),
    domainEvents: [
      buildTraceValidatedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: at,
      }),
    ],
  };
}

export function approveTraceLink(
  trace: TraceLink,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  assertTraceLifecycleTransition(base.lifecycleState, "approved");
  assertAiAuthorityPromotion(base.origin, base.confidence, "approved");
  assertHistoricalContextMutable(base.context);

  const at = changedAt.trim();
  const by = changedBy.trim();
  return {
    ...base,
    lifecycleState: "approved",
    approvedAt: at,
    approvedBy: by,
    revision: base.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendTraceHistory(base.history, {
      at,
      by,
      kind: "approved",
      summary: "Trace Link approved",
    }),
    domainEvents: [
      buildTraceApprovedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: at,
      }),
    ],
  };
}

export function retireTraceLink(
  trace: TraceLink,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  assertTraceLifecycleTransition(base.lifecycleState, "retired");

  const at = changedAt.trim();
  const by = changedBy.trim();
  return {
    ...base,
    lifecycleState: "retired",
    retiredAt: at,
    retiredBy: by,
    revision: base.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendTraceHistory(base.history, {
      at,
      by,
      kind: "retired",
      summary: "Trace Link retired",
    }),
    domainEvents: [
      buildTraceRetiredEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: at,
      }),
    ],
  };
}

export function supersedeTraceLink(
  trace: TraceLink,
  successorTraceId: string,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  assertTraceLifecycleTransition(base.lifecycleState, "superseded");
  const successor = createTraceId(successorTraceId);
  if (successor === base.id) {
    throw new TraceInvariantViolation("Trace Link cannot supersede itself");
  }

  const at = changedAt.trim();
  const by = changedBy.trim();
  return {
    ...base,
    lifecycleState: "superseded",
    supersededAt: at,
    supersededBy: by,
    successorTraceId: successor,
    revision: base.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendTraceHistory(base.history, {
      at,
      by,
      kind: "superseded",
      summary: `Trace Link superseded by ${successor}`,
    }),
    domainEvents: [
      buildTraceSupersededEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: at,
        successorTraceId: successor,
      }),
    ],
  };
}

export function updateTraceConfidence(
  trace: TraceLink,
  confidence: string,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const next = createTraceConfidence(confidence);
  assertConfidenceForOrigin(next, base.origin);
  if (next === "authoritative" && base.origin === "ai_suggestion") {
    throw new TraceInvariantViolation(
      "Change origin before elevating AI suggestion to authoritative confidence",
    );
  }
  return withChange(
    base,
    { confidence: next },
    changedAt,
    changedBy,
    "confidence_changed",
    `Confidence set to ${next}`,
    [
      buildTraceConfidenceChangedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: changedAt.trim(),
        confidence: next,
      }),
    ],
  );
}

export function updateTraceOrigin(
  trace: TraceLink,
  origin: string,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const next = createTraceOrigin(origin);
  assertConfidenceForOrigin(base.confidence, next);
  return withChange(
    base,
    { origin: next },
    changedAt,
    changedBy,
    "origin_changed",
    `Origin set to ${next}`,
    [
      buildTraceOriginChangedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: changedAt.trim(),
        origin: next,
      }),
    ],
  );
}

export function updateTraceAuthority(
  trace: TraceLink,
  authority: { readonly kind: string; readonly actorId: string },
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const next = createTraceAuthority(authority);
  assertAuthority(next);
  return withChange(
    base,
    { authority: next },
    changedAt,
    changedBy,
    "authority_changed",
    `Authority set to ${next.kind}:${next.actorId}`,
    [
      buildTraceAuthorityChangedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: changedAt.trim(),
        authority: next,
      }),
    ],
  );
}

export function updateTraceScope(
  trace: TraceLink,
  scope: { readonly kind: string; readonly referenceId?: string },
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const next = createTraceScope(scope);
  return withChange(
    base,
    { scope: next },
    changedAt,
    changedBy,
    "scope_changed",
    `Scope set to ${next.kind}`,
    [
      buildTraceScopeChangedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: changedAt.trim(),
        scope: next,
      }),
    ],
  );
}

export function updateTraceEndpoint(
  trace: TraceLink,
  role: "source" | "target",
  endpointInput: {
    readonly kind: string;
    readonly artefactId: string;
    readonly contentVersionId?: string;
    readonly baselineId?: string;
    readonly externalUri?: string;
  },
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  assertTraceDraftOrValidated(base.lifecycleState);
  const endpoint = createTraceEndpoint(role, {
    ...endpointInput,
    tenantId: base.tenantId,
  });
  const source = role === "source" ? endpoint : base.source;
  const target = role === "target" ? endpoint : base.target;
  validateTraceLinkStructure({
    tenantId: base.tenantId,
    type: base.type,
    source,
    target,
    scope: base.scope,
    origin: base.origin,
    rationale: base.rationale,
  });
  return withChange(
    base,
    { source, target },
    changedAt,
    changedBy,
    "endpoint_changed",
    `${role} endpoint changed to ${endpoint.kind}:${endpoint.artefactId}`,
    [
      buildTraceEndpointChangedEvent({
        tenantId: base.tenantId,
        traceId: base.id,
        correlationId: base.correlationId,
        occurredAt: changedAt.trim(),
        role,
        endpoint,
      }),
    ],
  );
}

export function updateTraceMetadata(
  trace: TraceLink,
  patch: Readonly<Record<string, string>>,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const metadata = mergeTraceMetadata(base.metadata, patch);
  return withChange(
    base,
    { metadata },
    changedAt,
    changedBy,
    "metadata_changed",
    "Trace metadata updated",
    [],
  );
}

export function updateTraceRationale(
  trace: TraceLink,
  rationale: string,
  changedAt: string,
  changedBy: string,
): TraceLink {
  const base = clearEvents(trace);
  const next = createTraceRationale(rationale);
  return withChange(
    base,
    { rationale: next },
    changedAt,
    changedBy,
    "rationale_changed",
    "Trace rationale updated",
    [],
  );
}
