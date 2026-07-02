export type {
  CreateWorkbenchOptions,
  PartialWorkbenchDependencies,
  WorkbenchAPI,
  WorkbenchAPIHost,
  WorkbenchCapabilityContext,
  WorkbenchCapabilityHandle,
  WorkbenchCapabilityRegistrationContext,
  WorkbenchDependencies,
  WorkbenchEngine,
  WorkbenchManager,
  WorkbenchRequestBus,
} from "./interfaces/dependencies";
export type {
  WorkbenchCommandBridge,
  WorkbenchCommandEvolutionMetadata,
} from "./interfaces/command-evolution";
export { REQUEST_COMMAND_MAP } from "./interfaces/command-evolution";
export type { WorkbenchAction, WorkbenchActionId } from "./api/workbench-actions";
export {
  actionToRequest,
  requestToAction,
  requestToActionId,
} from "./api/workbench-actions";
export type { WorkbenchDiagnosticsSnapshot } from "./api/workbench-diagnostics";
export type { ActionExecutionDiagnostics } from "./api/action-execution-diagnostics";
export type {
  ActionInvocation,
  ActionInvocationContext,
  ActionInvocationDiagnostics,
  ActionInvocationRequest,
  ActionInvocationService,
} from "./api/action-invocation";
export type {
  WorkbenchActionExecutionInput,
  WorkbenchActionExecutionResult,
  WorkbenchActionExecutor,
} from "./api/workbench-action-executor";
export { actionPayload } from "./api/action-payload";
export {
  createDefaultActionInvocationService,
  DefaultActionInvocationService,
} from "./api/action-invocation";
export { WORKBENCH_API_VERSION } from "./api/workbench-api";
export {
  createWorkbenchAPI,
  createWorkbenchCapabilityContext,
  type CreateWorkbenchAPIOptions,
} from "./api/create-workbench-api";
export type {
  WorkbenchPermissionAdapter,
  WorkbenchPermissionContext,
} from "./interfaces/permission-adapter";
export type {
  WorkbenchRequest,
  WorkbenchRequestError,
  WorkbenchRequestErrorCode,
  WorkbenchRequestResult,
} from "./interfaces/requests";
export {
  PHASE1_REQUEST_TYPES,
  REQUEST_ENGINE_MAP,
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
} from "./interfaces/requests";
export type {
  ContextDiagnostics,
  ContextEngineState,
  ContextPanelState,
  DockState,
  LayoutState,
  NavigationContribution,
  NavigationDiagnostics,
  NavigationGroup,
  NavigationItem,
  NavigationState,
  OpenView,
  PanelGeometry,
  PanelState,
  PermissionDiagnostics,
  SelectionDiagnostics,
  SelectionMode,
  SelectionState,
  SessionDiagnostics,
  SessionEngineState,
  ShellRegionId,
  ShellRegionState,
  Unsubscribe,
  ViewDescriptor,
  ViewDiagnostics,
  ViewLifecycleState,
  ViewState,
  WorkbenchEngineId,
  WorkbenchNavigationLevel,
  WorkbenchPermissionAdapterKind,
  WorkbenchSelectionItem,
  WorkbenchState,
  WorkbenchStateListener,
} from "./interfaces/types";
export {
  NAVIGATION_LEVELS,
  SHELL_REGIONS,
  WORKBENCH_ENGINE_IDS,
} from "./interfaces/types";

export {
  NAVIGATION_MODEL_SCHEMA_VERSION,
  assertStableNavigationIds,
  buildNavigationModel,
  toNavigationModelItem,
} from "./navigation/platform-navigation-model";
export type {
  NavigationModel,
  NavigationModelItem,
} from "./navigation/platform-navigation-model";

export type {
  NavigationPresentationAdapter,
  NavigationPresentationTarget,
} from "./presentation/navigation-presentation-adapter";
export {
  ActivityBarPresentationAdapter,
  createActivityBarPresentationAdapter,
  defaultActivityBarPresentationAdapter,
} from "./presentation/activity-bar-presentation-adapter";
export type { ActivityBarPresentationItem } from "./presentation/activity-bar-presentation-adapter";

