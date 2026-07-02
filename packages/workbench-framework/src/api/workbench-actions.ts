import type { WorkbenchCommandEvolutionMetadata } from "../interfaces/command-evolution";
import { REQUEST_COMMAND_MAP } from "../interfaces/command-evolution";
import type { WorkbenchRequest } from "../interfaces/requests";
import type { WorkbenchSelectionItem } from "../interfaces/types";

/** Sprint 004 command ids mapped from Workbench Request types. */
export type WorkbenchActionId = (typeof REQUEST_COMMAND_MAP)[WorkbenchRequest["type"]];

export interface WorkbenchActionBase {
  readonly permission?: string;
  readonly metadata?: WorkbenchCommandEvolutionMetadata;
}

export type WorkbenchAction =
  | (WorkbenchActionBase & {
      readonly id: "workbench.view.open";
      readonly viewId: string;
      readonly workspace?: string;
      readonly params?: Record<string, unknown>;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.view.close";
      readonly viewId: string;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.view.focus";
      readonly viewId: string;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.panel.open";
      readonly panelId: "sidebar" | "context";
      readonly tabKey?: string;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.panel.close";
      readonly panelId: "sidebar" | "context";
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.navigation.reveal";
      readonly navId: string;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.context.set";
      readonly contextKey: string;
      readonly payload?: Record<string, unknown>;
    })
  | (WorkbenchActionBase & {
      readonly id: "workbench.selection.set";
      readonly items: readonly WorkbenchSelectionItem[];
      readonly mode?: "clear" | "single" | "multi";
      readonly viewId?: string;
    });

/** Converts a Workbench Action into the underlying Workbench Request. */
export function actionToRequest(action: WorkbenchAction): WorkbenchRequest {
  switch (action.id) {
    case "workbench.view.open":
      return {
        type: "openView",
        viewId: action.viewId,
        workspace: action.workspace,
        params: action.params,
      };
    case "workbench.view.close":
      return { type: "closeView", viewId: action.viewId };
    case "workbench.view.focus":
      return { type: "focusView", viewId: action.viewId };
    case "workbench.panel.open":
      return { type: "openPanel", panelId: action.panelId, tabKey: action.tabKey };
    case "workbench.panel.close":
      return { type: "closePanel", panelId: action.panelId };
    case "workbench.navigation.reveal":
      return { type: "revealNavigationItem", navId: action.navId };
    case "workbench.context.set":
      return {
        type: "setContext",
        contextKey: action.contextKey,
        payload: action.payload,
      };
    case "workbench.selection.set":
      return {
        type: "setSelection",
        selection: {
          items: [...action.items],
          mode: action.mode,
          viewId: action.viewId,
        },
      };
    default: {
      const exhaustive: never = action;
      throw new Error(
        `Unsupported workbench action "${(exhaustive as WorkbenchAction).id}"`,
      );
    }
  }
}

/** Maps a Workbench Request to its Sprint 004 command id when supported. */
export function requestToActionId(
  type: WorkbenchRequest["type"],
): WorkbenchActionId | undefined {
  return REQUEST_COMMAND_MAP[type];
}

/** Best-effort reverse mapping for diagnostics and future command bridge. */
export function requestToAction(request: WorkbenchRequest): WorkbenchAction | null {
  switch (request.type) {
    case "openView":
      return {
        id: "workbench.view.open",
        viewId: request.viewId,
        workspace: request.workspace,
        params: request.params,
      };
    case "closeView":
      return { id: "workbench.view.close", viewId: request.viewId };
    case "focusView":
      return { id: "workbench.view.focus", viewId: request.viewId };
    case "openPanel":
      return {
        id: "workbench.panel.open",
        panelId: request.panelId,
        tabKey: request.tabKey,
      };
    case "closePanel":
      return { id: "workbench.panel.close", panelId: request.panelId };
    case "revealNavigationItem":
      return { id: "workbench.navigation.reveal", navId: request.navId };
    case "setContext":
      return {
        id: "workbench.context.set",
        contextKey: request.contextKey,
        payload: request.payload,
      };
    case "setSelection":
      return {
        id: "workbench.selection.set",
        items: request.selection.items,
        mode: request.selection.mode,
        viewId: request.selection.viewId,
      };
    default:
      return null;
  }
}
