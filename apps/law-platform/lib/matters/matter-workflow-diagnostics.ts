export type MatterWorkflowOperation =
  | "create"
  | "update"
  | "open"
  | "openWorkspace"
  | "refreshWorkspace"
  | "search"
  | "archive"
  | "command";

export type MatterWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface MatterWorkflowStageRecord {
  readonly operation: MatterWorkflowOperation;
  readonly stage: MatterWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface MatterWorkflowRunRecord {
  readonly operation: MatterWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly MatterWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-003-01 end-to-end validation. */
export class MatterWorkflowDiagnostics {
  private readonly runs: MatterWorkflowRunRecord[] = [];

  record(run: MatterWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly MatterWorkflowRunRecord[] {
    return [...this.runs];
  }

  clear(): void {
    this.runs.length = 0;
  }

  getSummary() {
    const successful = this.runs.filter((run) => run.ok);
    const failed = this.runs.filter((run) => !run.ok);

    return {
      totalRuns: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: failed.length,
      commandsExecuted: this.runs.filter((run) => run.commandId).length,
      eventsRaised: this.runs.filter((run) => run.eventId).length,
      repositoryMutations: this.runs.filter((run) =>
        ["create", "update", "archive"].includes(run.operation),
      ).length,
      validationFailures: failed.filter((run) => run.validationErrors).length,
      averageDurationMs:
        this.runs.length === 0
          ? 0
          : this.runs.reduce((total, run) => total + run.durationMs, 0) /
            this.runs.length,
      runs: this.listRuns(),
    };
  }
}

let sharedDiagnostics: MatterWorkflowDiagnostics | undefined;

export function getMatterWorkflowDiagnostics(): MatterWorkflowDiagnostics {
  sharedDiagnostics ??= new MatterWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetMatterWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
