export type { ReadOnlyKnowledgeRegistry } from "./read-only-knowledge-registry";
export {
  ClientKnowledgeRegistry,
  createEmptyClientKnowledgeRegistry,
  createInvalidClientKnowledgeRegistry,
  type ClientKnowledgeRegistrySnapshot,
} from "./client-knowledge-registry";
export {
  buildClientKnowledgeRegistryDiagnostics,
  createEmptyClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeRegistryStatus,
} from "./client-knowledge-registry-diagnostics";
export {
  createKnowledgeRegistryFromDto,
  createEmptyKnowledgeSourceRegistryDto,
  type CreateKnowledgeRegistryFromDtoOptions,
  type CreateKnowledgeRegistryFromDtoResult,
} from "./create-knowledge-registry-from-dto";
export {
  mapDescriptorDtoToKnowledgeSource,
  mapKnowledgeSourceRegistryDtoToSources,
} from "./map-dto-to-knowledge-sources";
export {
  validateKnowledgeSourceRegistryDto,
  type KnowledgeSourceRegistryDtoValidationResult,
} from "./validate-knowledge-source-registry-dto";
export {
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  type ClientRegistrySyncMode,
  type ClientRegistrySynchronisationState,
} from "./synchronisation";

export type {
  KnowledgeQueryStatus,
  KnowledgeQueryError,
  KnowledgeQueryState,
  KnowledgeQueryInput,
  KnowledgeQueryClient,
  KnowledgeQueryClientResult,
  KnowledgeQueryClientDiagnostics,
  InstrumentedKnowledgeQueryClient,
  ClientKnowledgeQueryDiagnostics,
  ExecuteKnowledgeQueryOptions,
  ExecuteKnowledgeQueryResult,
} from "./query";
export {
  createInitialKnowledgeQueryState,
  createLoadingKnowledgeQueryState,
  createKnowledgeQueryClientFromOrchestrator,
  createPlaceholderKnowledgeQueryClient,
  KNOWLEDGE_QUERY_CLIENT_PLACEHOLDER_MESSAGE,
  buildClientKnowledgeQueryDiagnostics,
  createIdleClientKnowledgeQueryDiagnostics,
  executeKnowledgeQuery,
  createKnowledgeQueryIdleState,
  createKnowledgeQueryLoadingState,
} from "./query";
export type {
  KnowledgeService,
  KnowledgeServiceDiagnostics,
  KnowledgeServiceQueryResult,
  KnowledgeServiceStatus,
  KnowledgeDiscoveryHealthSummary,
  CreateKnowledgeServiceOptions,
  CreateKnowledgeServiceFromHydrationOptions,
} from "./service";
export {
  DefaultKnowledgeService,
  createKnowledgeService,
  createKnowledgeServiceFromHydration,
  buildKnowledgeServiceHealthSummary,
} from "./service";
