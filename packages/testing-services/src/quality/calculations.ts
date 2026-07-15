/**
 * Pure deterministic quality / coverage calculation helpers.
 * No I/O, no randomness, stable sorting for reproducible results.
 */

export function safePercent(covered: number, total: number): number {
  if (total <= 0) return 0;
  return (covered / total) * 100;
}

export function roundPercent(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function coveragePercentage(covered: number, total: number): number {
  return roundPercent(safePercent(covered, total));
}

/** Severity weights for open-defect impact (critical > high > medium > low). */
export const SEVERITY_IMPACT_WEIGHTS: Readonly<Record<string, number>> = {
  blocker: 5,
  critical: 4,
  major: 3,
  high: 3,
  medium: 2,
  minor: 1,
  low: 1,
  info: 0.5,
};

export function severityWeight(severity: string | undefined): number {
  if (!severity) return 1;
  return SEVERITY_IMPACT_WEIGHTS[severity] ?? 1;
}

export function computeOpenDefectImpact(
  defects: readonly { readonly severity?: string; readonly status: string }[],
): number {
  const openLike = new Set(["open", "in_progress", "reopened"]);
  let impact = 0;
  for (const d of defects) {
    if (openLike.has(d.status)) impact += severityWeight(d.severity);
  }
  return roundPercent(impact, 2);
}

export function computeDefectDensity(
  openDefectCount: number,
  denominator: number,
): number {
  if (denominator <= 0) return 0;
  return roundPercent(openDefectCount / denominator, 4);
}

export function computeRate(count: number, total: number): number {
  return roundPercent(safePercent(count, total));
}

export function severityDistribution(
  defects: readonly { readonly severity?: string }[],
): Record<string, number> {
  const dist: Record<string, number> = {};
  const sorted = [...defects].sort((a, b) =>
    String(a.severity ?? "").localeCompare(String(b.severity ?? "")),
  );
  for (const d of sorted) {
    const key = d.severity ?? "unspecified";
    dist[key] = (dist[key] ?? 0) + 1;
  }
  return dist;
}

export function stableSortIds(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => a.localeCompare(b));
}

export interface ExecutionStatusCounts {
  readonly total: number;
  readonly pass: number;
  readonly fail: number;
  readonly blocked: number;
  readonly skipped: number;
}

export function countExecutionStatuses(
  results: readonly { readonly status?: string; readonly overallResult?: string }[],
): ExecutionStatusCounts {
  let pass = 0;
  let fail = 0;
  let blocked = 0;
  let skipped = 0;
  for (const r of results) {
    const status = (r.overallResult ?? r.status ?? "").toLowerCase();
    if (status === "pass" || status === "passed") pass += 1;
    else if (status === "fail" || status === "failed") fail += 1;
    else if (status === "blocked") blocked += 1;
    else if (status === "skipped" || status === "skip") skipped += 1;
  }
  return { total: results.length, pass, fail, blocked, skipped };
}

/**
 * Regression analysis by case key — deterministic, no prediction.
 */
export function analyzeRegressionByCaseKey(
  baseline: readonly { readonly caseKey: string; readonly status: string }[],
  current: readonly { readonly caseKey: string; readonly status: string }[],
): {
  readonly newFailures: string[];
  readonly resolvedFailures: string[];
  readonly reopenedFailures: string[];
} {
  const isFail = (s: string) => {
    const n = s.toLowerCase();
    return n === "fail" || n === "failed";
  };
  const isPass = (s: string) => {
    const n = s.toLowerCase();
    return n === "pass" || n === "passed";
  };

  const baselineMap = new Map<string, string>();
  for (const r of [...baseline].sort((a, b) => a.caseKey.localeCompare(b.caseKey))) {
    baselineMap.set(r.caseKey, r.status);
  }
  const currentMap = new Map<string, string>();
  for (const r of [...current].sort((a, b) => a.caseKey.localeCompare(b.caseKey))) {
    currentMap.set(r.caseKey, r.status);
  }

  const newFailures: string[] = [];
  const resolvedFailures: string[] = [];
  const reopenedFailures: string[] = [];

  const allKeys = stableSortIds([
    ...new Set([...baselineMap.keys(), ...currentMap.keys()]),
  ]);

  for (const key of allKeys) {
    const b = baselineMap.get(key);
    const c = currentMap.get(key);
    if (c !== undefined && isFail(c) && (b === undefined || !isFail(b))) {
      if (b !== undefined && isPass(b)) reopenedFailures.push(key);
      else newFailures.push(key);
    }
    if (b !== undefined && isFail(b) && c !== undefined && isPass(c)) {
      resolvedFailures.push(key);
    }
  }

  return { newFailures, resolvedFailures, reopenedFailures };
}

export function numericDelta(current: number, baseline: number): number {
  return roundPercent(current - baseline, 4);
}

/**
 * Overall readiness score = equal-weight average of dimension scores (0–100).
 * Documented formula for callers — never an auto-approve decision.
 */
export function overallReadinessScore(dimensionScores: readonly number[]): number {
  if (dimensionScores.length === 0) return 0;
  const sum = dimensionScores.reduce((a, b) => a + b, 0);
  return roundPercent(sum / dimensionScores.length);
}

export function dimensionStatusFromScore(
  score: number,
  blockers: readonly string[],
): "ready" | "partial" | "blocked" {
  if (blockers.length > 0 || score < 40) return "blocked";
  if (score >= 90) return "ready";
  return "partial";
}

export function suggestedReleaseStatusFromDimensions(
  dimensionStatuses: readonly ("ready" | "partial" | "blocked")[],
): "not_ready" | "partially_ready" | "ready" | "blocked" {
  if (dimensionStatuses.length === 0) return "not_ready";
  if (dimensionStatuses.every((s) => s === "ready")) return "ready";
  if (dimensionStatuses.some((s) => s === "blocked")) return "blocked";
  return "partially_ready";
}
