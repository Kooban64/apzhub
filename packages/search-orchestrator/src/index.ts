/** @apzhub/search-orchestrator — Product Indexing Orchestration Framework (APZSEARCH-016). */

export { SEARCH_ORCHESTRATOR_VERSION } from "./version";

export { isSearchOrchestrationEnabled, SearchOrchestrationDisabledError } from "./env";

export {
  PUBLICATION_OPERATIONS,
  PUBLICATION_STATUSES,
  DEFAULT_RETRY_POLICY,
  DEFAULT_BATCH_POLICY,
  type PublicationOperation,
  type PublicationStatus,
  type PublicationProductId,
  type PublicationJournalEntry,
  type EnqueuePublicationInput,
  type RetryPolicy,
  type BatchPolicy,
  type OrchestrationDiagnostics,
} from "./types";

export { hashPublicationPayload } from "./hash";

export {
  canTransitionPublicationStatus,
  assertPublicationTransition,
} from "./lifecycle";

export {
  computeBackoffDelayMs,
  shouldRetry,
  isPermanentFailureMessage,
  nextAttemptIso,
} from "./retry-policy";

export type { PublicationJournalRepository } from "./journal/port";
export { createInMemoryPublicationJournal } from "./journal/memory";
export { createPostgresPublicationJournal } from "./journal/postgres";

export {
  createPublicationDispatcher,
  safeEnqueuePublication,
  type PublicationDispatcher,
  type CreatePublicationDispatcherOptions,
} from "./dispatcher";

export {
  createIndexOrchestrator,
  type IndexOrchestrator,
  type CreateIndexOrchestratorOptions,
} from "./orchestrator";

export {
  createSearchOrchestrationForTest,
  createProductionSearchOrchestration,
  type SearchOrchestrationRuntime,
  type CreateSearchOrchestrationForTestInput,
  type CreateProductionSearchOrchestrationInput,
} from "./factory";

export {
  enqueueProductPublicationSafely,
  afterSuccessEnqueue,
  type ProductPublicationHookContext,
  type OrchestratedPublicationCall,
} from "./wiring/safe-hooks";

export {
  withProjectSearchPublicationOrchestration,
  projectToSearchDraft,
  type ProjectLike,
  type ProjectServiceLike,
  type ServiceContextLike,
} from "./wiring/project-service";

export {
  enqueueCreatePublication,
  enqueueUpdatePublication,
  enqueueArchivePublication,
  enqueueRestorePublication,
  enqueueDeletePublication,
  PRODUCT_HOOK_PRESETS,
  type ProductEntityLike,
  type ProductHookOptions,
} from "./wiring/product-hooks";
