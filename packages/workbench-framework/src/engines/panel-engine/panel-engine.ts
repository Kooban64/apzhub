import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";
import type { PanelState } from "../../interfaces/types";

export const DEFAULT_PANEL_STATE: PanelState = {
  sidebar: { collapsed: false, width: 280 },
  context: { collapsed: true, width: 320 },
};

export interface PanelEngineOptions {
  initialState?: PanelState;
}

/** Panel Engine — panel visibility and geometry scaffold (Phase 1). */
export class PanelEngine implements WorkbenchEngine {
  readonly id = "panel" as const;

  private state: PanelState;

  constructor(options: PanelEngineOptions = {}) {
    this.state = options.initialState ?? structuredClone(DEFAULT_PANEL_STATE);
  }

  getState(): PanelState {
    return this.state;
  }

  getStateSlice(): PanelState {
    return this.getState();
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    switch (request.type) {
      case "openPanel":
        return this.openPanel(request.panelId, request.tabKey);
      case "closePanel":
        return this.closePanel(request.panelId);
      default:
        return workbenchRequestFail(
          workbenchRequestError(
            "INVALID_REQUEST",
            `Panel Engine cannot handle request type "${(request as WorkbenchRequest).type}"`,
            this.id,
          ),
        );
    }
  }

  private openPanel(
    panelId: "sidebar" | "context",
    tabKey?: string,
  ): WorkbenchRequestResult {
    if (panelId === "sidebar") {
      this.state = {
        ...this.state,
        sidebar: { ...this.state.sidebar, collapsed: false },
      };
      return workbenchRequestOk();
    }

    this.state = {
      ...this.state,
      context: {
        ...this.state.context,
        collapsed: false,
        ...(tabKey !== undefined ? { activeTabKey: tabKey } : {}),
      },
    };
    return workbenchRequestOk();
  }

  private closePanel(panelId: "sidebar" | "context"): WorkbenchRequestResult {
    if (panelId === "sidebar") {
      this.state = {
        ...this.state,
        sidebar: { ...this.state.sidebar, collapsed: true },
      };
      return workbenchRequestOk();
    }

    this.state = {
      ...this.state,
      context: { ...this.state.context, collapsed: true },
    };
    return workbenchRequestOk();
  }

  applyPanelPreferences(panels: {
    sidebar?: { collapsed: boolean; width: number };
    context?: { collapsed: boolean; width: number; activeTab?: string };
  }): void {
    this.state = {
      sidebar: panels.sidebar
        ? { ...this.state.sidebar, ...panels.sidebar }
        : this.state.sidebar,
      context: panels.context
        ? {
            ...this.state.context,
            collapsed: panels.context.collapsed,
            width: panels.context.width,
            activeTabKey: panels.context.activeTab,
          }
        : this.state.context,
    };
  }
}

export function createPanelEngine(options?: PanelEngineOptions): PanelEngine {
  return new PanelEngine(options);
}
