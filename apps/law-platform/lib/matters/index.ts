export type {
  Matter,
  MatterPriority,
  MatterSearchCriteria,
  MatterStatus,
} from "./matter-types";
export {
  MATTER_PRIORITIES,
  MATTER_STATUSES,
  MATTER_TYPE_CODES,
  matterToFormValues,
  createEmptyMatterFormValues,
  type MatterFormValues,
  type MatterListCriteria,
} from "./matter-types";
export type { MatterRepository } from "./matter-repository";
export type { WritableMatterRepository } from "./writable-matter-repository";
export { InMemoryMatterRepository } from "./in-memory-matter-repository";
export {
  getSharedMatterRepository,
  resetSharedMatterRepository,
} from "../persistence/repository-factory";
export { SEED_MATTERS } from "./seed-matters";
export { SEED_ATTORNEYS, getAttorneyDisplayName } from "./seed-attorneys";
export {
  validateMatterForm,
  parseTagsInput,
  parseCustomFieldsInput,
  type MatterValidationResult,
} from "./matter-validation";
export {
  MATTER_MODULE_BASE_ROUTE,
  matterCreateRoute,
  matterDetailRoute,
  matterEditRoute,
  matterListRoute,
  matterWorkspaceRoute,
  isMatterModuleRoute,
  parseMatterRoute,
  type MatterRoute,
} from "./matter-routes";
export {
  registerMatterNavigationHandler,
  unregisterMatterNavigationHandler,
  navigateToMatterRoute,
} from "./matter-navigation";
export {
  MatterWorkflowService,
  type MatterWorkflowResult,
} from "./matter-workflow-service";
export {
  MatterWorkflowProvider,
  useMatterWorkflow,
  useOptionalMatterWorkflow,
} from "./matter-workflow-context";
export {
  MatterWorkflowDiagnostics,
  getMatterWorkflowDiagnostics,
  resetMatterWorkflowDiagnostics,
  type MatterWorkflowRunRecord,
} from "./matter-workflow-diagnostics";
export {
  getMatterTypeLabel,
  getPracticeAreaLabel,
  getMatterStatusLabel,
  getClientDisplayName,
  getLeadAttorneyLabel,
  MATTER_TYPE_OPTIONS,
  PRACTICE_AREA_OPTIONS,
  MATTER_STATUS_OPTIONS,
} from "./matter-lookups";
export {
  composeMatterWorkspaceSnapshot,
  type MatterWorkspaceSnapshot,
  type MatterWorkspaceMatterSummary,
  type MatterWorkspaceClientSummary,
} from "./matter-workspace-composition";
