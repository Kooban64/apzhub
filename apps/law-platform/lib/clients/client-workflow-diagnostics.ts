export type ClientWorkflowOperation =
  "create" | "update" | "open" | "search" | "delete" | "command";

export type ClientWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface ClientWorkflowStageRecord {
  readonly operation: ClientWorkflowOperation;
  readonly stage: ClientWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface ClientWorkflowRunRecord {
  readonly operation: ClientWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly clientId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly ClientWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-002-03 end-to-end validation. */
export class ClientWorkflowDiagnostics {
  private readonly runs: ClientWorkflowRunRecord[] = [];

  record(run: ClientWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly ClientWorkflowRunRecord[] {
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

let sharedDiagnostics: ClientWorkflowDiagnostics | undefined;

export function getClientWorkflowDiagnostics(): ClientWorkflowDiagnostics {
  sharedDiagnostics ??= new ClientWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetClientWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
