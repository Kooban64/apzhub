/**
 * QEP Traceability → Platform DTO adapter (APZQEP-ENG-030A Part 2).
 * Maps persisted domain aggregates to the wire-facing contracts in
 * `@apzhub/qep-contracts`, keeping domain value objects out of the Platform
 * Service / REST boundary (ARCH-007 / ARCH-009).
 */
import {
  computeQepTraceLinkAvailableActions,
  type QepTraceEndpointDto,
  type QepTraceLinkDto,
  type QepTraceLinkHistorySummaryDto,
  type QepTraceLinkTaxonomyDto,
} from "@apzhub/qep-contracts";

import type { TraceEndpoint } from "../../domain/trace-link/trace-endpoint";
import type { TraceHistoryEntry } from "../../domain/trace-link/trace-history";
import type { StoredTraceLink } from "../../domain/trace-link/trace-link-repository";
import type { TraceTaxonomyDefinition } from "../../domain/trace-link/trace-taxonomy";

function toTraceEndpointDto(endpoint: TraceEndpoint): QepTraceEndpointDto {
  return {
    kind: endpoint.kind,
    artefactId: endpoint.artefactId,
    contentVersionId: endpoint.contentVersionId,
    baselineId: endpoint.baselineId,
    externalUri: endpoint.externalUri,
    owningDomain: endpoint.owningDomain,
  };
}

function toTraceLinkHistorySummaryDto(
  entry: TraceHistoryEntry,
): QepTraceLinkHistorySummaryDto {
  return {
    at: entry.at,
    by: entry.by,
    kind: entry.kind,
    summary: entry.summary,
  };
}

/**
 * Maps a persisted Trace Link aggregate to its Platform-facing DTO.
 * `availableActions` are computed from the canonical `@apzhub/qep-contracts`
 * rules so the Workbench and REST layer never diverge from the server-side
 * command handlers, which remain the authorization boundary.
 */
export function toTraceLinkDto(
  stored: StoredTraceLink,
  permissions?: readonly string[],
): QepTraceLinkDto {
  return {
    id: stored.id,
    tenantId: stored.tenantId,
    type: stored.type,
    lifecycleState: stored.lifecycleState,
    direction: stored.direction,
    source: toTraceEndpointDto(stored.source),
    target: toTraceEndpointDto(stored.target),
    strength: stored.strength,
    confidence: stored.confidence,
    origin: stored.origin,
    authority: { kind: stored.authority.kind, actorId: stored.authority.actorId },
    provenance: {
      actorId: stored.provenance.actorId,
      correlationId: stored.provenance.correlationId,
      sourceSystem: stored.provenance.sourceSystem,
      importBatchId: stored.provenance.importBatchId,
      rationaleRef: stored.provenance.rationaleRef,
    },
    scope: { kind: stored.scope.kind, referenceId: stored.scope.referenceId },
    context: {
      baselineId: stored.context.baselineId,
      contentVersionId: stored.context.contentVersionId,
      immutable: stored.context.immutable,
    },
    rationale: stored.rationale,
    metadata: stored.metadata.entries,
    revision: stored.revision,
    createdAt: stored.createdAt,
    createdBy: stored.createdBy,
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy,
    correlationId: stored.correlationId,
    validatedAt: stored.validatedAt,
    validatedBy: stored.validatedBy,
    approvedAt: stored.approvedAt,
    approvedBy: stored.approvedBy,
    retiredAt: stored.retiredAt,
    retiredBy: stored.retiredBy,
    supersededAt: stored.supersededAt,
    supersededBy: stored.supersededBy,
    successorTraceId: stored.successorTraceId,
    historySummaries: stored.history.entries.map(toTraceLinkHistorySummaryDto),
    availableActions: computeQepTraceLinkAvailableActions(
      stored.lifecycleState,
      permissions,
    ),
  };
}

/** Maps a taxonomy definition to its Platform-facing DTO. */
export function toTraceLinkTaxonomyDto(
  definition: TraceTaxonomyDefinition,
): QepTraceLinkTaxonomyDto {
  return {
    type: definition.type,
    displayName: definition.displayName,
    description: definition.description,
    family: definition.family,
    allowedSourceKinds: definition.allowedSourceKinds,
    allowedTargetKinds: definition.allowedTargetKinds,
    directionDefault: definition.directionDefault,
    symmetric: definition.symmetric,
    governanceClass: definition.governanceClass,
    cyclePolicy: definition.cyclePolicy,
    rationalePolicy: definition.rationalePolicy,
    defaultStrength: definition.defaultStrength,
    projectionOnly: definition.projectionOnly,
    allowsSelfLink: definition.allowsSelfLink,
  };
}
