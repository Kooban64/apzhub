/**
 * Contract for resolving whether a Verification subject artefact exists,
 * without the Verification domain or application layer coupling directly to
 * other bounded contexts' repositories (ARCH-007 / 008 — Service Connector
 * boundary). The caller (composition root) supplies the real repositories.
 */
export type SubjectResolutionFact = {
  readonly exists: boolean;
  readonly tenantId: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  /** True when the artefact is not archived/retired and may be verified. */
  readonly available?: boolean;
  /** True when the artefact is bound to an immutable historical context (e.g. a locked baseline). */
  readonly immutable?: boolean;
};

export type SubjectResolutionOptions = {
  readonly contentVersionId?: string;
  readonly baselineId?: string;
};

export interface VerificationSubjectResolver {
  resolve(
    tenantId: string,
    kind: string,
    artefactId: string,
    opts?: SubjectResolutionOptions,
  ): Promise<SubjectResolutionFact>;
}
