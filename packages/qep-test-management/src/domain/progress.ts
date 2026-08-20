import type {
  PlanProgress,
  PresentedExecution,
  ProductExecutionStatus,
  ProductExecutionType,
  ProductResultState,
} from "./types";

const PASS_RESULTS = new Set(["pass", "passed"]);
const FAIL_RESULTS = new Set(["fail", "failed"]);
const BLOCK_RESULTS = new Set(["blocked", "block"]);
const SKIP_RESULTS = new Set(["skipped", "skip"]);

const COMPLETED_STATUSES = new Set([
  "completed",
  "submitted_for_review",
  "accepted",
  "rejected",
  "archived",
]);

const CANCELLED_STATUSES = new Set(["cancelled", "canceled", "timed_out"]);

export function derivePlanProgress(input: {
  readonly plannedIds: readonly string[];
  readonly results: Readonly<Record<string, ProductResultState>>;
}): PlanProgress {
  const planned = [...new Set(input.plannedIds)];
  let executed = 0;
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  for (const id of planned) {
    const result = input.results[id] ?? "not_run";
    if (result === "not_run") continue;
    executed += 1;
    if (result === "pass") passed += 1;
    else if (result === "fail") failed += 1;
    else if (result === "blocked") blocked += 1;
  }
  const remaining = Math.max(0, planned.length - executed);
  const percent =
    planned.length === 0 ? undefined : Math.round((executed / planned.length) * 100);
  return {
    planned: planned.length,
    executed,
    passed,
    failed,
    blocked,
    remaining,
    percent,
  };
}

/** Quality outcome only — never map operational status here. */
export function mapOutcomeToProductResult(
  value: string | undefined,
): ProductResultState {
  if (!value) return "not_run";
  const normalized = value.trim().toLowerCase();
  if (PASS_RESULTS.has(normalized)) return "pass";
  if (FAIL_RESULTS.has(normalized)) return "fail";
  if (BLOCK_RESULTS.has(normalized)) return "blocked";
  if (SKIP_RESULTS.has(normalized)) return "skipped";
  if (
    normalized === "not_run" ||
    normalized === "not_executed" ||
    normalized === "not executed"
  ) {
    return "not_run";
  }
  return "not_run";
}

export function mapEngineStatusToProductStatus(
  value: string | undefined,
): ProductExecutionStatus {
  if (!value) return "draft";
  const normalized = value.trim().toLowerCase();
  if (normalized === "not_started") return "not_started";
  if (normalized === "draft") return "draft";
  if (normalized === "ready") return "ready";
  if (
    normalized === "assigned" ||
    normalized === "queued" ||
    normalized === "preparing"
  ) {
    return "assigned";
  }
  if (
    normalized === "in_progress" ||
    normalized === "running" ||
    normalized === "retrying"
  ) {
    return "in_progress";
  }
  if (normalized === "paused" || normalized === "interrupted") return "paused";
  if (normalized === "blocked") return "blocked";
  if (COMPLETED_STATUSES.has(normalized)) return "completed";
  if (CANCELLED_STATUSES.has(normalized)) return "cancelled";
  if (normalized === "superseded") return "superseded";
  return "draft";
}

export function deriveWorkspaceSessionResult(input: {
  readonly status: string;
  readonly passed?: number;
  readonly failed?: number;
  readonly blocked?: number;
  readonly executedSteps?: number;
}): ProductResultState {
  const status = mapEngineStatusToProductStatus(input.status);
  if (status !== "completed") return "not_run";
  if ((input.failed ?? 0) > 0) return "fail";
  if ((input.blocked ?? 0) > 0) return "blocked";
  if ((input.passed ?? 0) > 0) return "pass";
  if ((input.executedSteps ?? 0) > 0) return "pass";
  return "not_run";
}

export function deriveExecutionType(input: {
  readonly mode?: string;
  readonly verificationCapability?: string;
}): ProductExecutionType {
  const mode = (input.mode ?? "").toLowerCase();
  const capability = (input.verificationCapability ?? "").toLowerCase();
  if (mode === "automated" || mode === "imported") return "automated";
  if (
    capability === "manual_verification" ||
    mode === "manual" ||
    mode === "assisted_manual"
  ) {
    return "manual";
  }
  if (mode === "suite_session") return "manual";
  if (capability && capability !== "manual_verification") return "automated";
  return "manual";
}

export function deriveMixedType(
  types: readonly ProductExecutionType[],
): ProductExecutionType {
  const unique = new Set(types);
  if (unique.has("manual") && unique.has("automated")) return "mixed";
  if (unique.has("automated")) return "automated";
  return "manual";
}

export type PresentedExecutionSeed = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly specificationId?: string;
  readonly name?: string;
  readonly mode: PresentedExecution["mode"];
  readonly type?: ProductExecutionType;
  readonly engine: PresentedExecution["engine"];
  readonly status?: ProductExecutionStatus;
  readonly result: ProductResultState;
  readonly progressPercent?: number;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly method?: string;
  readonly strategyId?: string;
  readonly ownerId?: string;
  readonly startedAt?: string;
  readonly executedAt: string;
  readonly executedBy: string;
  readonly updatedAt?: string;
  readonly relationKind?: PresentedExecution["relationKind"];
  readonly previousExecutionId?: string;
  readonly triggeringDefectId?: string;
};

export function normalizePresentedExecution(
  row: PresentedExecutionSeed,
): PresentedExecution {
  const result = mapOutcomeToProductResult(row.result);
  const status = row.status ?? (result === "not_run" ? "draft" : "completed");
  return {
    id: row.id,
    tenantId: row.tenantId,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    ...(row.planId ? { planId: row.planId } : {}),
    ...(row.suiteId ? { suiteId: row.suiteId } : {}),
    ...(row.specificationId ? { specificationId: row.specificationId } : {}),
    ...(row.name ? { name: row.name } : {}),
    mode: row.mode,
    type: row.type ?? deriveExecutionType({ mode: row.mode }),
    engine: row.engine,
    status,
    result,
    ...(row.progressPercent !== undefined
      ? { progressPercent: row.progressPercent }
      : {}),
    ...(row.environmentId ? { environmentId: row.environmentId } : {}),
    ...(row.environmentName ? { environmentName: row.environmentName } : {}),
    ...(row.method ? { method: row.method } : {}),
    ...(row.strategyId ? { strategyId: row.strategyId } : {}),
    ...(row.ownerId ? { ownerId: row.ownerId } : {}),
    ...(row.startedAt ? { startedAt: row.startedAt } : {}),
    executedAt: row.executedAt,
    executedBy: row.executedBy,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
    ...(row.relationKind ? { relationKind: row.relationKind } : {}),
    ...(row.previousExecutionId
      ? { previousExecutionId: row.previousExecutionId }
      : {}),
    ...(row.triggeringDefectId ? { triggeringDefectId: row.triggeringDefectId } : {}),
    unbound: !row.applicationId,
  };
}
