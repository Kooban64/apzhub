export {
  KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
  type KnowledgeDiscoveryFrameworkStatus,
} from "./status";

export type {
  KnowledgeActionRef,
  KnowledgeContext,
  KnowledgeDiagnostics,
  KnowledgeDocument,
  KnowledgeDocumentKind,
  KnowledgeHealthSummary,
  KnowledgeNavigationTarget,
  KnowledgeQuery,
  KnowledgeRegistrationIssue,
  KnowledgeRegistrationIssueCode,
  KnowledgeRegistryDuplicateIssue,
  KnowledgeRegistryMetadata,
  KnowledgeRegistryStatus,
  KnowledgeResult,
  KnowledgeResultStatus,
  KnowledgeSource,
  KnowledgeSourceEntryDiagnostics,
  KnowledgeSourceHealthStatus,
  KnowledgeSourceKind,
  KnowledgeSourceMetadata,
  KnowledgeSourceOrigin,
  KnowledgeSourceStatus,
  KnowledgeSourceTier,
} from "./types";

export type { KnowledgeProvider } from "./provider";
export {
  ScaffoldKnowledgeProvider,
  createScaffoldKnowledgeProvider,
  getKnowledgeProviderSourceId,
  ActionRegistryKnowledgeProvider,
  createActionRegistryKnowledgeProvider,
  registerActionRegistryKnowledgeProvider,
  buildActionRegistryKnowledgeProviderDiagnostics,
  mapActionDescriptorToKnowledgeDocument,
  mapActionRegistryDtoToKnowledgeDocuments,
  PLATFORM_ACTIONS_SOURCE_ID,
  ACTION_REGISTRY_DTO_FIXTURE,
  actionDescriptor,
  type ActionRegistryKnowledgeProviderDiagnostics,
  WorkbenchNavigationKnowledgeProvider,
  createWorkbenchNavigationKnowledgeProvider,
  registerWorkbenchNavigationKnowledgeProvider,
  buildWorkbenchNavigationKnowledgeProviderDiagnostics,
  mapNavItemToKnowledgeDocument,
  mapViewToKnowledgeDocument,
  mapWorkbenchRegistryDtoToKnowledgeDocuments,
  PLATFORM_NAVIGATION_SOURCE_ID,
  WORKBENCH_REGISTRY_DTO_FIXTURE,
  navItem,
  type WorkbenchNavigationKnowledgeProviderDiagnostics,
} from "./provider";

export type {
  KnowledgeRegistry,
  KnowledgeRegistryFactory,
  KnowledgeBatchRegistrationResult,
} from "./registry";
export {
  DefaultKnowledgeRegistry,
  PlaceholderKnowledgeRegistry,
  createDefaultKnowledgeRegistry,
  createPlaceholderKnowledgeRegistry,
  defaultKnowledgeRegistryFactory,
  freezeKnowledgeSource,
  freezeKnowledgeSources,
  KnowledgeRegistryDuplicateError,
  KnowledgeRegistryNotFoundError,
  KnowledgeRegistryValidationError,
  validateKnowledgeSource,
  validateKnowledgeProvider,
  buildKnowledgeSourceMetadata,
} from "./registry";

export type {
  CreateKnowledgeDiscoveryContextOptions,
  KnowledgeDiscoveryContext,
} from "./di";
export { createKnowledgeDiscoveryContext } from "./di";

export type {
  KnowledgeCapabilityRecord,
  KnowledgeSourceExtractionResult,
} from "./extraction";
export {
  extractKnowledgeSourcesFromCapabilities,
  mapKnowledgeManifestToSource,
  populateKnowledgeRegistryFromCapabilities,
  type ManifestKnowledgePopulationResult,
} from "./extraction";

export {
  PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE,
  registerPlatformKnowledgeSourceCatalogue,
} from "./catalogue";

export {
  bootstrapKnowledgeRegistry,
  type BootstrapKnowledgeRegistryOptions,
  type BootstrapKnowledgeRegistryResult,
} from "./server/bootstrap-knowledge-registry";
export type { KnowledgeRegistryBootstrapDiagnostics } from "./server/knowledge-registry-bootstrap-diagnostics";

