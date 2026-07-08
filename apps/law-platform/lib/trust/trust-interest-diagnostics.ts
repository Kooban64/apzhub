import type {
  TrustInterestOperation,
  TrustInterestRunRecord,
  TrustInterestStageRecord,
} from "./trust-interest-types";

/** Session-scoped trust interest diagnostics (LAW-015-06). */
export class TrustInterestDiagnostics {
  private readonly runs: TrustInterestRunRecord[] = [];

  record(run: TrustInterestRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustInterestRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly operationsExecuted: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly accrualsRun: number;
    readonly postingsApproved: number;
    readonly postingsPosted: number;
  } {
    const successful = this.runs.filter((run) => run.ok);

    return {
      operationsExecuted: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      accrualsRun: successful.filter((run) => run.operation === "runAccrual").length,
      postingsApproved: successful.filter((run) => run.operation === "approvePosting")
        .length,
      postingsPosted: successful.filter((run) => run.operation === "postInterest")
        .length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustInterestDiagnostics | undefined;

export function getTrustInterestDiagnostics(): TrustInterestDiagnostics {
  sharedDiagnostics ??= new TrustInterestDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustInterestDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function buildTrustInterestDiagnosticsSnapshot(options: {
  readonly ruleCount: number;
  readonly postingCount: number;
  readonly domainEventCount: number;
}): {
  readonly ruleCount: number;
  readonly postingCount: number;
  readonly domainEventCount: number;
  readonly runs: ReturnType<TrustInterestDiagnostics["getSummary"]>;
} {
  return {
    ruleCount: options.ruleCount,
    postingCount: options.postingCount,
    domainEventCount: options.domainEventCount,
    runs: getTrustInterestDiagnostics().getSummary(),
  };
}

export function recordInterestStage(
  stages: TrustInterestStageRecord[],
  operation: TrustInterestOperation,
  stage: TrustInterestStageRecord["stage"],
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

export function finalizeInterestRun(
  operation: TrustInterestOperation,
  startedAt: number,
  stages: TrustInterestStageRecord[],
  ok: boolean,
  extras: Partial<TrustInterestRunRecord> = {},
): TrustInterestRunRecord {
  const run: TrustInterestRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustInterestDiagnostics().record(run);
  return run;
}
