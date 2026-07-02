/** Minimal context menu row for presentational rendering. */
export interface ContextMenuItem {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly description?: string;
  readonly shortcut?: string;
  /** Presentation-only disabled state — menu does not evaluate permissions. */
  readonly disabled?: boolean;
}

export interface ContextMenuEmptyState {
  readonly title: string;
  readonly description?: string;
}

/** Context menu diagnostics payload for shell reporting. */
export interface ContextMenuDiagnostics {
  readonly open: boolean;
  readonly visibleActionCount: number;
  readonly menuSurface?: string;
  readonly selectionMode?: "none" | "single" | "multi";
  readonly contextTypeCount: number;
  readonly registryReady: boolean;
  readonly registryActionCount: number;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}
