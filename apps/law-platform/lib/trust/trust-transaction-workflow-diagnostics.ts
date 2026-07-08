export type TrustTransactionWorkflowOperation =
  | "createDraft"
  | "updateDraft"
  | "validateDraft"
  | "postDraft"
  | "cancelDraft"
  | "requestReversal"
  | "postReversal"
  | "auditLookup";

export type TrustTransactionWorkflowStage =
  "validation" | "draft" | "ledger" | "audit" | "event" | "idempotency";

export interface TrustTransactionWorkflowStageRecord {
  readonly operation: TrustTransactionWorkflowOperation;
  readonly stage: TrustTransactionWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustTransactionWorkflowRunRecord {
  readonly operation: TrustTransactionWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly tenantId?: string;
  readonly trustAccountId?: string;
  readonly draftId?: string;
  readonly errorCode?: string;
  readonly idempotentReplay?: boolean;
  readonly stages: readonly TrustTransactionWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics (LAW-015-03). */
export class TrustTransactionWorkflowDiagnostics {
  private readonly runs: TrustTransactionWorkflowRunRecord[] = [];

  record(run: TrustTransactionWorkflowRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustTransactionWorkflowRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly operationsExecuted: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly draftsCreated: number;
    readonly draftsPosted: number;
    readonly reversalsPosted: number;
    readonly idempotentReplays: number;
  } {
    const successful = this.runs.filter((run) => run.ok);

    return {
      operationsExecuted: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      draftsCreated: successful.filter((run) => run.operation === "createDraft").length,
      draftsPosted: successful.filter((run) => run.operation === "postDraft").length,
      reversalsPosted: successful.filter((run) => run.operation === "postReversal")
        .length,
      idempotentReplays: this.runs.filter((run) => run.idempotentReplay).length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustTransactionWorkflowDiagnostics | undefined;

export function getTrustTransactionWorkflowDiagnostics(): TrustTransactionWorkflowDiagnostics {
  sharedDiagnostics ??= new TrustTransactionWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustTransactionWorkflowDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}
