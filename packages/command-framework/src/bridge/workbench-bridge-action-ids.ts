import { REQUEST_COMMAND_MAP } from "@apzhub/workbench-framework";

/** Built-in workbench bridge action ids — mirrors REQUEST_COMMAND_MAP values. */
export type WorkbenchBridgeActionId =
  | "workbench.view.open"
  | "workbench.view.close"
  | "workbench.view.focus"
  | "workbench.panel.open"
  | "workbench.panel.close"
  | "workbench.navigation.reveal"
  | "workbench.context.set"
  | "workbench.selection.set";

const WORKBENCH_BRIDGE_ACTION_ID_SET = new Set<WorkbenchBridgeActionId>([
  "workbench.view.open",
  "workbench.view.close",
  "workbench.view.focus",
  "workbench.panel.open",
  "workbench.panel.close",
  "workbench.navigation.reveal",
  "workbench.context.set",
  "workbench.selection.set",
]);

/** Canonical workbench action ids supported by the default bridge. */
export const WORKBENCH_BRIDGE_ACTION_IDS = Object.freeze(
  Object.values(REQUEST_COMMAND_MAP).filter(
    (id): id is WorkbenchBridgeActionId =>
      typeof id === "string" &&
      WORKBENCH_BRIDGE_ACTION_ID_SET.has(id as WorkbenchBridgeActionId),
  ),
);

export function isWorkbenchBridgeActionId(
  actionId: string,
): actionId is WorkbenchBridgeActionId {
  return WORKBENCH_BRIDGE_ACTION_ID_SET.has(actionId as WorkbenchBridgeActionId);
}
