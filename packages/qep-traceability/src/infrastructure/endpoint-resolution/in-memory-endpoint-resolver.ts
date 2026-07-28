import type {
  EndpointResolutionFact,
  TraceEndpointResolver,
} from "./endpoint-resolver";

export type InMemoryEndpointRegistry = Map<string, EndpointResolutionFact>;

function registryKey(tenantId: string, kind: string, artefactId: string): string {
  return `${tenantId}|${kind}|${artefactId}`;
}

export function createInMemoryEndpointRegistry(): InMemoryEndpointRegistry {
  return new Map();
}

export function registerEndpointFact(
  registry: InMemoryEndpointRegistry,
  fact: EndpointResolutionFact,
): void {
  registry.set(registryKey(fact.tenantId, fact.kind, fact.artefactId), fact);
}

/**
 * Test double: `external_reference` endpoints always resolve as existing
 * (they are self-describing URIs); all other kinds must be pre-registered.
 */
export function createInMemoryTraceEndpointResolver(
  registry: InMemoryEndpointRegistry = createInMemoryEndpointRegistry(),
): TraceEndpointResolver {
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
