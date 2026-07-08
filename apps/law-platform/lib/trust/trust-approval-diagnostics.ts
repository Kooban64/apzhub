import type {
  TrustApprovalDiagnosticsSnapshot,
  TrustApprovalOperation,
  TrustApprovalRunRecord,
  TrustApprovalStageRecord,
} from "./trust-approval-types";

/** Session-scoped trust approval diagnostics (LAW-015-10). */
export class TrustApprovalDiagnostics {
  private readonly runs: TrustApprovalRunRecord[] = [];

  record(run: TrustApprovalRunRecord): void {
    this.runs.push(run);
  }

  listRuns(): readonly TrustApprovalRunRecord[] {
    return this.runs;
  }

  buildSnapshot(options: {
    readonly pendingApprovals: number;
    readonly approvedCount: number;
    readonly rejectedCount: number;
    readonly cancelledCount: number;
    readonly ruleUsage: Readonly<Record<string, number>>;
  }): TrustApprovalDiagnosticsSnapshot {
    const approvalRuns = this.runs.filter(
      (run) => run.operation === "approve" && run.ok,
    );
    const approvalDurations = approvalRuns.map((run) => run.durationMs);
    const averageApprovalTimeMs =
      approvalDurations.length === 0
        ? 0
        : approvalDurations.reduce((sum, value) => sum + value, 0) /
          approvalDurations.length;

    return {
      pendingApprovals: options.pendingApprovals,
      approvedCount: options.approvedCount,
      rejectedCount: options.rejectedCount,
      cancelledCount: options.cancelledCount,
      averageApprovalTimeMs,
      ruleUsage: options.ruleUsage,
      failures: this.runs.filter((run) => !run.ok).length,
      operationsExecuted: this.runs.length,
    };
  }

  reset(): void {
    this.runs.length = 0;
  }
}

let sharedDiagnostics: TrustApprovalDiagnostics | undefined;

export function getTrustApprovalDiagnostics(): TrustApprovalDiagnostics {
  sharedDiagnostics ??= new TrustApprovalDiagnostics();
  return sharedDiagnostics;
}

export function resetTrustApprovalDiagnostics(): void {
  sharedDiagnostics?.reset();
  sharedDiagnostics = undefined;
}

export function recordApprovalStage(
  stages: TrustApprovalStageRecord[],
  operation: TrustApprovalOperation,
  stage: TrustApprovalStageRecord["stage"],
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

export function finalizeApprovalRun(
  operation: TrustApprovalOperation,
  startedAt: number,
  stages: TrustApprovalStageRecord[],
  ok: boolean,
  extras: Partial<TrustApprovalRunRecord> = {},
): TrustApprovalRunRecord {
  const run: TrustApprovalRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustApprovalDiagnostics().record(run);
  return run;
}
