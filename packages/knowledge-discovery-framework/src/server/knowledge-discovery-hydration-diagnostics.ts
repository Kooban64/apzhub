import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility (DF-005). */
export interface KnowledgeDiscoveryHydrationDiagnostics {
  readonly schemaVersion: typeof KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly frameworkVersion?: string;
  readonly builtinSourceCount: number;
  readonly manifestSourceCount: number;
  readonly builtinSourceIds: readonly string[];
  readonly manifestSourceIds: readonly string[];
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
  readonly activeSourceCount: number;
  readonly registeredProviderCount: number;
}

export function buildKnowledgeDiscoveryHydrationDiagnostics(
  registry: KnowledgeRegistry,
  visibleDto: KnowledgeSourceRegistryDto,
): KnowledgeDiscoveryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const registryMetadata = registry.getRegistryMetadata();
  const manifestCapabilities = registryMetadata.manifestCapabilities ?? [];

  const builtinSourceIds = Object.freeze(
    visibleDto.sources
      .filter((source) => source.origin === "builtin")
      .map((source) => source.id)
      .sort(),
  );
  const manifestSourceIds = Object.freeze(
    visibleDto.sources
      .filter((source) => source.origin === "manifest")
      .map((source) => source.id)
      .sort(),
  );

  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    registeredCount: registryDiagnostics.registeredSourceCount,
    filteredCount: visibleDto.sources.length,
    frameworkVersion: visibleDto.frameworkVersion ?? registryMetadata.frameworkVersion,
    builtinSourceCount: builtinSourceIds.length,
    manifestSourceCount: manifestSourceIds.length,
    builtinSourceIds,
    manifestSourceIds,
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities,
    activeSourceCount: visibleDto.sources.filter((source) => source.status === "active")
      .length,
    registeredProviderCount: registryDiagnostics.registeredProviderCount,
  };
}

export function createEmptyKnowledgeDiscoveryHydrationDiagnostics(): KnowledgeDiscoveryHydrationDiagnostics {
  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    registeredCount: 0,
    filteredCount: 0,
    builtinSourceCount: 0,
    manifestSourceCount: 0,
    builtinSourceIds: [],
    manifestSourceIds: [],
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
    activeSourceCount: 0,
    registeredProviderCount: 0,
  };
}
