export type TimeEntryWorkflowOperation =
  "create" | "update" | "open" | "search" | "delete" | "command";

export type TimeEntryWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface TimeEntryWorkflowStageRecord {
  readonly operation: TimeEntryWorkflowOperation;
  readonly stage: TimeEntryWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TimeEntryWorkflowRunRecord {
  readonly operation: TimeEntryWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly timeEntryId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly TimeEntryWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-006-01 end-to-end validation. */
export class TimeEntryWorkflowDiagnostics {
  private readonly runs: TimeEntryWorkflowRunRecord[] = [];

  record(run: TimeEntryWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TimeEntryWorkflowRunRecord[] {
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
        ["create", "update", "delete"].includes(run.operation),
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

let sharedDiagnostics: TimeEntryWorkflowDiagnostics | undefined;

export function getTimeEntryWorkflowDiagnostics(): TimeEntryWorkflowDiagnostics {
  sharedDiagnostics ??= new TimeEntryWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetTimeEntryWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
