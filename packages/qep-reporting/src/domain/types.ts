/**
 * Enterprise Reporting & Analytics domain — APZQEP-140-F.
 * Reporting is a projection, never a source of truth.
 */

export const DASHBOARD_IDS = [
  "executive",
  "qa_manager",
  "test_lead",
  "tester",
  "release",
  "coverage",
  "defect",
  "execution",
  "quality_trend",
  "portfolio",
] as const;
export type DashboardId = (typeof DASHBOARD_IDS)[number];

export const METRIC_KEYS = [
  "requirement_coverage",
  "suite_coverage",
  "execution_progress",
  "execution_success_rate",
  "execution_failure_rate",
  "blocked_executions",
  "open_defects",
  "critical_defects",
  "defect_aging_days_avg",
  "retest_queue",
  "verification_rate",
  "evidence_availability",
  "evidence_integrity",
  "execution_throughput",
  "planning_readiness",
  "approval_status",
  "uncovered_requirements",
  "high_risk_gaps",
] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

export type MetricValue = {
  readonly key: MetricKey;
  readonly label: string;
  readonly value: number;
  readonly unit: "count" | "percent" | "days";
  readonly calculatedAt: string;
};

export type MetricsBundle = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly calculatedAt: string;
  readonly metrics: readonly MetricValue[];
};

export type TrendPoint = {
  readonly at: string;
  readonly value: number;
};

export type TrendSeries = {
  readonly key: MetricKey;
  readonly label: string;
  readonly points: readonly TrendPoint[];
};

export type DashboardWidget = {
  readonly widgetId: string;
  readonly title: string;
  readonly kind: "metric" | "table" | "trend" | "status";
  readonly metricKeys?: readonly MetricKey[];
  readonly description?: string;
};

export type DashboardDefinition = {
  readonly dashboardId: DashboardId;
  readonly name: string;
  readonly audience: string;
  readonly description: string;
  readonly widgets: readonly DashboardWidget[];
  readonly requiredPermission: string;
};

export type DashboardView = {
  readonly definition: DashboardDefinition;
  readonly metrics: MetricsBundle;
  readonly trends: readonly TrendSeries[];
  readonly generatedAt: string;
};

export type ReportTemplateId =
  | "coverage_summary"
  | "execution_summary"
  | "defect_summary"
  | "requirement_gaps"
  | "release_readiness"
  | "quality_trends";

export type ReportDefinition = {
  readonly templateId: ReportTemplateId;
  readonly name: string;
  readonly description: string;
  readonly defaultMetricKeys: readonly MetricKey[];
};

export type SavedReport = {
  readonly reportId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly ownerId: string;
  readonly name: string;
  readonly templateId: ReportTemplateId;
  readonly filters: Readonly<{
    readonly projectId?: string;
    readonly releaseReference?: string;
    readonly environment?: string;
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly groupBy?: string;
  }>;
  readonly sharedWith: readonly string[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type GeneratedReport = {
  readonly reportId?: string;
  readonly templateId: ReportTemplateId;
  readonly name: string;
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly metrics: MetricsBundle;
  readonly rows: readonly Readonly<Record<string, string | number>>[];
  readonly exportMetadata: {
    readonly format: "json";
    readonly rowCount: number;
    readonly derived: true;
    readonly source: "qep-reporting";
  };
};

/** Facts gathered from Cap A–E / QKI — never stored as business SoR. */
export type QualityFacts = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly asOf: string;
  readonly requirementTotal: number;
  readonly requirementApproved: number;
  readonly requirementUncovered: number;
  readonly requirementHighRiskGaps: number;
  readonly requirementCoverageAvg: number;
  readonly suiteTotal: number;
  readonly suiteActive: number;
  readonly planTotal: number;
  readonly planReady: number;
  readonly planHandedOff: number;
  readonly sessionTotal: number;
  readonly sessionCompleted: number;
  readonly sessionInProgress: number;
  readonly sessionBlocked: number;
  readonly sessionPassed: number;
  readonly sessionFailed: number;
  readonly evidenceTotal: number;
  readonly evidenceIntegrityOk: number;
  readonly defectTotal: number;
  readonly defectOpen: number;
  readonly defectCritical: number;
  readonly defectRetest: number;
  readonly defectVerified: number;
  readonly defectAgingDaysSum: number;
  readonly defectAgingCount: number;
};
