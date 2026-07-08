export { COMMAND_FRAMEWORK_STATUS } from "./status";
export type { CommandFrameworkStatus } from "./status";

export type {
  ActionActor,
  ActionAuditEntry,
  ActionAuditHook,
  ActionContext,
  ActionContextPredicate,
  ActionDescriptor,
  ActionExecutionRequest,
  ActionHandlerKind,
  ActionResult,
  ActionResultCode,
  ActionSource,
  PlatformCommand,
} from "./types";
export { noOpActionAuditHook } from "./types";

export type {
  ActionRegistry,
  ActionRegistryDiagnostics,
  ActionRegistryFactory,
  ActionRegistryListOptions,
} from "./registry";
export {
  DefaultActionRegistry,
  PlaceholderActionRegistry,
  createDefaultActionRegistry,
  createPlaceholderActionRegistry,
  defaultActionRegistryFactory,
  ActionRegistryDuplicateError,
  ActionRegistryNotFoundError,
  ActionRegistryValidationError,
  freezeActionDescriptor,
  filterActionDescriptors,
  filterActionsByContext,
  matchesActionContextPredicate,
  scoreActionSearchMatch,
  searchActionDescriptors,
  searchScorableItems,
  sortActionDescriptors,
  validateActionDescriptor,
} from "./registry";
export type {
  ActionBatchRegistrationResult,
  ActionRegistrationIssue,
  ActionRegistrationIssueCode,
  ActionSearchScorable,
  ActionContextFilterInput,
  ActionContextSnapshot,
  ActionSelectionSnapshot,
} from "./registry";
export {
  DEFAULT_TOOLBAR_ITEM_ORDER,
  filterToolbarRegionItems,
  findToolbarRegion,
  sortToolbarItems,
} from "./toolbar";

export type {
  ToolbarExtractionDiagnostics,
  ToolbarExtractionResult,
  ToolbarExtractionWarning,
} from "./extraction";
export { extractToolbarRegionsFromCapabilities } from "./extraction";

export type {
  GatewayRoutedActor,
  InvocationSourceDefinition,
  InvocationSourceId,
  InvocationSourceStatus,
  PlannedInvocationSourceId,
  SupportedInvocationSourceId,
} from "./invocation";
export {
  AI_AGENT_INVOCATION_SOURCE,
  AUTOMATION_INVOCATION_SOURCE,
  findInvocationSourceDefinition,
  isGatewayRoutedActor,
  PLANNED_INVOCATION_SOURCES,
  resolveInvocationSourceFromActor,
  SUPPORTED_INVOCATION_SOURCES,
  SYSTEM_INVOCATION_SOURCE,
  USER_INVOCATION_SOURCE,
  VOICE_INVOCATION_SOURCE,
} from "./invocation";

export type {
  ActorInvocationGateway,
  AiActionGateway,
  AutomationCommandGateway,
  GatewayRouteOutcome,
  InvocationGatewayDependencies,
  InvocationGatewayDiagnostics,
  InvocationGatewayRegistry,
  VoiceActionGateway,
  CreateInvocationGatewayRegistryOptions,
} from "./gateways";
export {
  buildInvocationGatewayDiagnostics,
  buildStubGatewayOutcome,
  createDefaultInvocationGatewayRegistry,
  createStubAiActionGateway,
  createStubAutomationCommandGateway,
  createStubVoiceActionGateway,
} from "./gateways";

export {
  extractActionDescriptorsFromCapabilities,
  inferActionHandlerKind,
  mapWorkbenchActionToDescriptor,
  populateRegistryFromCapabilities,
} from "./extraction";
export type {
  ActionCapabilityRecord,
  ActionExtractionDiagnostics,
  ActionExtractionResult,
  ManifestRegistryPopulationResult,
} from "./extraction";

