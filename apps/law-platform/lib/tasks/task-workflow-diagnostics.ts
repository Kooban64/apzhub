export type TaskWorkflowOperation =
  "create" | "update" | "open" | "search" | "complete" | "archive" | "command";

export type TaskWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface TaskWorkflowStageRecord {
  readonly operation: TaskWorkflowOperation;
  readonly stage: TaskWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TaskWorkflowRunRecord {
  readonly operation: TaskWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly taskId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly TaskWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-005-01 end-to-end validation. */
export class TaskWorkflowDiagnostics {
  private readonly runs: TaskWorkflowRunRecord[] = [];

  record(run: TaskWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TaskWorkflowRunRecord[] {
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
        ["create", "update", "complete", "archive"].includes(run.operation),
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

let sharedDiagnostics: TaskWorkflowDiagnostics | undefined;

export function getTaskWorkflowDiagnostics(): TaskWorkflowDiagnostics {
  sharedDiagnostics ??= new TaskWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetTaskWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
