/**
 * Metrics Engine — pure derivation from QualityFacts.
 * Values are never manually edited.
 */

import type { MetricKey, MetricValue, MetricsBundle, QualityFacts } from "./types";

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function metric(
  key: MetricKey,
  label: string,
  value: number,
  unit: MetricValue["unit"],
  calculatedAt: string,
): MetricValue {
  return { key, label, value, unit, calculatedAt };
}

export function calculateMetrics(facts: QualityFacts): MetricsBundle {
  const at = facts.asOf;
  const agingAvg =
    facts.defectAgingCount > 0
      ? Math.round(facts.defectAgingDaysSum / facts.defectAgingCount)
      : 0;

  const metrics: MetricValue[] = [
    metric(
      "requirement_coverage",
      "Requirement Coverage",
      facts.requirementCoverageAvg,
      "percent",
      at,
    ),
    metric(
      "suite_coverage",
      "Suite Coverage",
      pct(facts.suiteActive, facts.suiteTotal),
      "percent",
      at,
    ),
    metric(
      "execution_progress",
      "Execution Progress",
      pct(facts.sessionCompleted, facts.sessionTotal),
      "percent",
      at,
    ),
    metric(
      "execution_success_rate",
      "Execution Success Rate",
      pct(facts.sessionPassed, facts.sessionCompleted),
      "percent",
      at,
    ),
    metric(
      "execution_failure_rate",
      "Execution Failure Rate",
      pct(facts.sessionFailed, facts.sessionCompleted),
      "percent",
      at,
    ),
    metric(
      "blocked_executions",
      "Blocked Executions",
      facts.sessionBlocked,
      "count",
      at,
    ),
    metric("open_defects", "Open Defects", facts.defectOpen, "count", at),
    metric("critical_defects", "Critical Defects", facts.defectCritical, "count", at),
    metric("defect_aging_days_avg", "Defect Aging (avg days)", agingAvg, "days", at),
    metric("retest_queue", "Retest Queue", facts.defectRetest, "count", at),
    metric(
      "verification_rate",
      "Verification Rate",
      pct(facts.defectVerified, facts.defectTotal),
      "percent",
      at,
    ),
    metric(
      "evidence_availability",
      "Evidence Availability",
      facts.evidenceTotal,
      "count",
      at,
    ),
    metric(
      "evidence_integrity",
      "Evidence Integrity",
      pct(facts.evidenceIntegrityOk, facts.evidenceTotal),
      "percent",
      at,
    ),
    metric(
      "execution_throughput",
      "Execution Throughput",
      facts.sessionCompleted,
      "count",
      at,
    ),
    metric(
      "planning_readiness",
      "Planning Readiness",
      pct(facts.planReady + facts.planHandedOff, facts.planTotal),
      "percent",
      at,
    ),
    metric(
      "approval_status",
      "Requirement Approval Rate",
      pct(facts.requirementApproved, facts.requirementTotal),
      "percent",
      at,
    ),
    metric(
      "uncovered_requirements",
      "Uncovered Requirements",
      facts.requirementUncovered,
      "count",
      at,
    ),
    metric(
      "high_risk_gaps",
      "High-Risk Gaps",
      facts.requirementHighRiskGaps,
      "count",
      at,
    ),
  ];

  return {
    tenantId: facts.tenantId,
    ...(facts.projectId ? { projectId: facts.projectId } : {}),
    calculatedAt: at,
    metrics,
  };
}

export function pickMetrics(
  bundle: MetricsBundle,
  keys: readonly MetricKey[],
): readonly MetricValue[] {
  const set = new Set(keys);
  return bundle.metrics.filter((m) => set.has(m.key));
}
