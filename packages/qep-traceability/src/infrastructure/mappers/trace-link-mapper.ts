import { endpointIdentityKey } from "../../domain/trace-link/trace-endpoint";
import type { TraceEndpointReference } from "../../domain/trace-link/trace-endpoint";
import { traceScopeKey } from "../../domain/trace-link/trace-scope";
import type { TraceScope } from "../../domain/trace-link/trace-scope";
import type { TraceLink } from "../../domain/trace-link/trace-link";
import type { StoredTraceLink, TraceListQuery } from "../../domain/trace-link/trace-link-repository";
import type { TraceType } from "../../domain/trace-link/trace-type";

export function toStoredTraceLink(trace: TraceLink): StoredTraceLink {
  const { domainEvents: _events, ...rest } = trace;
  return {
    ...rest,
    domainEvents: [],
  };
}

/** Minimal shape shared by TraceLink, StoredTraceLink, and TraceEdgeFact. */
export type TraceDuplicateKeyInput = {
  readonly type: TraceType;
  readonly source: TraceEndpointReference;
  readonly target: TraceEndpointReference;
  readonly scope: TraceScope;
};

export function computeTraceLinkDuplicateKey(input: TraceDuplicateKeyInput): string {
  return [
    input.type,
    endpointIdentityKey(input.source),
    endpointIdentityKey(input.target),
    traceScopeKey(input.scope),
  ].join("|");
}

export function traceLinkMatchesListFilters(
  row: StoredTraceLink,
  query: TraceListQuery,
): boolean {
  if (query.type && row.type !== query.type) return false;
  if (query.lifecycleState && row.lifecycleState !== query.lifecycleState) return false;
  if (query.sourceKind && row.source.kind !== query.sourceKind) return false;
  if (query.sourceArtefactId && row.source.artefactId !== query.sourceArtefactId) return false;
  if (query.targetKind && row.target.kind !== query.targetKind) return false;
  if (query.targetArtefactId && row.target.artefactId !== query.targetArtefactId) return false;
  if (query.scopeReferenceId && row.scope.referenceId !== query.scopeReferenceId) return false;
  if (query.artefactId) {
    const matchesSource = row.source.artefactId === query.artefactId;
    const matchesTarget = row.target.artefactId === query.artefactId;
    const direction = query.direction ?? "both";
    if (direction === "outbound" && !matchesSource) return false;
    if (direction === "inbound" && !matchesTarget) return false;
    if (direction === "both" && !matchesSource && !matchesTarget) return false;
  }
  return true;
}
