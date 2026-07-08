export type { KnowledgeProvider } from "./knowledge-provider";
export { getKnowledgeProviderSourceId } from "./knowledge-provider";
export {
  ScaffoldKnowledgeProvider,
  createScaffoldKnowledgeProvider,
} from "./scaffold-knowledge-provider";

export {
  ActionRegistryKnowledgeProvider,
  createActionRegistryKnowledgeProvider,
  registerActionRegistryKnowledgeProvider,
  buildActionRegistryKnowledgeProviderDiagnostics,
  mapActionDescriptorToKnowledgeDocument,
  mapActionRegistryDtoToKnowledgeDocuments,
  PLATFORM_ACTIONS_SOURCE_ID,
  ACTION_REGISTRY_DTO_FIXTURE,
  actionDescriptor,
  type ActionRegistryKnowledgeProviderDiagnostics,
  type MapActionToKnowledgeDocumentOptions,
} from "./action-registry";

export {
  WorkbenchNavigationKnowledgeProvider,
  createWorkbenchNavigationKnowledgeProvider,
  registerWorkbenchNavigationKnowledgeProvider,
  buildWorkbenchNavigationKnowledgeProviderDiagnostics,
  mapNavItemToKnowledgeDocument,
  mapViewToKnowledgeDocument,
  mapWorkbenchRegistryDtoToKnowledgeDocuments,
  PLATFORM_NAVIGATION_SOURCE_ID,
  WORKBENCH_REGISTRY_DTO_FIXTURE,
  navItem,
  type WorkbenchNavigationKnowledgeProviderDiagnostics,
  type MapNavigationToKnowledgeDocumentOptions,
} from "./workbench-navigation";
