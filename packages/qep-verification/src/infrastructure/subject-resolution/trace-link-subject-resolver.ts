import type {
  SubjectResolutionFact,
  VerificationSubjectResolver,
} from "./subject-resolver";

/**
 * Structural (duck-typed) port mirroring the Traceability bounded context's
 * repository, kept local so `@apzhub/qep-verification` does not take a hard
 * package dependency on `@apzhub/qep-traceability` (ARCH-008 — bounded
 * contexts integrate via adapters, never direct module-to-module coupling).
 */
export type TraceLinkExistenceLookup = {
  exists(tenantId: string, id: string): Promise<boolean>;
};

export type TraceLinkSubjectResolverDeps = {
  readonly traceLinks?: TraceLinkExistenceLookup;
};

/**
 * Resolves the `trace_link` Verification subject kind against the
 * Traceability bounded context. Any other kind resolves as not-found —
 * compose with another resolver (or extend) as needed.
 */
export function createTraceLinkSubjectResolver(
  deps: TraceLinkSubjectResolverDeps,
): VerificationSubjectResolver {
  return {
    async resolve(tenantId, kind, artefactId): Promise<SubjectResolutionFact> {
      if (kind === "trace_link") {
        if (!deps.traceLinks) return { exists: false, tenantId, kind, artefactId };
        const exists = await deps.traceLinks.exists(tenantId, artefactId);
        return { exists, tenantId, kind, artefactId, owningDomain: "traceability" };
      }
      return { exists: false, tenantId, kind, artefactId };
    },
  };
}
