/** @apzhub/search-support — APZSEARCH-011 Support Search Publication Adapter */

export { SEARCH_SUPPORT_VERSION } from "./version";

export {
  SUPPORT_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isSupportSearchEntityType,
  looksLikeZammadIdentifier,
  type SupportSearchEntityType,
} from "./types/entity-types";

export {
  createSupportSearchPublicationContext,
  toSearchIntegrationContext,
  type SupportSearchPublicationContext,
} from "./context/support-search-publication-context";

export {
  SupportSearchEntityMapper,
  type SupportSearchMappableEntity,
} from "./mapper/support-search-entity-mapper";

export {
  SupportSearchEntityValidator,
  type SupportSearchValidationIssue,
  type SupportSearchValidationResult,
} from "./validator/support-search-entity-validator";

export { SupportSearchLifecycle } from "./lifecycle/support-search-lifecycle";

export {
  DiagnosticsStore,
  SupportSearchDiagnosticsStore,
  SupportSearchErrorTranslator,
  SupportSearchLogger,
  SupportSearchMetrics,
  type SupportSearchDiagnostics,
  type SupportSearchLogEntry,
  type SupportSearchLogLevel,
  type SupportSearchStatistics,
} from "./diagnostics/support-search-observability";

export {
  SupportSearchPublisher,
  type SupportSearchPublisherOptions,
} from "./publisher/support-search-publisher";

export {
  createSupportSearchLifecycleHooks,
  type SupportSearchLifecycleHooks,
} from "./hooks/support-search-lifecycle-hooks";

export {
  createSupportSearchAdapter,
  type CreateSupportSearchAdapterOptions,
  type SupportSearchAdapter,
} from "./factory";
