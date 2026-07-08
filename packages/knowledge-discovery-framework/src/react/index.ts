/** React subpath status — DF-015 Knowledge Service. */
export const KNOWLEDGE_DISCOVERY_REACT_STATUS = "service" as const;

export type {
  KnowledgeRegistryContextValue,
  KnowledgeRegistryProviderProps,
} from "./knowledge-registry-context";
export {
  KnowledgeRegistryProvider,
  useKnowledgeRegistryContext,
} from "./knowledge-registry-context";

export type { UseKnowledgeRegistryResult } from "./use-knowledge-registry";
export { useKnowledgeRegistry } from "./use-knowledge-registry";

export type {
  KnowledgeDiscoveryProviderProps,
  KnowledgeQueryProviderProps,
  KnowledgeServiceProviderProps,
} from "./knowledge-discovery-context";
export {
  KnowledgeDiscoveryProvider,
  KnowledgeQueryProvider,
  KnowledgeServiceProvider,
} from "./knowledge-discovery-context";

export type { UseKnowledgeServiceResult } from "./use-knowledge-service";
export { useKnowledgeService } from "./use-knowledge-service";

export type { UseKnowledgeQueryResult } from "./use-knowledge-query";
/** @deprecated Use {@link useKnowledgeService}. */
export { useKnowledgeQuery } from "./use-knowledge-query";

export type {
  CreateKnowledgeDiscoveryContextOptions,
  KnowledgeDiscoveryContext,
} from "../di";
export { createKnowledgeDiscoveryContext } from "../di";

export type {
  KnowledgeSourceDescriptorDto,
  KnowledgeSourceRegistryDto,
} from "../server/map-knowledge-source-registry-dto";
export { createEmptyKnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";

export {
  createKnowledgeRegistryFromDto,
  validateKnowledgeSourceRegistryDto,
  createKnowledgeService,
  createKnowledgeServiceFromHydration,
  executeKnowledgeQuery,
  type ClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeQueryDiagnostics,
  type CreateKnowledgeRegistryFromDtoOptions,
  type CreateKnowledgeRegistryFromDtoResult,
  type CreateKnowledgeServiceFromHydrationOptions,
  type CreateKnowledgeServiceOptions,
  type KnowledgeService,
  type KnowledgeServiceDiagnostics,
  type KnowledgeQueryInput,
  type KnowledgeQueryStatus,
  type KnowledgeSourceRegistryDtoValidationResult,
  type ReadOnlyKnowledgeRegistry,
  type ClientRegistrySynchronisationState,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
} from "../client";
