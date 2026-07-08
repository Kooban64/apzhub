import type {
  TrustReportType,
  TrustReportingOperation,
  TrustReportingRunRecord,
} from "./trust-reporting-types";

/** Session-scoped trust reporting diagnostics (LAW-015-08). */
export class TrustReportingDiagnostics {
  private readonly runs: TrustReportingRunRecord[] = [];

  record(run: TrustReportingRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustReportingRunRecord[] {
    return this.runs;
  }

  getSummary(): {
    readonly reportsGenerated: number;
    readonly failedGenerations: number;
    readonly averageGenerationMs: number;
    readonly reportTypeCounts: Readonly<Record<string, number>>;
    readonly warnings: number;
  } {
    const successful = this.runs.filter((run) => run.ok);
    const totalDuration = successful.reduce((sum, run) => sum + run.durationMs, 0);
    const reportTypeCounts: Record<string, number> = {};

    for (const run of successful) {
      reportTypeCounts[run.reportType] = (reportTypeCounts[run.reportType] ?? 0) + 1;
    }

    return {
      reportsGenerated: successful.length,
      failedGenerations: this.runs.filter((run) => !run.ok).length,
      averageGenerationMs:
        successful.length === 0 ? 0 : Math.round(totalDuration / successful.length),
      reportTypeCounts,
      warnings: 0,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustReportingDiagnostics | undefined;

export function getTrustReportingDiagnostics(): TrustReportingDiagnostics {
  sharedDiagnostics ??= new TrustReportingDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustReportingDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function finalizeReportingRun(
  operation: TrustReportingOperation,
  startedAt: number,
  ok: boolean,
  reportType: TrustReportType,
  extras: Partial<TrustReportingRunRecord> = {},
): TrustReportingRunRecord {
  const run: TrustReportingRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    reportType,
    ...extras,
  };
  getTrustReportingDiagnostics().record(run);
  return run;
}
