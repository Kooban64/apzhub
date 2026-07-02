import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";
import type {
  ContextDiagnostics,
  ContextEngineState,
  NavigationState,
  SelectionState,
  ViewState,
} from "../../interfaces/types";

export interface WorkbenchContextSyncInput {
  readonly navigation: NavigationState;
  readonly views: ViewState;
  readonly selection: SelectionState;
}

export class ContextEngine implements WorkbenchEngine {
  readonly id = "context" as const;

  private state: ContextEngineState = {};

  private diagnostics: ContextDiagnostics = emptyDiagnostics();

  getState(): ContextEngineState {
    return this.state;
  }

  getStateSlice(): ContextEngineState {
    return this.getState();
  }

  getDiagnostics(): ContextDiagnostics {
    return this.diagnostics;
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    if (request.type !== "setContext") {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Context Engine cannot handle request type "${request.type}"`,
          this.id,
        ),
      );
    }

    return this.setContext(request.contextKey, request.payload);
  }

  setContext(
    contextKey: string,
    payload?: Record<string, unknown>,
  ): WorkbenchRequestResult {
    if (!contextKey.trim()) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          "contextKey must be a non-empty string",
          this.id,
        ),
      );
    }

    this.state = {
      ...this.state,
      activeKey: contextKey,
      payload: payload ? { ...payload } : undefined,
    };

    this.refreshDiagnostics();
    return workbenchRequestOk();
  }

  syncFromWorkbench(input: WorkbenchContextSyncInput): void {
    const { navigation, views, selection } = input;
    const activeWorkspaceId = navigation.activeWorkspaceId || undefined;
    const activeViewId = views.focusedViewId;
    const focusedView = views.openViews.find((view) => view.viewId === activeViewId);
    const activeRoute = focusedView?.route;

    const sidebarItems = navigation.items.filter(
      (item) => item.level === "sidebar" && item.workspace === activeWorkspaceId,
    );

    const selectedNavItemId =
      sidebarItems.find((item) => activeRoute && item.route === activeRoute)?.id ??
      sidebarItems[0]?.id;

    const selectedItemId = selection.items[0]?.id;

    this.state = {
      ...this.state,
      activeWorkspaceId,
      activeViewId,
      activeRoute,
      selectedNavItemId,
      selectedItemId,
    };

    this.refreshDiagnostics();
  }

  clearInvalidContext(): void {
    if (!this.state.activeViewId && !this.state.activeWorkspaceId) {
      return;
    }

    this.state = {
      activeKey: this.state.activeKey,
      payload: this.state.payload,
    };

    this.refreshDiagnostics();
  }

  private refreshDiagnostics(): void {
    this.diagnostics = {
      activeWorkspaceId: this.state.activeWorkspaceId,
      activeViewId: this.state.activeViewId,
      activeRoute: this.state.activeRoute,
      selectedNavItemId: this.state.selectedNavItemId,
      selectedItemId: this.state.selectedItemId,
      activeKey: this.state.activeKey,
      hasPayload: Boolean(
        this.state.payload && Object.keys(this.state.payload).length > 0,
      ),
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export function createContextEngine(): ContextEngine {
  return new ContextEngine();
}

function emptyDiagnostics(): ContextDiagnostics {
  return {
    hasPayload: false,
  };
}
