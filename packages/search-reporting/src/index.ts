/** @apzhub/search-reporting — APZSEARCH-014 Reporting Search Publication Adapter */

export { SEARCH_REPORTING_VERSION, REPORTING_CORE_DEPENDENCY_VERSION } from "./version";

export {
  REPORTING_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isReportingSearchEntityType,
  looksLikeReportingLeak,
  resolveReportingSearchEntityType,
  type ReportingSearchEntityType,
} from "./types/entity-types";

export {
  createReportingSearchPublicationContext,
  toSearchIntegrationContext,
  type ReportingSearchPublicationContext,
} from "./context/reporting-search-publication-context";

export {
  ReportingSearchEntityMapper,
  resolveReportingClassification,
  type ReportingCategorySearchInput,
  type ReportingConsumerSearchInput,
  type ReportingDefinitionSearchInput,
  type ReportingPlaceholderCatalogueSearchInput,
  type ReportingProfileSearchInput,
  type ReportingSearchMappableEntity,
  type ReportingSearchMappingExtras,
  type ReportingTypeSearchInput,
  type ReportingUsageSummarySearchInput,
} from "./mapper/reporting-search-entity-mapper";

export {
  ReportingSearchEntityValidator,
  type ReportingSearchValidationIssue,
  type ReportingSearchValidationResult,
} from "./validator/reporting-search-entity-validator";

export { ReportingSearchLifecycle } from "./lifecycle/reporting-search-lifecycle";

export {
  DiagnosticsStore,
  ReportingSearchDiagnosticsStore,
  ReportingSearchErrorTranslator,
  ReportingSearchLogger,
  ReportingSearchMetrics,
  type ReportingSearchDiagnostics,
  type ReportingSearchLogEntry,
  type ReportingSearchLogLevel,
  type ReportingSearchStatistics,
} from "./diagnostics/reporting-search-observability";

export {
  ReportingSearchPublisher,
  type ReportingSearchPublisherOptions,
} from "./publisher/reporting-search-publisher";

export {
  createReportingSearchLifecycleHooks,
  type ReportingSearchLifecycleHooks,
} from "./hooks/reporting-search-lifecycle-hooks";

export {
  createReportingSearchAdapter,
  createReportingSearchAdapterForTest,
  createReportingSearchPublisher,
  createReportingSearchPublisherForTest,
  type CreateReportingSearchAdapterOptions,
  type ReportingSearchAdapter,
} from "./factory";

export {
  REPORTING_SEARCH_SAFE_METADATA_KEYS,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  scanMetadataForReportingLeakage,
  type ReportingSearchSafeMetadataKey,
  type SafeFieldScanIssue,
} from "./security/safe-fields";
