export type InvoiceWorkflowOperation =
  | "create"
  | "update"
  | "open"
  | "preview"
  | "cancel"
  | "markPaid"
  | "search"
  | "command";

export type InvoiceWorkflowStage =
  | "validation"
  | "factory"
  | "repository"
  | "command"
  | "event"
  | "notification"
  | "activity";

export interface InvoiceWorkflowStageRecord {
  readonly operation: InvoiceWorkflowOperation;
  readonly stage: InvoiceWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface InvoiceWorkflowRunRecord {
  readonly operation: InvoiceWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly invoiceId?: string;
  readonly matterId?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly stages: readonly InvoiceWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-010-01 end-to-end validation. */
export class InvoiceWorkflowDiagnostics {
  private readonly runs: InvoiceWorkflowRunRecord[] = [];

  record(run: InvoiceWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly InvoiceWorkflowRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly commandsExecuted: number;
    readonly eventsRaised: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
  } {
    const eventsRaised = this.runs.filter((run) => run.eventId).length;

    return {
      commandsExecuted: this.runs.length,
      eventsRaised,
      successfulRuns: this.runs.filter((run) => run.ok).length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
    };
  }
}

let sharedDiagnostics: InvoiceWorkflowDiagnostics | undefined;

export function getInvoiceWorkflowDiagnostics(): InvoiceWorkflowDiagnostics {
  sharedDiagnostics ??= new InvoiceWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetInvoiceWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
