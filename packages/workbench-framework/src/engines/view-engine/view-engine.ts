import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchPermissionAdapter } from "../../interfaces/permission-adapter";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";
import type {
  OpenView,
  ViewDescriptor,
  ViewDiagnostics,
  ViewState,
} from "../../interfaces/types";

export interface ViewEngineOptions {
  permissionAdapter: WorkbenchPermissionAdapter;
  descriptors?: readonly ViewDescriptor[];
}

export class ViewEngine implements WorkbenchEngine {
  readonly id = "view" as const;

  private readonly permissionAdapter: WorkbenchPermissionAdapter;

  private descriptors: ViewDescriptor[] = [];

  private openViews: OpenView[] = [];

  private focusedViewId: string | undefined;

  private diagnostics: ViewDiagnostics = emptyDiagnostics();

  constructor(options: ViewEngineOptions) {
    this.permissionAdapter = options.permissionAdapter;
    if (options.descriptors) {
      this.loadDescriptors(options.descriptors);
    }
  }

  loadDescriptors(descriptors: readonly ViewDescriptor[]): void {
    this.descriptors = [...descriptors];
    this.rebuildDiagnostics();
    this.pruneOpenViews();
  }

  getState(): ViewState {
    return {
      descriptors: this.getVisibleDescriptors(),
      openViews: this.openViews,
      focusedViewId: this.focusedViewId,
    };
  }

  getStateSlice(): ViewState {
    return this.getState();
  }

  getDiagnostics(): ViewDiagnostics {
    return this.diagnostics;
  }

  getDefaultViewForWorkspace(workspace: string): ViewDescriptor | undefined {
    const workspaceViews = this.getVisibleDescriptors().filter(
      (descriptor) => descriptor.workspace === workspace,
    );

    return workspaceViews.find((descriptor) => descriptor.default) ?? workspaceViews[0];
  }

  /**
   * Resolve the best registered view for a pathname.
   * Prefers the longest matching view route (exact or prefix) so product deep links
   * such as `/workspace/projects/{id}` activate the workspace view instead of leaving
   * a stale Home focus that the shell route-sync effect would rewind to.
   */
  resolveViewIdForRoute(route: string): string | undefined {
    let best: { viewId: string; routeLength: number } | undefined;

    for (const descriptor of this.getVisibleDescriptors()) {
      const candidate = descriptor.route;
      if (!candidate) {
        continue;
      }
      if (route === candidate || route.startsWith(`${candidate}/`)) {
        if (!best || candidate.length > best.routeLength) {
          best = { viewId: descriptor.viewId, routeLength: candidate.length };
        }
      }
    }

    return best?.viewId;
  }

  resolveViewIdForNavigationItem(item: {
    readonly id: string;
    readonly capabilityId: string;
    readonly route?: string;
  }): string | undefined {
    if (item.route) {
      const byRoute = this.resolveViewIdForRoute(item.route);
      if (byRoute) {
        return byRoute;
      }
    }

    const byId = this.getVisibleDescriptors().find(
      (descriptor) =>
        descriptor.viewId === item.id || descriptor.viewId === item.capabilityId,
    );

    return byId?.viewId;
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    if (request.type === "openView") {
      return this.openView(request.viewId, request.workspace, request.params);
    }

    if (request.type === "closeView") {
      return this.closeView(request.viewId);
    }

    if (request.type === "focusView") {
      return this.focusView(request.viewId);
    }

    return workbenchRequestFail(
      workbenchRequestError(
        "INVALID_REQUEST",
        `View Engine cannot handle request type "${request.type}"`,
        this.id,
      ),
    );
  }

