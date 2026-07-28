export type {
  Client,
  ClientSearchCriteria,
  ClientStatus,
  ClientType,
} from "./client-types";
export {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  clientToFormValues,
  createEmptyClientFormValues,
  type ClientFormValues,
} from "./client-types";
export type { ClientRepository } from "./client-repository";
export type { WritableClientRepository } from "./writable-client-repository";
export { InMemoryClientRepository } from "./in-memory-client-repository";
export {
  getSharedClientRepository,
  resetSharedClientRepository,
} from "./in-memory-client-repository";
export { SEED_CLIENTS } from "./seed-clients";
export {
  validateClientForm,
  parseTagsInput,
  parseCustomFieldsInput,
  type ClientValidationResult,
} from "./client-validation";
export {
  CLIENT_MODULE_BASE_ROUTE,
  clientCreateRoute,
  clientDetailRoute,
  clientEditRoute,
  clientListRoute,
  isClientModuleRoute,
  parseClientRoute,
  type ClientRoute,
} from "./client-routes";
export {
  registerClientNavigationHandler,
  unregisterClientNavigationHandler,
  navigateToClientRoute,
} from "./client-navigation";
export {
  ClientWorkflowService,
  type ClientWorkflowResult,
} from "./client-workflow-service";
export {
  ClientWorkflowProvider,
  useClientWorkflow,
  useOptionalClientWorkflow,
} from "./client-workflow-context";
export {
  composeClientDetailSnapshot,
  type ClientDetailLinkItem,
  type ClientDetailSnapshot,
} from "./client-detail-composition";
export {
  ClientWorkflowDiagnostics,
  getClientWorkflowDiagnostics,
  resetClientWorkflowDiagnostics,
  type ClientWorkflowRunRecord,
} from "./client-workflow-diagnostics";
