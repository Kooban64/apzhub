/**
 * Contract for resolving whether a Trace endpoint artefact exists, without the
 * Traceability domain or application layer coupling directly to other bounded
 * contexts' repositories (ARCH-007 / 008 — Service Connector boundary).
 */
export type EndpointResolutionFact = {
  readonly exists: boolean;
  readonly tenantId: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  /** True when the artefact is not archived/retired and may be linked. */
  readonly available?: boolean;
  /** True when the artefact is bound to an immutable historical context (e.g. a locked baseline). */
  readonly immutable?: boolean;
};

export type EndpointResolutionOptions = {
  readonly contentVersionId?: string;
  readonly baselineId?: string;
};

export interface TraceEndpointResolver {
  resolve(
    tenantId: string,
    kind: string,
    artefactId: string,
    opts?: EndpointResolutionOptions,
  ): Promise<EndpointResolutionFact>;
}
