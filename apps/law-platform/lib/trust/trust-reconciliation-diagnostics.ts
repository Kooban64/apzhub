import type {
  TrustReconciliationAccountSummary,
  TrustReconciliationOperation,
  TrustReconciliationRun,
  TrustReconciliationRunRecord,
  TrustReconciliationStageRecord,
} from "./trust-reconciliation-types";

/** Session-scoped trust reconciliation diagnostics (LAW-015-05). */
export class TrustReconciliationDiagnostics {
  private readonly runs: TrustReconciliationRunRecord[] = [];

  record(run: TrustReconciliationRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustReconciliationRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly reconciliationCount: number;
    readonly successfulRuns: number;
    readonly failedRuns: number;
    readonly totalWarnings: number;
    readonly totalErrors: number;
    readonly lastRunAt?: string;
    readonly lastDurationMs?: number;
  } {
    const successful = this.runs.filter((run) => run.ok);
    const completedRuns = successful.filter((run) => run.reconciliationId);
    const last = completedRuns.at(-1);

    return {
      reconciliationCount: completedRuns.length,
      successfulRuns: successful.length,
      failedRuns: this.runs.filter((run) => !run.ok).length,
      totalWarnings: 0,
      totalErrors: 0,
      lastRunAt: last?.startedAt,
      lastDurationMs: last?.durationMs,
    };
  }

  buildAccountSummaries(
    reconciliationRuns: readonly TrustReconciliationRun[],
  ): readonly TrustReconciliationAccountSummary[] {
    const grouped = new Map<string, TrustReconciliationRun[]>();

    for (const run of reconciliationRuns) {
      const key = `${run.tenantId}::${run.trustAccountId}`;
      const list = grouped.get(key) ?? [];
      list.push(run);
      grouped.set(key, list);
    }

    return [...grouped.entries()].map(([key, runs]) => {
      const [tenantId, trustAccountId] = key.split("::");
      const sorted = [...runs].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
      const last = sorted.at(-1);

      return {
        tenantId: tenantId!,
        trustAccountId: trustAccountId!,
        lastRunAt: last?.completedAt,
        lastRunStatus: last?.status,
        warningCount: sorted.reduce((sum, run) => sum + run.warningCount, 0),
        errorCount: sorted.reduce((sum, run) => sum + run.errorCount, 0),
        runCount: sorted.length,
      };
    });
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustReconciliationDiagnostics | undefined;

export function getTrustReconciliationDiagnostics(): TrustReconciliationDiagnostics {
  sharedDiagnostics ??= new TrustReconciliationDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustReconciliationDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function recordReconciliationStage(
  stages: TrustReconciliationStageRecord[],
  operation: TrustReconciliationOperation,
  stage: TrustReconciliationStageRecord["stage"],
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

export function finalizeReconciliationRun(
  operation: TrustReconciliationOperation,
  startedAt: number,
  stages: TrustReconciliationStageRecord[],
  ok: boolean,
  extras: Partial<TrustReconciliationRunRecord> = {},
): TrustReconciliationRunRecord {
  const run: TrustReconciliationRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustReconciliationDiagnostics().record(run);
  return run;
}

export function buildReconciliationDiagnosticsSnapshot(options: {
  readonly repositoryRunCount: number;
  readonly domainEventCount: number;
  readonly lastRun?: TrustReconciliationRun;
}): Readonly<Record<string, unknown>> {
  const diagnostics = getTrustReconciliationDiagnostics();

  return {
    repositoryRunCount: options.repositoryRunCount,
    domainEventCount: options.domainEventCount,
    reconciliationCount: diagnostics.getSummary().reconciliationCount,
    lastRunStatus: options.lastRun?.status,
    lastWarningCount: options.lastRun?.warningCount ?? 0,
    lastErrorCount: options.lastRun?.errorCount ?? 0,
    lastDurationMs: options.lastRun?.durationMs,
  };
}
