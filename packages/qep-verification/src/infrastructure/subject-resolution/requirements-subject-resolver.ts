import type { SubjectResolutionFact, VerificationSubjectResolver } from "./subject-resolver";

/**
 * Structural (duck-typed) ports mirroring the Requirements bounded context's
 * repositories, kept local so `@apzhub/qep-verification` does not take a hard
 * package dependency on `@apzhub/qep-requirements` (ARCH-008 — bounded
 * contexts integrate via adapters, never direct module-to-module coupling).
 * The caller (composition root) supplies the real repositories.
 */
export type RequirementExistenceLookup = {
  findById(tenantId: string, id: string): Promise<unknown | null>;
};

export type RequirementContentVersionExistenceLookup = {
  getById(tenantId: string, id: string): Promise<unknown | null>;
};

export type RequirementBaselineExistenceLookup = {
  baselineExists(tenantId: string, id: string): Promise<boolean>;
};

export type RequirementsSubjectResolverDeps = {
  readonly requirements?: RequirementExistenceLookup;
  readonly contentVersions?: RequirementContentVersionExistenceLookup;
  readonly baselines?: RequirementBaselineExistenceLookup;
};

/**
 * Resolves `requirement` / `requirement_content_version` / `requirement_baseline`
 * Verification subject kinds against the Requirements bounded context. Any
 * kind not covered here resolves as not-found — compose with another
 * resolver (or extend) as those bounded contexts land.
 */
export function createRequirementsSubjectResolver(
  deps: RequirementsSubjectResolverDeps,
): VerificationSubjectResolver {
  return {
    async resolve(tenantId, kind, artefactId): Promise<SubjectResolutionFact> {
      if (kind === "requirement") {
        if (!deps.requirements) return { exists: false, tenantId, kind, artefactId };
        const found = await deps.requirements.findById(tenantId, artefactId);
        return {
          exists: Boolean(found),
          tenantId,
          kind,
          artefactId,
          owningDomain: "requirements",
        };
      }
      if (kind === "requirement_content_version") {
        if (!deps.contentVersions) return { exists: false, tenantId, kind, artefactId };
        const found = await deps.contentVersions.getById(tenantId, artefactId);
        return {
          exists: Boolean(found),
          tenantId,
          kind,
          artefactId,
          owningDomain: "requirements",
        };
      }
      if (kind === "requirement_baseline") {
        if (!deps.baselines) return { exists: false, tenantId, kind, artefactId };
        const exists = await deps.baselines.baselineExists(tenantId, artefactId);
        return { exists, tenantId, kind, artefactId, owningDomain: "requirements" };
      }
      return { exists: false, tenantId, kind, artefactId };
    },
  };
}
