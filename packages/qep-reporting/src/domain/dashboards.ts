import type { DashboardDefinition, DashboardId } from "./types";

const PERM = "qep.reporting.read";

export const DASHBOARD_CATALOGUE: readonly DashboardDefinition[] = [
  {
    dashboardId: "executive",
    name: "Executive Dashboard",
    audience: "Executives",
    description: "Portfolio quality posture from derived metrics.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "exec-coverage",
        title: "Requirement Coverage",
        kind: "metric",
        metricKeys: ["requirement_coverage", "uncovered_requirements"],
      },
      {
        widgetId: "exec-defects",
        title: "Critical Defects",
        kind: "metric",
        metricKeys: ["critical_defects", "open_defects"],
      },
      {
        widgetId: "exec-success",
        title: "Execution Success",
        kind: "metric",
        metricKeys: ["execution_success_rate", "execution_failure_rate"],
      },
      {
        widgetId: "exec-trend",
        title: "Quality Trend",
        kind: "trend",
        metricKeys: ["requirement_coverage", "execution_success_rate"],
      },
    ],
  },
  {
    dashboardId: "qa_manager",
    name: "QA Manager Dashboard",
    audience: "QA Managers",
    description: "Coverage, defects and planning readiness.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "qa-ready",
        title: "Planning Readiness",
        kind: "metric",
        metricKeys: ["planning_readiness", "approval_status"],
      },
      {
        widgetId: "qa-gaps",
        title: "Risk Gaps",
        kind: "metric",
        metricKeys: ["high_risk_gaps", "uncovered_requirements"],
      },
      {
        widgetId: "qa-defects",
        title: "Defect Posture",
        kind: "metric",
        metricKeys: ["open_defects", "retest_queue", "defect_aging_days_avg"],
      },
    ],
  },
  {
    dashboardId: "test_lead",
    name: "Test Lead Dashboard",
    audience: "Test Leads",
    description: "Execution progress and blocked work.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "lead-progress",
        title: "Execution Progress",
        kind: "metric",
        metricKeys: ["execution_progress", "execution_throughput"],
      },
      {
        widgetId: "lead-blocked",
        title: "Blocked",
        kind: "metric",
        metricKeys: ["blocked_executions"],
      },
      {
        widgetId: "lead-retest",
        title: "Retest Queue",
        kind: "metric",
        metricKeys: ["retest_queue"],
      },
    ],
  },
  {
    dashboardId: "tester",
    name: "Tester Dashboard",
    audience: "Testers",
    description: "Personal execution and retest focus.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "tester-exec",
        title: "My Execution Focus",
        kind: "metric",
        metricKeys: ["execution_progress", "blocked_executions", "retest_queue"],
      },
    ],
  },
  {
    dashboardId: "release",
    name: "Release Dashboard",
    audience: "Release Managers",
    description: "Release readiness from derived coverage and defects.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "rel-ready",
        title: "Readiness",
        kind: "metric",
        metricKeys: [
          "requirement_coverage",
          "execution_success_rate",
          "critical_defects",
          "planning_readiness",
        ],
      },
    ],
  },
  {
    dashboardId: "coverage",
    name: "Coverage Dashboard",
    audience: "QA / Traceability",
    description: "Requirement and suite coverage derived metrics.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "cov-main",
        title: "Coverage",
        kind: "metric",
        metricKeys: [
          "requirement_coverage",
          "suite_coverage",
          "uncovered_requirements",
          "high_risk_gaps",
        ],
      },
      {
        widgetId: "cov-trend",
        title: "Coverage Trend",
        kind: "trend",
        metricKeys: ["requirement_coverage", "suite_coverage"],
      },
    ],
  },
  {
    dashboardId: "defect",
    name: "Defect Dashboard",
    audience: "QA / Dev",
    description: "Open, critical, aging and retest metrics.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "def-main",
        title: "Defects",
        kind: "metric",
        metricKeys: [
          "open_defects",
          "critical_defects",
          "defect_aging_days_avg",
          "retest_queue",
          "verification_rate",
        ],
      },
    ],
  },
  {
    dashboardId: "execution",
    name: "Execution Dashboard",
    audience: "Test Leads / Testers",
    description: "Execution throughput and outcomes.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "ex-main",
        title: "Execution",
        kind: "metric",
        metricKeys: [
          "execution_progress",
          "execution_success_rate",
          "execution_failure_rate",
          "blocked_executions",
          "execution_throughput",
        ],
      },
    ],
  },
  {
    dashboardId: "quality_trend",
    name: "Quality Trend Dashboard",
    audience: "QA Managers",
    description: "Derived trends across coverage and execution success.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "qt-trend",
        title: "Trends",
        kind: "trend",
        metricKeys: [
          "requirement_coverage",
          "execution_success_rate",
          "open_defects",
          "critical_defects",
        ],
      },
    ],
  },
  {
    dashboardId: "portfolio",
    name: "Portfolio Dashboard",
    audience: "Executives / Portfolio",
    description: "Cross-capability quality portfolio snapshot.",
    requiredPermission: PERM,
    widgets: [
      {
        widgetId: "port-all",
        title: "Portfolio Snapshot",
        kind: "metric",
        metricKeys: [
          "requirement_coverage",
          "planning_readiness",
          "execution_progress",
          "open_defects",
          "evidence_integrity",
          "approval_status",
        ],
      },
    ],
  },
];

export function getDashboardDefinition(
  dashboardId: DashboardId,
): DashboardDefinition | undefined {
  return DASHBOARD_CATALOGUE.find((d) => d.dashboardId === dashboardId);
}
