/** @apzhub/search-documents — APZSEARCH-012 Documents Search Publication Adapter */

export { SEARCH_DOCUMENTS_VERSION } from "./version";

export {
  DOCUMENTS_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isDocumentsSearchEntityType,
  looksLikeStorageLeak,
  type DocumentsSearchEntityType,
} from "./types/entity-types";

export {
  createDocumentsSearchPublicationContext,
  toSearchIntegrationContext,
  type DocumentsSearchPublicationContext,
} from "./context/documents-search-publication-context";

export {
  DocumentsSearchEntityMapper,
  mapDocumentClassification,
  type DocumentsSearchMappableEntity,
  type DocumentsSearchMappingExtras,
} from "./mapper/documents-search-entity-mapper";

export {
  DocumentsSearchEntityValidator,
  type DocumentsSearchValidationIssue,
  type DocumentsSearchValidationResult,
} from "./validator/documents-search-entity-validator";

export { DocumentsSearchLifecycle } from "./lifecycle/documents-search-lifecycle";

export {
  DiagnosticsStore,
  DocumentsSearchDiagnosticsStore,
  DocumentsSearchErrorTranslator,
  DocumentsSearchLogger,
  DocumentsSearchMetrics,
  type DocumentsSearchDiagnostics,
  type DocumentsSearchLogEntry,
  type DocumentsSearchLogLevel,
  type DocumentsSearchStatistics,
} from "./diagnostics/documents-search-observability";

export {
  DocumentsSearchPublisher,
  type DocumentsSearchPublisherOptions,
} from "./publisher/documents-search-publisher";

export {
  createDocumentsSearchLifecycleHooks,
  type DocumentsSearchLifecycleHooks,
} from "./hooks/documents-search-lifecycle-hooks";

export {
  createDocumentsSearchAdapter,
  createDocumentsSearchAdapterForTest,
  createDocumentsSearchPublisher,
  createDocumentsSearchPublisherForTest,
  type CreateDocumentsSearchAdapterOptions,
  type DocumentsSearchAdapter,
} from "./factory";

export {
  DOCUMENTS_SEARCH_SAFE_METADATA_KEYS,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  scanMetadataForStorageLeakage,
  type DocumentsSearchSafeMetadataKey,
  type SafeFieldScanIssue,
} from "./security/safe-fields";
