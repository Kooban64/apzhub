import type { SubjectResolutionFact, VerificationSubjectResolver } from "./subject-resolver";

export type InMemorySubjectRegistry = Map<string, SubjectResolutionFact>;

function registryKey(tenantId: string, kind: string, artefactId: string): string {
  return `${tenantId}|${kind}|${artefactId}`;
}

export function createInMemorySubjectRegistry(): InMemorySubjectRegistry {
  return new Map();
}

export function registerSubjectFact(
  registry: InMemorySubjectRegistry,
  fact: SubjectResolutionFact,
): void {
  registry.set(registryKey(fact.tenantId, fact.kind, fact.artefactId), fact);
}

/**
 * Test double: `external_reference` subjects always resolve as existing
 * (they are self-describing URIs); all other kinds must be pre-registered.
 */
export function createInMemoryVerificationSubjectResolver(
  registry: InMemorySubjectRegistry = createInMemorySubjectRegistry(),
): VerificationSubjectResolver {
  return {
    async resolve(tenantId, kind, artefactId) {
      if (kind === "external_reference") {
        return { exists: true, tenantId, kind, artefactId };
      }
      const fact = registry.get(registryKey(tenantId, kind, artefactId));
      return fact ?? { exists: false, tenantId, kind, artefactId };
    },
  };
}
