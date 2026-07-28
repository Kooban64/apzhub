/** @apzhub/search-time — R12-SEARCH-01 Time Search Publication Adapter */

export { SEARCH_TIME_VERSION } from "./version";

export {
  TIME_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isTimeSearchEntityType,
  looksLikeKimaiIdentifier,
  type TimeSearchEntityType,
} from "./types/entity-types";

export {
  createTimeSearchPublicationContext,
  toSearchIntegrationContext,
  type TimeSearchPublicationContext,
} from "./context/time-search-publication-context";

export {
  TimeSearchEntityMapper,
  type TimeSearchMappableEntity,
} from "./mapper/time-search-entity-mapper";

export {
  TimeSearchEntityValidator,
  type TimeSearchValidationIssue,
  type TimeSearchValidationResult,
} from "./validator/time-search-entity-validator";

export { TimeSearchLifecycle } from "./lifecycle/time-search-lifecycle";

export {
  DiagnosticsStore,
  TimeSearchDiagnosticsStore,
  TimeSearchErrorTranslator,
  TimeSearchLogger,
  TimeSearchMetrics,
  type TimeSearchDiagnostics,
  type TimeSearchLogEntry,
  type TimeSearchLogLevel,
  type TimeSearchStatistics,
} from "./diagnostics/time-search-observability";

export {
  TimeSearchPublisher,
  type TimeSearchPublisherOptions,
} from "./publisher/time-search-publisher";

export {
  createTimeSearchLifecycleHooks,
  type TimeSearchLifecycleHooks,
} from "./hooks/time-search-lifecycle-hooks";

export {
  createTimeSearchAdapter,
  type CreateTimeSearchAdapterOptions,
  type TimeSearchAdapter,
} from "./factory";
