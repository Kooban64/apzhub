import {
  createLayoutEngine,
  type LayoutEngine,
} from "../engines/layout-engine/layout-engine";
import {
  createNavigationEngine,
  type NavigationEngine,
} from "../engines/navigation-engine/navigation-engine";
import {
  createPanelEngine,
  type PanelEngine,
} from "../engines/panel-engine/panel-engine";
import { createViewEngine, type ViewEngine } from "../engines/view-engine/view-engine";
import {
  createSessionEngine,
  type SessionEngine,
} from "../engines/session-engine/session-engine";
import {
  createContextEngine,
  type ContextEngine,
} from "../engines/context-engine/context-engine";
import {
  createSelectionEngine,
  type SelectionEngine,
} from "../engines/selection-engine/selection-engine";
import { createDockEngine, type DockEngine } from "../engines/scaffold-engines";
import type {
  CreateWorkbenchOptions,
  WorkbenchCapabilityHandle,
  WorkbenchDependencies,
  WorkbenchEngine,
  WorkbenchManager,
} from "../interfaces/dependencies";
import type { WorkbenchPermissionAdapter } from "../interfaces/permission-adapter";
import { REQUEST_ENGINE_MAP, type WorkbenchRequest } from "../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestResult,
} from "../interfaces/requests";
import type { NavigationModel } from "../navigation/platform-navigation-model";
import type {
  ContextDiagnostics,
  NavigationContribution,
  PermissionDiagnostics,
  SelectionDiagnostics,
  SessionDiagnostics,
  ShellRegionId,
  Unsubscribe,
  ViewDescriptor,
  ViewDiagnostics,
  ViewState,
  WorkbenchState,
  WorkbenchStateListener,
} from "../interfaces/types";
import { createWorkbenchPermissionAdapter } from "../permission/create-permission-adapter";
import type { SessionStore } from "../session/session-store";
import type { SessionRestoreResult } from "../engines/session-engine/session-engine";

export interface WorkbenchManagerInternals {
  layoutEngine: LayoutEngine;
  panelEngine: PanelEngine;
  viewEngine: ViewEngine;
  navigationEngine: NavigationEngine;
  sessionEngine: SessionEngine;
  dockEngine: DockEngine;
  contextEngine: ContextEngine;
  selectionEngine: SelectionEngine;
}