export type { ActionExecutionDiagnostics, ActionResultStatus } from "./types";
export type {
  ActionExecutor,
  ActionExecutorDependencies,
  ActionExecutorDiagnostics,
  ActionExecutorFactory,
  DefaultActionExecutorDependencies,
} from "./executor";
export {
  DefaultActionExecutor,
  PlaceholderActionExecutor,
  buildActionResult,
  createAuditReference,
  createDefaultActionExecutor,
  createPlaceholderActionExecutor,
} from "./executor";

export type {
  ActionExecutedEventEnvelope,
  ActionExecutedEventPayload,
  ActionExecutedEventPublishResult,
  ActionExecutedEventPublisher,
  BuildActionExecutedEventEnvelopeOptions,
} from "./audit";

export {
  CAPABILITY_ACTION_EXECUTED_EVENT_ID,
  CAPABILITY_ACTION_EXECUTED_EVENT_VERSION,
  CAPABILITY_ACTION_EXECUTED_PUBLISHER,
  CAPABILITY_ACTION_EXECUTED_CATEGORY,
  buildActionExecutedEventEnvelope,
  publishActionExecutedEvent,
} from "./audit";

export type {
  ActionFrameworkContext,
  ActionFrameworkServerDependencies,
  ActionPermissionAdapter,
  CreateActionFrameworkContextOptions,
} from "./di";
export { createActionFrameworkContext } from "./di";

export {
  createWorkbenchActionExecutorAdapter,
  createWorkbenchActionExecutorFromActionExecutor,
  createWorkbenchActionExecutorStack,
  executeShortcutViaWorkbenchApi,
  resolveShortcutActionId,
  type CreateWorkbenchActionExecutorStackOptions,
  type ExecuteShortcutViaWorkbenchApiOptions,
} from "./integration";

export type {
  KeyboardEventLike,
  ShortcutConflict,
  ShortcutRegistration,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "./shortcuts";
export {
  DefaultShortcutRegistry,
  ShortcutRegistryValidationError,
  bootstrapShortcutRegistry,
  chordFromKeyboardEvent,
  createDefaultShortcutRegistry,
  normaliseChord,
  registerShortcutsFromActions,
  type BootstrapShortcutRegistryResult,
  type RegisterShortcutsFromActionsResult,
} from "./shortcuts";

export type {
  ActionWorkbenchCommandBridge,
  WorkbenchCommandBridgeDiagnostics,
  WorkbenchCommandBridgeFactory,
  WorkbenchBridgeActionId,
} from "./bridge";
export {
  DefaultWorkbenchCommandBridge,
  WORKBENCH_BRIDGE_ACTION_IDS,
  createDefaultWorkbenchCommandBridge,
  createInitialBridgeDiagnostics,
  defaultWorkbenchCommandBridgeFactory,
  isWorkbenchBridgeActionId,
} from "./bridge";

export {
  ACTION_FRAMEWORK_PLATFORM_VERSION,
  PLATFORM_ACTION_CATALOGUE,
  actionOriginLabel,
  bootstrapActionRegistry,
  buildPlatformActionDescriptors,
  catalogueEntryToDescriptor,
  isCapabilityAction,
  isPlatformAction,
  registerBuiltInWorkbenchCommands,
  registerPlatformActionCatalogue,
  type ActionFrameworkPlatformVersion,
  type BootstrapActionRegistryOptions,
  type BootstrapActionRegistryResult,
  type PlatformActionCatalogueEntry,
  type PlatformActionRegistrationResult,
} from "./catalogue";

export {
  createCommandRegistryFromDto,
  validateActionRegistryDto,
  ClientActionRegistry,
  createEmptyClientActionRegistry,
  buildClientActionRegistryDiagnostics,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  type ReadOnlyActionRegistry,
  type ClientActionRegistryDiagnostics,
  type ClientRegistrySynchronisationState,
  type CreateCommandRegistryFromDtoOptions,
  type CreateCommandRegistryFromDtoResult,
  type ActionRegistryDtoValidationResult,
} from "./client";
