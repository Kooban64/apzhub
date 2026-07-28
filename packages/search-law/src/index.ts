/** @apzhub/search-law — R12-SEARCH-02 Law Search Publication Adapter */

export { SEARCH_LAW_VERSION } from "./version";

export {
  LAW_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isLawSearchEntityType,
  looksLikeExternalEngineIdentifier,
  type LawSearchEntityType,
} from "./types/entity-types";

export {
  createLawSearchPublicationContext,
  toSearchIntegrationContext,
  type LawSearchPublicationContext,
} from "./context/law-search-publication-context";

export {
  LawSearchEntityMapper,
  type LawSearchMappableEntity,
} from "./mapper/law-search-entity-mapper";

export {
  LawSearchEntityValidator,
  type LawSearchValidationIssue,
  type LawSearchValidationResult,
} from "./validator/law-search-entity-validator";

export { LawSearchLifecycle } from "./lifecycle/law-search-lifecycle";

export {
  DiagnosticsStore,
  LawSearchDiagnosticsStore,
  LawSearchErrorTranslator,
  LawSearchLogger,
  LawSearchMetrics,
  type LawSearchDiagnostics,
  type LawSearchLogEntry,
  type LawSearchLogLevel,
  type LawSearchStatistics,
} from "./diagnostics/law-search-observability";

export {
  LawSearchPublisher,
  type LawSearchPublisherOptions,
} from "./publisher/law-search-publisher";

export {
  createLawSearchLifecycleHooks,
  type LawSearchLifecycleHooks,
} from "./hooks/law-search-lifecycle-hooks";

export {
  createLawSearchAdapter,
  type CreateLawSearchAdapterOptions,
  type LawSearchAdapter,
} from "./factory";
