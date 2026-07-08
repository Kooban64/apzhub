/** Server subpath status — DTO mapping and permission filter available (DF-005). */
export const KNOWLEDGE_DISCOVERY_SERVER_STATUS = "filter" as const;

export type {
  KnowledgeDiscoveryContext,
  CreateKnowledgeDiscoveryContextOptions,
} from "./di";
export { createKnowledgeDiscoveryContext } from "./di";

export type { KnowledgeRegistry, KnowledgeRegistryFactory } from "./registry";
export {
  createDefaultKnowledgeRegistry,
  createPlaceholderKnowledgeRegistry,
  defaultKnowledgeRegistryFactory,
} from "./registry";

export type {
  KnowledgeDiagnostics,
  KnowledgeRegistryMetadata,
  KnowledgeSource,
  KnowledgeSourceMetadata,
  KnowledgeDocument,
  KnowledgeRegistrationIssue,
} from "./types";

export {
  bootstrapKnowledgeRegistry,
  populateKnowledgeRegistryFromCapabilities,
  type BootstrapKnowledgeRegistryOptions,
  type BootstrapKnowledgeRegistryResult,
  type ManifestKnowledgePopulationResult,
  type KnowledgeCapabilityRecord,
} from "./server/bootstrap-knowledge-registry";

export {
  buildKnowledgeRegistryBootstrapDiagnostics,
  createEmptyKnowledgeRegistryBootstrapDiagnostics,
  type KnowledgeRegistryBootstrapDiagnostics,
} from "./server/knowledge-registry-bootstrap-diagnostics";

export {
  extractKnowledgeSourcesFromCapabilities,
  mapKnowledgeManifestToSource,
} from "./extraction";

export {
  registerPlatformKnowledgeSourceCatalogue,
  PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE,
} from "./catalogue";

export {
  KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
  type KnowledgeSourceRegistryDtoSchemaVersion,
} from "./server/knowledge-source-registry-schema-version";

export {
  createEmptyKnowledgeSourceRegistryDto,
  mapKnowledgeSourceRegistryDto,
  mapKnowledgeSourceToDescriptorDto,
  type KnowledgeSourceDescriptorDto,
  type KnowledgeSourceRegistryDto,
} from "./server/map-knowledge-source-registry-dto";

export { filterKnowledgeSourceRegistryDto } from "./server/filter-knowledge-source-registry-dto";

export {
  validateKnowledgeSourceRegistryDto,
  type KnowledgeSourceRegistryDtoValidationResult,
} from "./server/validate-knowledge-source-registry-dto";

export {
  buildKnowledgeDiscoveryHydrationDiagnostics,
  createEmptyKnowledgeDiscoveryHydrationDiagnostics,
  type KnowledgeDiscoveryHydrationDiagnostics,
} from "./server/knowledge-discovery-hydration-diagnostics";