  openView(
    viewId: string,
    workspace?: string,
    params?: Record<string, unknown>,
  ): WorkbenchRequestResult {
    const descriptor = this.findVisibleDescriptor(viewId);
    if (!descriptor) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `View "${viewId}" is not registered`,
          this.id,
        ),
      );
    }

    if (descriptor.permission && !this.permissionAdapter.can(descriptor.permission)) {
      return workbenchRequestFail(
        workbenchRequestError(
          "FORBIDDEN",
          `View "${viewId}" is not permitted`,
          this.id,
        ),
      );
    }

    const targetWorkspace = workspace ?? descriptor.workspace;
    const existing = this.openViews.find((view) => view.viewId === viewId);

    if (existing) {
      this.focusedViewId = viewId;
      return workbenchRequestOk();
    }

    this.openViews = [
      ...this.openViews,
      {
        viewId: descriptor.viewId,
        workspace: targetWorkspace,
        title: descriptor.title,
        route: descriptor.route,
        params,
        lifecycle: "placeholder",
      },
    ];
    this.focusedViewId = viewId;
    this.diagnostics = {
      ...this.diagnostics,
      openViewCount: this.openViews.length,
      focusedViewId: this.focusedViewId,
    };

    return workbenchRequestOk();
  }

  private closeView(viewId: string): WorkbenchRequestResult {
    const exists = this.openViews.some((view) => view.viewId === viewId);
    if (!exists) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `View "${viewId}" is not open`,
          this.id,
        ),
      );
    }

    this.openViews = this.openViews.filter((view) => view.viewId !== viewId);

    if (this.focusedViewId === viewId) {
      this.focusedViewId = this.openViews.at(-1)?.viewId;
    }

    this.diagnostics = {
      ...this.diagnostics,
      openViewCount: this.openViews.length,
      focusedViewId: this.focusedViewId,
    };

    return workbenchRequestOk();
  }

  private focusView(viewId: string): WorkbenchRequestResult {
    const exists = this.openViews.some((view) => view.viewId === viewId);
    if (!exists) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `View "${viewId}" is not open`,
          this.id,
        ),
      );
    }

    this.focusedViewId = viewId;
    this.diagnostics = { ...this.diagnostics, focusedViewId: viewId };
    return workbenchRequestOk();
  }

  restoreFocusedView(
    viewId: string | undefined,
    workspace: string,
  ): WorkbenchRequestResult {
    this.openViews = [];
    this.focusedViewId = undefined;
    this.diagnostics = {
      ...this.diagnostics,
      openViewCount: 0,
      focusedViewId: undefined,
    };

    if (!viewId) {
      return workbenchRequestOk();
    }

    return this.openView(viewId, workspace);
  }

  private findVisibleDescriptor(viewId: string): ViewDescriptor | undefined {
    return this.getVisibleDescriptors().find(
      (descriptor) => descriptor.viewId === viewId,
    );
  }

  private getVisibleDescriptors(): ViewDescriptor[] {
    return this.descriptors.filter(
      (descriptor) =>
        !descriptor.permission || this.permissionAdapter.can(descriptor.permission),
    );
  }

  private rebuildDiagnostics(): void {
    const duplicateViewIds = findDuplicateViewIds(this.descriptors);
    const visibleDescriptors = this.getVisibleDescriptors();

    this.diagnostics = {
      descriptorCount: this.descriptors.length,
      visibleDescriptorCount: visibleDescriptors.length,
      permissionFilteredCount: this.descriptors.length - visibleDescriptors.length,
      duplicateViewIds,
      openViewCount: this.openViews.length,
      focusedViewId: this.focusedViewId,
    };
  }

  private pruneOpenViews(): void {
    const visibleIds = new Set(
      this.getVisibleDescriptors().map((descriptor) => descriptor.viewId),
    );
    this.openViews = this.openViews.filter((view) => visibleIds.has(view.viewId));

    if (this.focusedViewId && !visibleIds.has(this.focusedViewId)) {
      this.focusedViewId = this.openViews.at(-1)?.viewId;
    }

    this.diagnostics = {
      ...this.diagnostics,
      openViewCount: this.openViews.length,
      focusedViewId: this.focusedViewId,
    };
  }
}

export function createViewEngine(options: ViewEngineOptions): ViewEngine {
  return new ViewEngine(options);
}

function findDuplicateViewIds(descriptors: readonly ViewDescriptor[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const descriptor of descriptors) {
    if (seen.has(descriptor.viewId)) {
      duplicates.add(descriptor.viewId);
      continue;
    }
    seen.add(descriptor.viewId);
  }

  return [...duplicates];
}

function emptyDiagnostics(): ViewDiagnostics {
  return {
    descriptorCount: 0,
    visibleDescriptorCount: 0,
    permissionFilteredCount: 0,
    duplicateViewIds: [],
    openViewCount: 0,
    focusedViewId: undefined,
  };
}
