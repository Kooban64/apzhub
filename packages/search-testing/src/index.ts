/** @apzhub/search-testing — APZSEARCH-013 Testing Search Publication Adapter */

export { SEARCH_TESTING_VERSION } from "./version";

export {
  TESTING_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isTestingSearchEntityType,
  looksLikeStorageLeak,
  type TestingSearchEntityType,
} from "./types/entity-types";

export {
  createTestingSearchPublicationContext,
  toSearchIntegrationContext,
  type TestingSearchPublicationContext,
} from "./context/testing-search-publication-context";

export {
  TestingSearchEntityMapper,
  mapTestingSeverityToClassification,
  mapTestingStatusToClassification,
  neverDowngradeClassification,
  resolveTestingClassification,
  type AutomationSuiteSearchInput,
  type CertificationDecisionSearchInput,
  type CertificationEvidenceSearchInput,
  type DefectSummarySearchInput,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./mapper/testing-search-entity-mapper";

export { ManualTestingSearchMapper } from "./mapper/manual";
export { AutomationSearchMapper } from "./mapper/automation";
export { CertificationSearchMapper } from "./mapper/certification";
export { ReleaseSearchMapper } from "./mapper/release";
export { EngineeringIntelligenceSearchMapper } from "./mapper/engineering-intelligence";
export { QualitySearchMapper } from "./mapper/quality";
export { ReportingMetadataSearchMapper } from "./mapper/reporting-metadata";
export { PipelineSearchMapper } from "./mapper/pipeline";

export {
  TestingSearchEntityValidator,
  type TestingSearchValidationIssue,
  type TestingSearchValidationResult,
} from "./validator/testing-search-entity-validator";

export { TestingSearchLifecycle } from "./lifecycle/testing-search-lifecycle";

export {
  DiagnosticsStore,
  TestingSearchDiagnostics,
  TestingSearchErrorTranslator,
  TestingSearchLogger,
  TestingSearchMetrics,
  type TestingSearchDiagnosticsSnapshot,
  type TestingSearchLogEntry,
  type TestingSearchLogLevel,
  type TestingSearchStatistics,
} from "./diagnostics/testing-search-observability";

export {
  TESTING_SEARCH_DOMAIN_ENTITY_TYPES,
  DomainSearchPublisherBase,
  ManualTestingPublisher,
  AutomationPublisher,
  CertificationPublisher,
  ReleasePublisher,
  EngineeringIntelligencePublisher,
  QualityPublisher,
  ReportingMetadataPublisher,
  PipelinePublisher,
  TestingSearchPublisher,
} from "./publisher";

export type {
  TestingDomainSearchPublisher,
  TestingSearchDomainId,
  TestingSearchPublisherOptions,
  TestingSearchSpecialisedPublishers,
  DomainSearchPublisherDeps,
} from "./publisher";

export {
  createTestingSearchLifecycleHooks,
  type TestingSearchLifecycleHooks,
} from "./hooks/testing-search-lifecycle-hooks";

export {
  createTestingSearchAdapter,
  createTestingSearchAdapterForTest,
  createTestingSearchPublisher,
  createTestingSearchPublisherForTest,
  type CreateTestingSearchAdapterOptions,
  type TestingSearchAdapter,
} from "./factory";

export {
  TESTING_SEARCH_SAFE_METADATA_KEYS,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  scanMetadataForStorageLeakage,
  type TestingSearchSafeMetadataKey,
  type SafeFieldScanIssue,
} from "./security/safe-fields";
