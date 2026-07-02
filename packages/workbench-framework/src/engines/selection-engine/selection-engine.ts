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
  SelectionDiagnostics,
  SelectionState,
  WorkbenchSelectionItem,
} from "../../interfaces/types";
import {
  createEmptySelectionState,
  inferSelectionMode,
  normalizeSelectionItem,
} from "./selection-state";
import { sanitizeSelectionForRestore } from "./selection-sanitize";

export interface SelectionEngineOptions {
  readonly permissionAdapter: WorkbenchPermissionAdapter;
}

export class SelectionEngine implements WorkbenchEngine {
  readonly id = "selection" as const;

  private readonly permissionAdapter: WorkbenchPermissionAdapter;

  private state: SelectionState = createEmptySelectionState();

  private diagnostics: SelectionDiagnostics = emptyDiagnostics();

  constructor(options: SelectionEngineOptions) {
    this.permissionAdapter = options.permissionAdapter;
  }

  getState(): SelectionState {
    return this.state;
  }

  getStateSlice(): SelectionState {
    return this.getState();
  }

  getDiagnostics(): SelectionDiagnostics {
    return this.diagnostics;
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    if (request.type !== "setSelection") {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Selection Engine cannot handle request type "${request.type}"`,
          this.id,
        ),
      );
    }

    return this.setSelection(request.selection);
  }

  setSelection(input: {
    items: WorkbenchSelectionItem[];
    mode?: "clear" | "single" | "multi";
    viewId?: string;
  }): WorkbenchRequestResult {
    const viewId = input.viewId ?? this.state.activeViewId;
    if (!viewId) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          "Selection requires an active view",
          this.id,
        ),
      );
    }

    if (input.mode === "clear" || input.items.length === 0) {
      this.clearSelection(viewId);
      return workbenchRequestOk();
    }

    const normalized = input.items
      .map((item) => normalizeSelectionItem(item))
      .filter((item): item is WorkbenchSelectionItem => item !== null);

    const accessible = this.permissionAdapter.filter(normalized);
    const droppedInvalidCount = normalized.length - accessible.length;

    const requestedMode = input.mode ?? inferSelectionMode(accessible);
    const items = requestedMode === "single" ? accessible.slice(0, 1) : accessible;
    const byView = {
      ...this.state.byView,
      [viewId]: items,
    };
    const isActiveView = !this.state.activeViewId || this.state.activeViewId === viewId;

    this.state = {
      activeViewId: isActiveView ? viewId : this.state.activeViewId,
      mode: isActiveView ? inferSelectionMode(items) : this.state.mode,
      items: isActiveView ? items : this.state.items,
      byView,
    };

    this.diagnostics = {
      activeViewId: this.state.activeViewId,
      mode: this.state.mode,
      itemCount: this.state.items.length,
      viewCount: Object.keys(this.state.byView).length,
      droppedInvalidCount: this.diagnostics.droppedInvalidCount + droppedInvalidCount,
      lastUpdatedAt: new Date().toISOString(),
    };

    return workbenchRequestOk();
  }

  clearSelection(viewId?: string): void {
    const targetViewId = viewId ?? this.state.activeViewId;
    if (!targetViewId) {
      this.state = createEmptySelectionState();
      this.refreshDiagnostics();
      return;
    }

    const byView = { ...this.state.byView };
    delete byView[targetViewId];

    const isActive = this.state.activeViewId === targetViewId;

    this.state = {
      activeViewId: isActive ? undefined : this.state.activeViewId,
      mode: isActive ? "none" : this.state.mode,
      items: isActive ? [] : this.state.items,
      byView,
    };

    this.refreshDiagnostics();
  }

  switchActiveView(viewId: string | undefined): void {
    if (!viewId) {
      this.state = {
        ...this.state,
        activeViewId: undefined,
        mode: "none",
        items: [],
      };
      this.refreshDiagnostics();
      return;
    }

    const items = this.state.byView[viewId] ?? [];

    this.state = {
      activeViewId: viewId,
      mode: inferSelectionMode(items),
      items,
      byView: this.state.byView,
    };

    this.refreshDiagnostics();
  }

  applySelection(selection: SelectionState | undefined, focusedViewId?: string): void {
    if (!selection) {
      this.state = createEmptySelectionState();
      this.refreshDiagnostics();
      return;
    }

    const sanitized = sanitizeSelectionForRestore({
      selection,
      focusedViewId: focusedViewId ?? selection.activeViewId,
      permissionAdapter: this.permissionAdapter,
    });

    this.state = sanitized.selection;
    this.diagnostics = {
      ...this.diagnostics,
      activeViewId: sanitized.selection.activeViewId,
      mode: sanitized.selection.mode,
      itemCount: sanitized.selection.items.length,
      viewCount: Object.keys(sanitized.selection.byView).length,
      droppedInvalidCount:
        this.diagnostics.droppedInvalidCount + sanitized.droppedInvalidCount,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  private refreshDiagnostics(): void {
    this.diagnostics = {
      activeViewId: this.state.activeViewId,
      mode: this.state.mode,
      itemCount: this.state.items.length,
      viewCount: Object.keys(this.state.byView).length,
      droppedInvalidCount: this.diagnostics.droppedInvalidCount,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export function createSelectionEngine(
  options: SelectionEngineOptions,
): SelectionEngine {
  return new SelectionEngine(options);
}

function emptyDiagnostics(): SelectionDiagnostics {
  return {
    mode: "none",
    itemCount: 0,
    viewCount: 0,
    droppedInvalidCount: 0,
  };
}
