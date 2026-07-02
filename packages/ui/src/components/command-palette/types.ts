/** Minimal command row for presentational palette rendering. */
export interface CommandPaletteItem {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly description?: string;
  /** Display-only shortcut label — palette does not handle shortcut input. */
  readonly shortcut?: string;
  /** Presentation-only disabled state — palette does not evaluate permissions. */
  readonly disabled?: boolean;
  readonly pinned?: boolean;
}

/** Configurable empty-state copy for the palette list. */
export interface CommandPaletteEmptyState {
  readonly title: string;
  readonly description?: string;
}

/** Configurable loading-state copy for the palette list. */
export interface CommandPaletteLoadingState {
  readonly message: string;
  readonly description?: string;
}

/** Execution feedback displayed by the palette surface (presentation only). */
export interface CommandPaletteExecutionFeedback {
  readonly ok: boolean;
  readonly code: string;
  readonly actionId: string;
}

/** Palette-level diagnostics for shell reporting. */
export interface CommandPaletteDiagnostics {
  readonly open: boolean;
  readonly visibleCommandCount: number;
  readonly selectedIndex: number;
  readonly query: string;
  readonly registryReady: boolean;
  readonly registryActionCount: number;
  readonly executionCount: number;
  readonly lastExecutionAt?: string;
  readonly lastExecutionOk?: boolean;
  readonly lastSelectedId?: string;
}