export class DefaultWorkbenchManager
  implements WorkbenchManager, WorkbenchManagerInternals
{
  readonly layoutEngine: LayoutEngine;

  readonly panelEngine: PanelEngine;

  readonly viewEngine: ViewEngine;

  readonly navigationEngine: NavigationEngine;

  readonly sessionEngine: SessionEngine;

  readonly dockEngine: DockEngine;

  readonly contextEngine: ContextEngine;

  readonly selectionEngine: SelectionEngine;

  private readonly permissionAdapter: WorkbenchPermissionAdapter;

  private readonly listeners = new Set<WorkbenchStateListener>();

  private readonly sessionStore?: SessionStore;

  private readonly persistDebounceMs: number;

  private persistUserId: string | undefined;

  private persistTimer: ReturnType<typeof setTimeout> | undefined;

  private persistChain: Promise<void> = Promise.resolve();

  private isRestoring = false;

  private readonly enginesById: Map<string, WorkbenchEngine>;

  constructor(options: CreateWorkbenchOptions = {}) {
    const deps = resolveDependencies(options.dependencies);
    this.permissionAdapter = deps.permissionAdapter;
    this.sessionStore = deps.sessionStore;
    this.persistDebounceMs = deps.persistDebounceMs ?? 300;

    this.layoutEngine = createLayoutEngine();
    this.panelEngine = createPanelEngine();
    this.viewEngine = createViewEngine({
      permissionAdapter: this.permissionAdapter,
      descriptors: deps.viewDescriptors,
    });
    this.navigationEngine = createNavigationEngine({
      permissionAdapter: this.permissionAdapter,
      contributions: deps.navigationContributions,
    });
    this.sessionEngine = createSessionEngine({
      sessionStore: deps.sessionStore,
      storageBackend: deps.sessionStorageBackend,
    });
    this.dockEngine = createDockEngine();
    this.contextEngine = createContextEngine();
    this.selectionEngine = createSelectionEngine({
      permissionAdapter: this.permissionAdapter,
    });

    this.enginesById = new Map<string, WorkbenchEngine>([
      [this.layoutEngine.id, this.layoutEngine],
      [this.panelEngine.id, this.panelEngine],
      [this.viewEngine.id, this.viewEngine],
      [this.navigationEngine.id, this.navigationEngine],
      [this.sessionEngine.id, this.sessionEngine],
      [this.dockEngine.id, this.dockEngine],
      [this.contextEngine.id, this.contextEngine],
      [this.selectionEngine.id, this.selectionEngine],
    ]);
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    const engineId = REQUEST_ENGINE_MAP[request.type];
    const engine = this.enginesById.get(engineId);

    if (!engine) {
      return workbenchRequestFail(
        workbenchRequestError(
          "ENGINE_ERROR",
          `No engine registered for request type "${request.type}"`,
        ),
      );
    }

    if (!this.permissionAdapter.can(getRequestPermission(request))) {
      this.permissionAdapter.recordDeniedRequest?.();
      return workbenchRequestFail(
        workbenchRequestError(
          "FORBIDDEN",
          "Permission denied for workbench request",
          engineId,
        ),
      );
    }

    const previousState = this.getState();
    const result = engine.handleRequest(request);

    if (result.ok) {
      this.coordinateLayoutForPanelRequest(request);
      this.coordinateSelectionForViewRequest(request, previousState);
    }

    if (result.ok && stateChanged(previousState, this.getState())) {
      this.syncDerivedState(previousState);
      this.notifyListeners();
    }

    return result;
  }

  getState(): WorkbenchState {
    return {
      layout: this.layoutEngine.getState(),
      panels: this.panelEngine.getState(),
      navigation: this.navigationEngine.getState(),
      views: this.viewEngine.getState(),
      session: this.sessionEngine.getState(),
      dock: this.dockEngine.getState(),
      context: this.contextEngine.getState(),
      selection: this.selectionEngine.getState(),
    };
  }

  subscribe(listener: WorkbenchStateListener): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  createCapabilityHandle(): WorkbenchCapabilityHandle {
    return {
      publish: (request) => this.handleRequest(request),
      getState: () => this.getState(),
      subscribe: (listener) => this.subscribe(listener),
    };
  }

  getPermissionAdapter(): WorkbenchPermissionAdapter {
    return this.permissionAdapter;
  }

  loadNavigationContributions(contributions: readonly NavigationContribution[]): void {
    this.navigationEngine.loadContributions(contributions);
    this.notifyListeners();
  }

  loadViewDescriptors(descriptors: readonly ViewDescriptor[]): void {
    this.viewEngine.loadDescriptors(descriptors);
    this.notifyListeners();
  }

  getNavigationDiagnostics() {
    return this.navigationEngine.getDiagnostics();
  }

  getViewDiagnostics(): ViewDiagnostics {
    return this.viewEngine.getDiagnostics();
  }

  getNavigationModel(): NavigationModel {
    return this.navigationEngine.getNavigationModel();
  }

  getViewState(): ViewState {
    return this.viewEngine.getState();
  }

  getSessionDiagnostics(): SessionDiagnostics {
    return this.sessionEngine.getDiagnostics();
  }

  getContextDiagnostics(): ContextDiagnostics {
    return this.contextEngine.getDiagnostics();
  }

  getSelectionDiagnostics(): SelectionDiagnostics {
    return this.selectionEngine.getDiagnostics();
  }

  getPermissionDiagnostics(): PermissionDiagnostics {
    if (this.permissionAdapter.getDiagnostics) {
      return this.permissionAdapter.getDiagnostics();
    }

    return {
      adapterKind: this.permissionAdapter.kind ?? "unknown",
      hasContext: this.permissionAdapter.getContext() !== null,
      userId: this.permissionAdapter.getContext()?.userId,
      roleCount: this.permissionAdapter.getContext()?.roles.length ?? 0,
      permissionCount: this.permissionAdapter.getContext()?.permissions.size ?? 0,
      deniedRequestCount: 0,
      filteredItemCount: 0,
    };
  }

  async restoreSession(userId: string): Promise<SessionRestoreResult> {
    this.isRestoring = true;

    try {
      const result = await this.sessionEngine.restore(userId, {
        permissionAdapter: this.permissionAdapter,
        navigationItems: this.navigationEngine.getState().items,
        viewDescriptors: this.viewEngine.getState().descriptors,
        setActiveWorkspace: (workspaceId) =>
          this.navigationEngine.setActiveWorkspace(workspaceId),
        applyPanelState: (panels) => this.panelEngine.applyPanelPreferences(panels),
        applyLayoutPreferences: (layout) =>
          this.layoutEngine.applyLayoutPreferences(layout),
        applyDock: (dock) => this.dockEngine.applySplitRatios(dock?.splitRatios),
        restoreFocusedView: (viewId, workspace) =>
          this.viewEngine.restoreFocusedView(viewId, workspace),
        applySelection: (selection) =>
          this.selectionEngine.applySelection(
            selection,
            this.viewEngine.getState().focusedViewId,
          ),
      });

      this.syncDerivedState();

      if (!result.restored) {
        this.activateDefaultViewForActiveWorkspace();
      }

      this.notifyListeners(false);
      return result;
    } finally {
      this.isRestoring = false;
    }
  }

  enableSessionPersistence(userId: string): void {
    this.persistUserId = userId;
    this.sessionEngine.setPersistenceEnabled(true, userId);
  }

  disableSessionPersistence(): void {
    const userId = this.persistUserId;
    if (this.persistTimer && userId && !this.isRestoring) {
      clearTimeout(this.persistTimer);
      this.persistTimer = undefined;
      // Flush pending debounce so Personalisation layout is not dropped on teardown.
      this.enqueuePersist(userId);
    } else if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = undefined;
    }
    this.persistUserId = undefined;
    this.sessionEngine.setPersistenceEnabled(false);
  }

  /** Await any debounced or in-flight Personalisation layout persist (deterministic sync). */
  async flushPendingPersist(): Promise<void> {
    const userId = this.persistUserId;
    if (this.persistTimer && userId && !this.isRestoring) {
      clearTimeout(this.persistTimer);
      this.persistTimer = undefined;
      this.enqueuePersist(userId);
    }
    await this.persistChain;
  }

  async clearSession(userId: string): Promise<void> {
    await this.sessionEngine.clear(userId);
    this.notifyListeners(false);
  }

  activateDefaultViewForActiveWorkspace(): WorkbenchRequestResult {
    const workspace = this.navigationEngine.getState().activeWorkspaceId;
    if (!workspace) {
      return workbenchRequestOk();
    }

    const defaultView = this.viewEngine.getDefaultViewForWorkspace(workspace);
    if (!defaultView) {
      return workbenchRequestOk();
    }

    const previousState = this.getState();
    const result = this.viewEngine.openView(defaultView.viewId, workspace);

    if (result.ok && stateChanged(previousState, this.getState())) {
      this.syncDerivedState(previousState);
      this.notifyListeners();
    }

    return result;
  }

  selectActivityBarNavigationItem(navId: string): WorkbenchRequestResult {
    const item = this.navigationEngine
      .getNavigationModel()
      .activityBar.find((entry) => entry.id === navId);

    if (!item) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Activity bar navigation item "${navId}" was not found`,
          this.navigationEngine.id,
        ),
      );
    }

    const previousState = this.getState();
    const workspaceResult = this.navigationEngine.setActiveWorkspace(item.workspace);
    if (!workspaceResult.ok) {
      return workspaceResult;
    }

    const viewId =
      this.viewEngine.resolveViewIdForNavigationItem(item) ??
      this.viewEngine.getDefaultViewForWorkspace(item.workspace)?.viewId;

    let result = workspaceResult;
    if (viewId) {
      result = this.viewEngine.openView(viewId, item.workspace);
    }

    if (result.ok && stateChanged(previousState, this.getState())) {
      this.syncDerivedState(previousState);
      this.notifyListeners();
    }

    return result;
  }

  selectSidebarNavigationItem(navId: string): WorkbenchRequestResult {
    const item = this.navigationEngine
      .getNavigationModel()
      .sidebar.find((entry) => entry.id === navId);

    if (!item) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Sidebar navigation item "${navId}" was not found`,
          this.navigationEngine.id,
        ),
      );
    }

    const previousState = this.getState();
    const workspaceResult = this.navigationEngine.setActiveWorkspace(item.workspace);
    if (!workspaceResult.ok) {
      return workspaceResult;
    }

    const viewId = this.viewEngine.resolveViewIdForNavigationItem(item);
    if (!viewId) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `No view registered for sidebar item "${navId}"`,
          this.viewEngine.id,
        ),
      );
    }

    const result = this.viewEngine.openView(viewId, item.workspace);

    if (result.ok && stateChanged(previousState, this.getState())) {
      this.syncDerivedState(previousState);
      this.notifyListeners();
    }

    return result;
  }

  activateViewForRoute(route: string): WorkbenchRequestResult {
    const viewId = this.viewEngine.resolveViewIdForRoute(route);
    if (!viewId) {
      return workbenchRequestOk();
    }

    const descriptor = this.viewEngine
      .getState()
      .descriptors.find((entry) => entry.viewId === viewId);
    const previousState = this.getState();

    if (descriptor) {
      const workspaceResult = this.navigationEngine.setActiveWorkspace(
        descriptor.workspace,
      );
      if (!workspaceResult.ok) {
        return workspaceResult;
      }
    }

    const result = this.viewEngine.openView(viewId, descriptor?.workspace);

    if (result.ok && stateChanged(previousState, this.getState())) {
      this.syncDerivedState(previousState);
      this.notifyListeners();
    }

    return result;
  }

  private coordinateLayoutForPanelRequest(request: WorkbenchRequest): void {
    if (request.type === "openPanel") {
      this.layoutEngine.setRegionVisibility(panelIdToRegion(request.panelId), true);
    }
    if (request.type === "closePanel") {
      this.layoutEngine.setRegionVisibility(panelIdToRegion(request.panelId), false);
    }
  }

  private coordinateSelectionForViewRequest(
    request: WorkbenchRequest,
    previousState: WorkbenchState,
  ): void {
    if (
      request.type !== "openView" &&
      request.type !== "closeView" &&
      request.type !== "focusView"
    ) {
      return;
    }

    const focusedViewId = this.viewEngine.getState().focusedViewId;
    if (focusedViewId !== previousState.views.focusedViewId) {
      this.selectionEngine.switchActiveView(focusedViewId);
    }
  }

  private syncDerivedState(previousState?: WorkbenchState): void {
    const views = this.viewEngine.getState();

    if (previousState && previousState.views.focusedViewId !== views.focusedViewId) {
      this.selectionEngine.switchActiveView(views.focusedViewId);
    }

    this.contextEngine.syncFromWorkbench({
      navigation: this.navigationEngine.getState(),
      views,
      selection: this.selectionEngine.getState(),
    });

    if (!views.focusedViewId && !this.navigationEngine.getState().activeWorkspaceId) {
      this.contextEngine.clearInvalidContext();
    }
  }

  private notifyListeners(schedulePersist = true): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }

    if (schedulePersist && this.persistUserId && !this.isRestoring) {
      this.schedulePersist(this.persistUserId);
    }
  }

  private schedulePersist(userId: string): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(() => {
      this.persistTimer = undefined;
      this.enqueuePersist(userId);
    }, this.persistDebounceMs);
  }

  private enqueuePersist(userId: string): void {
    this.persistChain = this.persistChain
      .catch(() => undefined)
      .then(() =>
        this.sessionEngine.persist(
          userId,
          this.getState(),
          this.navigationEngine.getState(),
        ),
      );
  }
}

export function createWorkbenchManager(
  options?: CreateWorkbenchOptions,
): DefaultWorkbenchManager {
  return new DefaultWorkbenchManager(options);
}

function resolveDependencies(
  partial?: Partial<WorkbenchDependencies>,
): WorkbenchDependencies {
  return {
    permissionAdapter:
      partial?.permissionAdapter ??
      createWorkbenchPermissionAdapter({ nodeEnv: process.env.NODE_ENV }),
    navigationContributions: partial?.navigationContributions ?? [],
    viewDescriptors: partial?.viewDescriptors ?? [],
    sessionStore: partial?.sessionStore,
    sessionStorageBackend: partial?.sessionStore
      ? (partial?.sessionStorageBackend ?? "memory")
      : "none",
    persistDebounceMs: partial?.persistDebounceMs ?? 300,
  };
}

function getRequestPermission(request: WorkbenchRequest): string | undefined {
  if ("permission" in request && typeof request.permission === "string") {
    return request.permission;
  }
  return undefined;
}

function panelIdToRegion(panelId: "sidebar" | "context"): ShellRegionId {
  return panelId;
}

function stateChanged(before: WorkbenchState, after: WorkbenchState): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}
