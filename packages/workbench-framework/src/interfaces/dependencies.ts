import type { WorkbenchPermissionAdapter } from "./permission-adapter";
import type { WorkbenchRequest, WorkbenchRequestResult } from "./requests";
import type { NavigationModel } from "../navigation/platform-navigation-model";
import type {
  ContextDiagnostics,
  NavigationContribution,
  NavigationDiagnostics,
  PermissionDiagnostics,
  SelectionDiagnostics,
  SessionDiagnostics,
  ViewDescriptor,
  ViewDiagnostics,
  ViewState,
  WorkbenchEngineId,
  WorkbenchState,
} from "./types";
import type { SessionRestoreResult } from "../engines/session-engine/session-engine";
import type { SessionStore } from "../session/session-store";

export interface WorkbenchEngine {
  readonly id: WorkbenchEngineId;
  getStateSlice(): unknown;
  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult;
}

export interface WorkbenchDependencies {
  permissionAdapter: WorkbenchPermissionAdapter;
  navigationContributions?: readonly NavigationContribution[];
  viewDescriptors?: readonly ViewDescriptor[];
  sessionStore?: SessionStore;
  sessionStorageBackend?: SessionDiagnostics["storageBackend"];
  persistDebounceMs?: number;
}

export type PartialWorkbenchDependencies = Partial<WorkbenchDependencies>;

export interface CreateWorkbenchOptions {
  dependencies?: PartialWorkbenchDependencies;
  readonly actionExecutor?: import("../api/workbench-action-executor").WorkbenchActionExecutor;
  readonly actionInvocation?: import("../api/action-invocation").ActionInvocationService;
}

export interface WorkbenchManager {
  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: (state: WorkbenchState) => void): () => void;
  loadNavigationContributions(contributions: readonly NavigationContribution[]): void;
  loadViewDescriptors(descriptors: readonly ViewDescriptor[]): void;
  getNavigationDiagnostics(): NavigationDiagnostics;
  getViewDiagnostics(): ViewDiagnostics;
  getSessionDiagnostics(): SessionDiagnostics;
  getContextDiagnostics(): ContextDiagnostics;
  getSelectionDiagnostics(): SelectionDiagnostics;
  getPermissionDiagnostics(): PermissionDiagnostics;
  getNavigationModel(): NavigationModel;
  getViewState(): ViewState;
  restoreSession(userId: string): Promise<SessionRestoreResult>;
  enableSessionPersistence(userId: string): void;
  disableSessionPersistence(): void;
  clearSession(userId: string): Promise<void>;
  activateDefaultViewForActiveWorkspace(): WorkbenchRequestResult;
  activateViewForRoute(route: string): WorkbenchRequestResult;
  selectActivityBarNavigationItem(navId: string): WorkbenchRequestResult;
  selectSidebarNavigationItem(navId: string): WorkbenchRequestResult;
}

export interface WorkbenchRequestBus {
  publish(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: (state: WorkbenchState) => void): () => void;
  loadNavigationContributions(contributions: readonly NavigationContribution[]): void;
  loadViewDescriptors(descriptors: readonly ViewDescriptor[]): void;
  getNavigationDiagnostics(): NavigationDiagnostics;
  getViewDiagnostics(): ViewDiagnostics;
  getSessionDiagnostics(): SessionDiagnostics;
  getContextDiagnostics(): ContextDiagnostics;
  getSelectionDiagnostics(): SelectionDiagnostics;
  getPermissionDiagnostics(): PermissionDiagnostics;
  getNavigationModel(): NavigationModel;
  getViewState(): ViewState;
  restoreSession(userId: string): Promise<SessionRestoreResult>;
  enableSessionPersistence(userId: string): void;
  disableSessionPersistence(): void;
  clearSession(userId: string): Promise<void>;
  activateDefaultViewForActiveWorkspace(): WorkbenchRequestResult;
  activateViewForRoute(route: string): WorkbenchRequestResult;
  selectActivityBarNavigationItem(navId: string): WorkbenchRequestResult;
  selectSidebarNavigationItem(navId: string): WorkbenchRequestResult;
}

/** @deprecated Use WorkbenchAPI via createWorkbenchCapabilityContext(). */
export interface WorkbenchCapabilityHandle {
  publish(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: (state: WorkbenchState) => void): () => void;
}

/** @deprecated Use WorkbenchCapabilityRegistrationContext. */
export interface WorkbenchCapabilityContext {
  workbench: WorkbenchCapabilityHandle;
}

export type {
  WorkbenchAPI,
  WorkbenchAPIHost,
  WorkbenchCapabilityRegistrationContext,
} from "../api/workbench-api";
