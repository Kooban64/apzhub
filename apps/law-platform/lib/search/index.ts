export type {
  LegalSearchEntityType,
  LegalSearchResultView,
} from "../knowledge/map-legal-search-document";
export {
  mapKnowledgeDocumentToSearchResult,
  groupSearchResultsByEntityType,
  sortSearchResultsByRelevance,
  resolveEntityTypeFromSourceId,
  formatLegalSearchEntityTypeLabel,
} from "../knowledge/map-legal-search-document";
export {
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_ENTITY_SEARCH_SOURCE_IDS,
} from "../knowledge/legal-search-source-ids";
export {
  registerLegalSearchKnowledgeSources,
  registerLegalSearchKnowledgeProviders,
} from "../knowledge/register-legal-search-knowledge";
export {
  EMPTY_LEGAL_SEARCH_FILTERS,
  hasActiveLegalSearchFilters,
  mergeLegalSearchScope,
  normalizeLegalSearchFilters,
  parseLegalSearchFiltersFromCommandArgs,
  parseLegalSearchFiltersFromSearchParams,
  toKnowledgeQueryFilters,
  type LegalSearchFilters,
} from "./legal-search-filters";
export {
  LEGAL_SEARCH_MODULE_BASE_ROUTE,
  isLegalSearchModuleRoute,
  legalSearchListRoute,
  parseLegalSearchRouteSearchParams,
} from "./legal-search-routes";
export {
  registerLegalSearchNavigationHandler,
  unregisterLegalSearchNavigationHandler,
  navigateToLegalSearchRoute,
} from "./legal-search-navigation";
export {
  LegalSearchWorkflowService,
  type LegalSearchExecuteResult,
  type LegalSearchEntityFilter,
  type LegalSearchExecuteOptions,
} from "./legal-search-workflow-service";
export {
  LegalSearchWorkflowBridge,
  useLegalSearchWorkflow,
} from "./legal-search-workflow-context";
export {
  LegalSearchWorkflowDiagnostics,
  getLegalSearchWorkflowDiagnostics,
  resetLegalSearchWorkflowDiagnostics,
} from "./legal-search-workflow-diagnostics";
export {
  getLegalSearchRecentSearches,
  resetLegalSearchRecentSearches,
  type LegalSearchRecentEntry,
  type LegalSearchSurface,
} from "./legal-search-recent-searches";
export {
  resolveLegalSearchScopeFromPathname,
  type LegalSearchScope,
} from "./legal-search-scope";
export {
  scoreLegalSearchResult,
  sortSearchResultsByLegalRelevance,
} from "./legal-search-ranking";
export {
  runWithLegalSearchFilters,
  getActiveLegalSearchQueryFilters,
  resetActiveLegalSearchQueryFilters,
} from "./legal-search-query-context";
export {
  wrapKnowledgeServiceForLegalSearchTracking,
  runAsLegalSearchWorkflowQuery,
  resetLegalSearchWorkflowQueryDepth,
  isLegalSearchKnowledgeDocument,
} from "./legal-search-knowledge-tracking";
