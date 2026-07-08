export type CalendarEventWorkflowOperation =
  "create" | "update" | "open" | "search" | "cancel" | "command";

export type CalendarEventWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface CalendarEventWorkflowStageRecord {
  readonly operation: CalendarEventWorkflowOperation;
  readonly stage: CalendarEventWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface CalendarEventWorkflowRunRecord {
  readonly operation: CalendarEventWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly calendarEventId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly CalendarEventWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-008-01 end-to-end validation. */
export class CalendarEventWorkflowDiagnostics {
  private readonly runs: CalendarEventWorkflowRunRecord[] = [];

  record(run: CalendarEventWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly CalendarEventWorkflowRunRecord[] {
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
        ["create", "update", "cancel"].includes(run.operation),
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

let sharedDiagnostics: CalendarEventWorkflowDiagnostics | undefined;

export function getCalendarEventWorkflowDiagnostics(): CalendarEventWorkflowDiagnostics {
  sharedDiagnostics ??= new CalendarEventWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetCalendarEventWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
