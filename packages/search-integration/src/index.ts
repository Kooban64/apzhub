/** @apzhub/search-integration — APZSEARCH-009 Cross-Product Search Integration Framework */

export {
  SEARCH_INTEGRATION_VERSION,
  SEARCH_PUBLICATION_ORCHESTRATION_CONSUMER,
} from "./version";

export {
  asCanonicalSearchEntityId,
  type CanonicalSearchEntity,
  type CanonicalSearchEntityId,
  type CanonicalSearchEntityInput,
} from "./entity/canonical-search-entity";

export {
  SEARCH_ENTITY_LIFECYCLE_STATES,
  SearchEntityLifecycle,
  isSearchEntityLifecycleState,
  type SearchEntityLifecycleRecord,
  type SearchEntityLifecycleState,
} from "./entity/lifecycle";

export {
  createSearchIntegrationContext,
  toSearchRequestContext,
  type SearchIntegrationContext,
} from "./context/search-integration-context";

export {
  SearchEntityMapper,
  type SearchEntityDraft,
} from "./mapper/search-entity-mapper";

export {
  SearchEntityValidator,
  type SearchEntityValidationIssue,
  type SearchEntityValidationResult,
} from "./validator/search-entity-validator";

export { SearchEntityPublisher } from "./publisher/search-entity-publisher";
export type { SearchEntityPublisherOptions } from "./publisher/search-entity-publisher";

export { SearchIntegrationPublisher } from "./publisher/search-integration-publisher";
export type { SearchIntegrationPublisherDeps } from "./publisher/search-integration-publisher";

export {
  createSearchPublicationDiagnostics,
  type SearchPublicationDiagnostics,
} from "./publication/diagnostics";

export {
  SearchPublicationMetrics,
  type SearchPublicationStatistics,
} from "./publication/metrics";

export {
  SearchPublicationLogger,
  type SearchPublicationLogEntry,
  type SearchPublicationLogLevel,
  type SearchPublicationLogSink,
} from "./publication/logger";

export { SearchPublicationErrorTranslator } from "./publication/error-translator";

export type {
  SearchPublicationOperation,
  SearchPublicationPreview,
  SearchPublicationResult,
} from "./publication/result";

export {
  InMemorySearchPublicationSink,
  NoopSearchPublicationSink,
  type SearchPublicationSink,
  type SearchPublicationSinkKind,
} from "./sink/publication-sink";

export {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
} from "./factory";

export * from "./products";
