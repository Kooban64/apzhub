export type DocumentWorkflowOperation =
  "create" | "update" | "open" | "search" | "archive" | "command";

export type DocumentWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface DocumentWorkflowStageRecord {
  readonly operation: DocumentWorkflowOperation;
  readonly stage: DocumentWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface DocumentWorkflowRunRecord {
  readonly operation: DocumentWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly documentId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly DocumentWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-004-01 end-to-end validation. */
export class DocumentWorkflowDiagnostics {
  private readonly runs: DocumentWorkflowRunRecord[] = [];

  record(run: DocumentWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly DocumentWorkflowRunRecord[] {
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

let sharedDiagnostics: DocumentWorkflowDiagnostics | undefined;

export function getDocumentWorkflowDiagnostics(): DocumentWorkflowDiagnostics {
  sharedDiagnostics ??= new DocumentWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetDocumentWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