export {
  KnowledgeDiscoveryOrchestrator,
  createKnowledgeDiscoveryOrchestrator,
  createEmptyKnowledgeQueryDiagnostics,
  rankKnowledgeDocuments,
  scoreKnowledgeDocumentMatch,
  type KnowledgeDiscoveryOrchestratorOptions,
  type KnowledgeDiscoveryOrchestratorQueryInput,
  type KnowledgeDiscoveryOrchestratorQueryResult,
  type KnowledgeQueryDiagnostics,
} from "./orchestrator";

export {
  createKnowledgeRegistryFromDto,
  validateKnowledgeSourceRegistryDto,
  ClientKnowledgeRegistry,
  createEmptyClientKnowledgeRegistry,
  buildClientKnowledgeRegistryDiagnostics,
  createKnowledgeQueryClientFromOrchestrator,
  createPlaceholderKnowledgeQueryClient,
  createKnowledgeService,
  createKnowledgeServiceFromHydration,
  buildKnowledgeServiceHealthSummary,
  executeKnowledgeQuery,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  type ReadOnlyKnowledgeRegistry,
  type ClientKnowledgeRegistryDiagnostics,
  type ClientKnowledgeQueryDiagnostics,
  type ClientRegistrySynchronisationState,
  type CreateKnowledgeRegistryFromDtoOptions,
  type CreateKnowledgeRegistryFromDtoResult,
  type CreateKnowledgeServiceOptions,
  type CreateKnowledgeServiceFromHydrationOptions,
  type KnowledgeService,
  type KnowledgeServiceDiagnostics,
  type KnowledgeDiscoveryHealthSummary,
  type KnowledgeQueryClient,
  type KnowledgeQueryInput,
  type KnowledgeQueryStatus,
  type KnowledgeSourceRegistryDtoValidationResult,
} from "./client";

export {
  DefaultRankingEngine,
  createDefaultRankingEngine,
  DefaultRankingStrategyRegistry,
  createDefaultRankingStrategyRegistry,
  FuzzyRankingStrategy,
  KeywordRankingStrategy,
  PassthroughRankingStrategy,
  SemanticRankingStrategy,
  RecencyRankingStrategy,
  FrequencyRankingStrategy,
  PersonalisationRankingStrategy,
  AIRerankingStrategy,
  fuzzyRankingStrategy,
  keywordRankingStrategy,
  passthroughRankingStrategy,
  semanticRankingStrategy,
  recencyRankingStrategy,
  frequencyRankingStrategy,
  personalisationRankingStrategy,
  aiRerankingStrategy,
  defaultPlannedRankingStrategies,
  rankKnowledgeDocumentsByKeyword,
  scoreKnowledgeDocumentKeywordMatch,
  selectRankingMode,
  createEmptyRankingDiagnostics,
  createPlannedRankingStrategy,
  ACTIVE_RANKING_STRATEGY_IDS,
  DEFAULT_PLANNED_RANKING_STRATEGY_IDS,
  type ActiveRankingStrategyId,
  type PlannedRankingStrategyId,
  type PlannedRankingStrategy,
  type CreateRankingStrategyRegistryOptions,
  type DefaultRankingEngineOptions,
  type RankingDiagnostics,
  type RankingEngine,
  type RankingInput,
  type RankingMode,
  type RankingResult,
  type RankingStrategy,
  type RankingStrategyId,
  type RankingStrategyImplementationStatus,
  type RankingStrategyRegistrationDiagnostic,
  type RankingStrategyRegistry,
  type RankingStrategyRegistryDiagnostics,
} from "./ranking";

/** Three-layer architecture layer identifiers — Index and Experience are future milestones. */
export const KNOWLEDGE_ARCHITECTURE_LAYERS = {
  sources: "knowledge-sources",
  index: "knowledge-index",
  experience: "knowledge-experience",
} as const;

export type KnowledgeArchitectureLayer =
  (typeof KNOWLEDGE_ARCHITECTURE_LAYERS)[keyof typeof KNOWLEDGE_ARCHITECTURE_LAYERS];

/** Active implementation layer during SPR-005 foundation stories. */
export const KNOWLEDGE_ACTIVE_LAYER = KNOWLEDGE_ARCHITECTURE_LAYERS.sources;
