export type TrustLedgerOperation =
  "openAccount" | "postTransaction" | "reverseTransaction" | "rebuildBalances";

export type TrustLedgerStage =
  "validation" | "posting" | "repository" | "balance" | "event";

export interface TrustLedgerStageRecord {
  readonly operation: TrustLedgerOperation;
  readonly stage: TrustLedgerStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustLedgerRunRecord {
  readonly operation: TrustLedgerOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly tenantId?: string;
  readonly trustAccountId?: string;
  readonly trustTransactionId?: string;
  readonly errorCode?: string;
  readonly stages: readonly TrustLedgerStageRecord[];
}

/** Session-scoped trust ledger diagnostics (LAW-015-02). */
export class TrustLedgerDiagnostics {
  private readonly runs: TrustLedgerRunRecord[] = [];

  record(run: TrustLedgerRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustLedgerRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly operationsExecuted: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly accountsOpened: number;
    readonly transactionsPosted: number;
    readonly transactionsReversed: number;
  } {
    const successful = this.runs.filter((run) => run.ok);

    return {
      operationsExecuted: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      accountsOpened: successful.filter((run) => run.operation === "openAccount")
        .length,
      transactionsPosted: successful.filter(
        (run) => run.operation === "postTransaction",
      ).length,
      transactionsReversed: successful.filter(
        (run) => run.operation === "reverseTransaction",
      ).length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustLedgerDiagnostics | undefined;

export function getTrustLedgerDiagnostics(): TrustLedgerDiagnostics {
  sharedDiagnostics ??= new TrustLedgerDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustLedgerDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function buildTrustLedgerDiagnosticsSnapshot(options: {
  readonly repositoryAccountCount: number;
  readonly repositoryJournalEntryCount: number;
  readonly repositoryTransactionCount: number;
  readonly domainEventCount: number;
}): {
  readonly accountCount: number;
  readonly journalEntryCount: number;
  readonly transactionCount: number;
  readonly domainEventCount: number;
  readonly runs: ReturnType<TrustLedgerDiagnostics["getSummary"]>;
} {
  const diagnostics = getTrustLedgerDiagnostics();

  return {
    accountCount: options.repositoryAccountCount,
    journalEntryCount: options.repositoryJournalEntryCount,
    transactionCount: options.repositoryTransactionCount,
    domainEventCount: options.domainEventCount,
    runs: diagnostics.getSummary(),
  };
}
