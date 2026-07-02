import type { WorkbenchAction } from "../api/workbench-actions";
import type { WorkbenchRequest } from "./requests";

/**
 * Maps Workbench Request types to future Command Framework command ids (Sprint 004).
 * Workbench Requests are the precursor unified command model.
 *
 * Extension path:
 *   WorkbenchRequest → WorkbenchAction (Phase 7) → Platform Command (Sprint 004)
 */
export const REQUEST_COMMAND_MAP: Partial<Record<WorkbenchRequest["type"], string>> = {
  openView: "workbench.view.open",
  closeView: "workbench.view.close",
  focusView: "workbench.view.focus",
  openPanel: "workbench.panel.open",
  closePanel: "workbench.panel.close",
  revealNavigationItem: "workbench.navigation.reveal",
  setContext: "workbench.context.set",
  setSelection: "workbench.selection.set",
};

/** Extension point: future commands may carry palette metadata alongside requests. */
export interface WorkbenchCommandEvolutionMetadata {
  readonly commandId?: string;
  readonly category?: string;
  readonly shortcut?: string;
}

/** Future Command Framework bridge — extension point for Sprint 004. */
export interface WorkbenchCommandBridge {
  /** Resolve a command id to a Workbench Action for execution via WorkbenchAPI.executeAction(). */
  toAction(
    commandId: string,
    payload?: Record<string, unknown>,
  ): WorkbenchAction | null;
}

export type {
  WorkbenchActionExecutionInput,
  WorkbenchActionExecutionResult,
  WorkbenchActionExecutor,
} from "../api/workbench-action-executor";
