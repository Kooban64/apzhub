import type { MetricKey, ReportDefinition, ReportTemplateId } from "./types";

export const REPORT_TEMPLATES: readonly ReportDefinition[] = [
  {
    templateId: "coverage_summary",
    name: "Coverage Summary",
    description: "Requirement and suite coverage derived metrics.",
    defaultMetricKeys: [
      "requirement_coverage",
      "suite_coverage",
      "uncovered_requirements",
      "high_risk_gaps",
    ],
  },
  {
    templateId: "execution_summary",
    name: "Execution Summary",
    description: "Execution progress and outcomes.",
    defaultMetricKeys: [
      "execution_progress",
      "execution_success_rate",
      "execution_failure_rate",
      "blocked_executions",
      "execution_throughput",
    ],
  },
  {
    templateId: "defect_summary",
    name: "Defect Summary",
    description: "Open, critical, aging and retest metrics.",
    defaultMetricKeys: [
      "open_defects",
      "critical_defects",
      "defect_aging_days_avg",
      "retest_queue",
      "verification_rate",
    ],
  },
  {
    templateId: "requirement_gaps",
    name: "Requirement Gaps",
    description: "Uncovered and high-risk requirement gaps.",
    defaultMetricKeys: [
      "uncovered_requirements",
      "high_risk_gaps",
      "requirement_coverage",
      "approval_status",
    ],
  },
  {
    templateId: "release_readiness",
    name: "Release Readiness",
    description: "Release readiness from coverage, execution and defects.",
    defaultMetricKeys: [
      "requirement_coverage",
      "planning_readiness",
      "execution_success_rate",
      "critical_defects",
      "evidence_integrity",
    ],
  },
  {
    templateId: "quality_trends",
    name: "Quality Trends",
    description: "Trend-oriented metric set for quality posture.",
    defaultMetricKeys: [
      "requirement_coverage",
      "execution_success_rate",
      "open_defects",
      "critical_defects",
    ],
  },
];

export function getReportTemplate(
  templateId: ReportTemplateId,
): ReportDefinition | undefined {
  return REPORT_TEMPLATES.find((t) => t.templateId === templateId);
}

export function templateMetricKeys(templateId: ReportTemplateId): readonly MetricKey[] {
  return getReportTemplate(templateId)?.defaultMetricKeys ?? [];
}
