export {
  ActionRegistryKnowledgeProvider,
  createActionRegistryKnowledgeProvider,
} from "./action-registry-knowledge-provider";

export {
  buildActionRegistryKnowledgeProviderDiagnostics,
  resolvePlatformActionsKnowledgeSource,
  type ActionRegistryKnowledgeProviderDiagnostics,
} from "./action-registry-knowledge-diagnostics";

export {
  mapActionDescriptorToKnowledgeDocument,
  mapActionRegistryDtoToKnowledgeDocuments,
  PLATFORM_ACTIONS_SOURCE_ID,
  type MapActionToKnowledgeDocumentOptions,
} from "./map-action-to-knowledge-document";

export {
  ACTION_REGISTRY_DTO_FIXTURE,
  actionDescriptor,
  registerActionRegistryKnowledgeProvider,
} from "./test-fixtures";
