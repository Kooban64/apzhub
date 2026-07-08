import type {
  TrustAllocationOperation,
  TrustAllocationRunRecord,
  TrustAllocationStageRecord,
} from "./trust-allocation-types";

/** Session-scoped trust allocation diagnostics (LAW-015-04). */
export class TrustAllocationDiagnostics {
  private readonly runs: TrustAllocationRunRecord[] = [];

  record(run: TrustAllocationRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustAllocationRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly operationsExecuted: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly allocationsCreated: number;
    readonly allocationsAdjusted: number;
    readonly allocationsReversed: number;
  } {
    const successful = this.runs.filter((run) => run.ok);

    return {
      operationsExecuted: this.runs.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      allocationsCreated: successful.filter((run) => run.operation === "allocate")
        .length,
      allocationsAdjusted: successful.filter((run) => run.operation === "adjust")
        .length,
      allocationsReversed: successful.filter((run) => run.operation === "reverse")
        .length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustAllocationDiagnostics | undefined;

export function getTrustAllocationDiagnostics(): TrustAllocationDiagnostics {
  sharedDiagnostics ??= new TrustAllocationDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustAllocationDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function buildTrustAllocationDiagnosticsSnapshot(options: {
  readonly repositoryAllocationCount: number;
  readonly domainEventCount: number;
}): {
  readonly allocationCount: number;
  readonly domainEventCount: number;
  readonly runs: ReturnType<TrustAllocationDiagnostics["getSummary"]>;
} {
  const diagnostics = getTrustAllocationDiagnostics();

  return {
    allocationCount: options.repositoryAllocationCount,
    domainEventCount: options.domainEventCount,
    runs: diagnostics.getSummary(),
  };
}

export function recordAllocationStage(
  stages: TrustAllocationStageRecord[],
  operation: TrustAllocationOperation,
  stage: TrustAllocationStageRecord["stage"],
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

export function finalizeAllocationRun(
  operation: TrustAllocationOperation,
  startedAt: number,
  stages: TrustAllocationStageRecord[],
  ok: boolean,
  extras: Partial<TrustAllocationRunRecord> = {},
): TrustAllocationRunRecord {
  const run: TrustAllocationRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustAllocationDiagnostics().record(run);
  return run;
}
