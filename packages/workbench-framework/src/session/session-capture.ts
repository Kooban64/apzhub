import type {
  NavigationState,
  SelectionState,
  WorkbenchState,
} from "../interfaces/types";
import { createEmptySelectionState } from "../engines/selection-engine/selection-state";
import {
  WORKBENCH_SESSION_SCHEMA_VERSION,
  type WorkbenchSessionPayload,
} from "./workbench-session-payload";

export function captureWorkbenchSession(
  state: WorkbenchState,
  navigation: NavigationState,
): WorkbenchSessionPayload {
  const activeWorkspace = navigation.activeWorkspaceId;
  const focusedViewId = state.views.focusedViewId;
  const focusedView = state.views.openViews.find(
    (view) => view.viewId === focusedViewId,
  );

  const activeActivityBarItemId = state.navigation.items.find(
    (item) => item.level === "activity-bar" && item.workspace === activeWorkspace,
  )?.id;

  const activeSidebarItemId = focusedView?.route
    ? state.navigation.items.find(
        (item) =>
          item.level === "sidebar" &&
          item.workspace === activeWorkspace &&
          item.route === focusedView.route,
      )?.id
    : state.navigation.items.find(
        (item) => item.level === "sidebar" && item.workspace === activeWorkspace,
      )?.id;

  const openViews =
    focusedViewId && focusedView
      ? [{ viewId: focusedView.viewId, workspace: focusedView.workspace }]
      : [];

  const layoutRegions = Object.fromEntries(
    Object.entries(state.layout.regions).map(([regionId, region]) => [
      regionId,
      { visible: region.visible },
    ]),
  ) as NonNullable<WorkbenchSessionPayload["layout"]>["regions"];

  return {
    schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
    activeWorkspace,
    focusedViewId,
    activeActivityBarItemId,
    activeSidebarItemId,
    openViews,
    panels: {
      sidebar: {
        collapsed: state.panels.sidebar.collapsed,
        width: state.panels.sidebar.width,
      },
      context: {
        collapsed: state.panels.context.collapsed,
        width: state.panels.context.width,
        activeTab: state.panels.context.activeTabKey,
      },
    },
    layout: { regions: layoutRegions },
    dock: { splitRatios: { ...state.dock.splitRatios } },
    selection: captureSelectionState(state.selection),
    capturedAt: new Date().toISOString(),
  };
}

function captureSelectionState(selection: SelectionState): SelectionState {
  if (selection.items.length === 0 && Object.keys(selection.byView).length === 0) {
    return createEmptySelectionState();
  }

  return {
    activeViewId: selection.activeViewId,
    mode: selection.mode,
    items: [...selection.items],
    byView: Object.fromEntries(
      Object.entries(selection.byView).map(([viewId, items]) => [viewId, [...items]]),
    ),
  };
}
