export {
  WorkbenchNavigationKnowledgeProvider,
  createWorkbenchNavigationKnowledgeProvider,
  getWorkbenchNavigationProjectionSkippedHiddenCount,
} from "./workbench-navigation-knowledge-provider";

export {
  buildWorkbenchNavigationKnowledgeProviderDiagnostics,
  resolvePlatformNavigationKnowledgeSource,
  type WorkbenchNavigationKnowledgeProviderDiagnostics,
} from "./workbench-navigation-knowledge-diagnostics";

export {
  mapNavItemToKnowledgeDocument,
  mapViewToKnowledgeDocument,
  mapWorkbenchRegistryDtoToKnowledgeDocuments,
  PLATFORM_NAVIGATION_SOURCE_ID,
  type MapNavigationToKnowledgeDocumentOptions,
  type MapWorkbenchRegistryDtoResult,
} from "./map-navigation-to-knowledge-document";

export {
  WORKBENCH_REGISTRY_DTO_FIXTURE,
  navItem,
  registerWorkbenchNavigationKnowledgeProvider,
} from "./test-fixtures";