export {
  SidebarPresentationAdapter,
  createSidebarPresentationAdapter,
  defaultSidebarPresentationAdapter,
} from "./presentation/sidebar-presentation-adapter";
export type { SidebarPresentationItem } from "./presentation/sidebar-presentation-adapter";

export type {
  WorkbenchSurface,
  WorkbenchSurfaceId,
} from "./presentation/workbench-surface";
export { WORKBENCH_SURFACE_IDS } from "./presentation/workbench-surface";

export {
  hydrateNavigationContributionsFromRegistry,
  hydrateWorkbenchFromRegistry,
} from "./hydration/registry-hydration";
export type { RegistryHydrationResult } from "./hydration/registry-hydration";

export {
  createLayoutEngine,
  createDefaultLayoutState,
  LayoutEngine,
} from "./engines/layout-engine/layout-engine";
export {
  createNavigationEngine,
  NavigationEngine,
} from "./engines/navigation-engine/navigation-engine";
export {
  createPanelEngine,
  DEFAULT_PANEL_STATE,
  PanelEngine,
} from "./engines/panel-engine/panel-engine";
export { createViewEngine, ViewEngine } from "./engines/view-engine/view-engine";
export {
  createSessionEngine,
  SessionEngine,
} from "./engines/session-engine/session-engine";
export type { SessionRestoreResult } from "./engines/session-engine/session-engine";
export {
  ContextEngine,
  createContextEngine,
} from "./engines/context-engine/context-engine";
export {
  SelectionEngine,
  createSelectionEngine,
} from "./engines/selection-engine/selection-engine";
export {
  createEmptySelectionState,
  parseSelectionState,
} from "./engines/selection-engine/selection-state";
export { sanitizeSelectionForRestore } from "./engines/selection-engine/selection-sanitize";
export { createDockEngine, DockEngine } from "./engines/scaffold-engines";

export {
  WORKBENCH_SESSION_SCHEMA_VERSION,
  createEmptySessionPayload,
  parseWorkbenchSessionPayload,
} from "./session/workbench-session-payload";
export type {
  SessionParseOutcome,
  SessionRestoreStatus,
  WorkbenchSessionPayload,
  WorkbenchSessionViewEntry,
} from "./session/workbench-session-payload";
export { captureWorkbenchSession } from "./session/session-capture";
export { sanitizeSessionForRestore } from "./session/session-restore";
export type {
  SanitizedWorkbenchSession,
  SessionRestoreContext,
} from "./session/session-restore";
export {
  createWorkbenchSessionStorageKey,
  type SessionStore,
} from "./session/session-store";
export {
  createMemorySessionStore,
  MemorySessionStore,
} from "./session/memory-session-store";
export {
  createLocalStorageSessionStore,
  LocalStorageSessionStore,
} from "./session/local-storage-session-store";

export {
  AllowAllWorkbenchPermissionAdapter,
  createAllowAllWorkbenchPermissionAdapter,
} from "./permission/allow-all-adapter";
export {
  AuthWorkbenchPermissionAdapter,
  createAuthWorkbenchPermissionAdapter,
  mapAuthSessionToContext,
  type AuthSessionPermissionInput,
} from "./permission/auth-permission-adapter";
export {
  createWorkbenchPermissionAdapter,
  resolveWorkbenchPermissionAdapterMode,
  type CreateWorkbenchPermissionAdapterOptions,
  type WorkbenchPermissionAdapterMode,
} from "./permission/create-permission-adapter";
export {
  ScaffoldWorkbenchPermissionAdapter,
  createScaffoldWorkbenchPermissionAdapter,
} from "./permission/scaffold-permission-adapter";

export {
  createWorkbenchManager,
  DefaultWorkbenchManager,
  type WorkbenchManagerInternals,
} from "./workbench-manager/workbench-manager";

export {
  createWorkbenchRequestBus,
  WorkbenchRequestBusImpl,
} from "./request-bus/request-bus";

import { createWorkbenchRequestBus } from "./request-bus/request-bus";

/** Default Workbench Request Bus singleton for app bootstrap. */
export const Workbench = createWorkbenchRequestBus();

export const WORKBENCH_FRAMEWORK_STATUS = "phase-7-workbench-api" as const;
