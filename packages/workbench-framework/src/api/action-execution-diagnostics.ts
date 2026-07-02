/** Workbench API action execution diagnostics (AF-008). */
export interface ActionExecutionDiagnostics {
  readonly executorConfigured: boolean;
  readonly executorPathCount: number;
  readonly legacyPathCount: number;
  readonly executorSuccessCount: number;
  readonly executorFailureCount: number;
  readonly lastExecutionAt?: string;
}

export function createInitialActionExecutionDiagnostics(
  executorConfigured: boolean,
): ActionExecutionDiagnostics {
  return {
    executorConfigured,
    executorPathCount: 0,
    legacyPathCount: 0,
    executorSuccessCount: 0,
    executorFailureCount: 0,
  };
}

export class ActionExecutionDiagnosticsTracker {
  private executorPathCount = 0;
  private legacyPathCount = 0;
  private executorSuccessCount = 0;
  private executorFailureCount = 0;
  private lastExecutionAt: string | undefined;

  constructor(private readonly executorConfigured: boolean) {}

  recordLegacyPath(): void {
    this.legacyPathCount += 1;
    this.lastExecutionAt = new Date().toISOString();
  }

  recordExecutorPath(ok: boolean): void {
    this.executorPathCount += 1;
    if (ok) {
      this.executorSuccessCount += 1;
    } else {
      this.executorFailureCount += 1;
    }
    this.lastExecutionAt = new Date().toISOString();
  }

  snapshot(): ActionExecutionDiagnostics {
    return {
      executorConfigured: this.executorConfigured,
      executorPathCount: this.executorPathCount,
      legacyPathCount: this.legacyPathCount,
      executorSuccessCount: this.executorSuccessCount,
      executorFailureCount: this.executorFailureCount,
      lastExecutionAt: this.lastExecutionAt,
    };
  }
}
