import type {
  TrustTransferOperation,
  TrustTransferRunRecord,
  TrustTransferStageRecord,
} from "./trust-transfer-types";

/** Session-scoped trust transfer diagnostics (LAW-015-07). */
export class TrustTransferDiagnostics {
  private readonly runs: TrustTransferRunRecord[] = [];

  record(run: TrustTransferRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustTransferRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly operationsExecuted: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly transfersCreated: number;
    readonly transfersPosted: number;
    readonly transfersReversed: number;
    readonly validationFailures: number;
  } {
    const successful = this.runs.filter((run) => run.ok);

    return {
      operationsExecuted: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      transfersCreated: successful.filter((run) => run.operation === "createDraft")
        .length,
      transfersPosted: successful.filter((run) => run.operation === "post").length,
      transfersReversed: successful.filter((run) => run.operation === "reverse").length,
      validationFailures: this.runs.filter(
        (run) => !run.ok && run.operation === "validate",
      ).length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustTransferDiagnostics | undefined;

export function getTrustTransferDiagnostics(): TrustTransferDiagnostics {
  sharedDiagnostics ??= new TrustTransferDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustTransferDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function buildTrustTransferDiagnosticsSnapshot(options: {
  readonly transferCount: number;
  readonly domainEventCount: number;
}): {
  readonly transferCount: number;
  readonly domainEventCount: number;
  readonly runs: ReturnType<TrustTransferDiagnostics["getSummary"]>;
} {
  return {
    transferCount: options.transferCount,
    domainEventCount: options.domainEventCount,
    runs: getTrustTransferDiagnostics().getSummary(),
  };
}

export function recordTransferStage(
  stages: TrustTransferStageRecord[],
  operation: TrustTransferOperation,
  stage: TrustTransferStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

export function finalizeTransferRun(
  operation: TrustTransferOperation,
  startedAt: number,
  stages: TrustTransferStageRecord[],
  ok: boolean,
  extras: Partial<TrustTransferRunRecord> = {},
): TrustTransferRunRecord {
  const run: TrustTransferRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustTransferDiagnostics().record(run);
  return run;
}
