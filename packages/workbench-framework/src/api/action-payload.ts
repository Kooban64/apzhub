import type { WorkbenchAction } from "./workbench-actions";

/** Serialise a Workbench Action into executor args (AF-008). */
export function actionPayload(action: WorkbenchAction): Record<string, unknown> {
  switch (action.id) {
    case "workbench.view.open":
      return {
        viewId: action.viewId,
        ...(action.workspace ? { workspace: action.workspace } : {}),
        ...(action.params ? { params: action.params } : {}),
      };
    case "workbench.view.close":
    case "workbench.view.focus":
      return { viewId: action.viewId };
    case "workbench.panel.open":
      return {
        panelId: action.panelId,
        ...(action.tabKey ? { tabKey: action.tabKey } : {}),
      };
    case "workbench.panel.close":
      return { panelId: action.panelId };
    case "workbench.navigation.reveal":
      return { navId: action.navId };
    case "workbench.context.set":
      return {
        contextKey: action.contextKey,
        ...(action.payload ? { payload: action.payload } : {}),
      };
    case "workbench.selection.set":
      return {
        selection: {
          items: [...action.items],
          ...(action.mode ? { mode: action.mode } : {}),
          ...(action.viewId ? { viewId: action.viewId } : {}),
        },
      };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
