export interface ToolbarItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface ToolbarEmptyState {
  readonly title: string;
  readonly description?: string;
}

export interface ToolbarDiagnostics {
  readonly visibleActionCount: number;
  readonly region: string;
  readonly registryReady: boolean;
  readonly registryActionCount: number;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}
