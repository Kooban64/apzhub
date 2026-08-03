import type { DashboardDefinition, WidgetDescriptor } from "@apzhub/platform-dashboard";

const PRODUCT = "apzqep";
const PERM = "qep.dashboards.read";

function widget(
  widgetId: string,
  title: string,
  kind: WidgetDescriptor["kind"],
  projectionQueryId: string,
): WidgetDescriptor {
  return {
    widgetId,
    version: "0.1.0",
    title,
    kind,
    requiredPermissions: [PERM],
    projectionQueryId,
    refreshPolicy: "interval",
    refreshIntervalMs: 60_000,
    a11yLabel: title,
  };
}

/** APZQEP-specific widget bindings — projections only, no calculations. */
export function createQepWidgetDescriptors(): readonly WidgetDescriptor[] {
  return [
    widget(
      "qep.kpi.quality_score",
      "Overall Quality Score",
      "kpi_card",
      "qep.qi.scores.overall",
    ),
    widget(
      "qep.kpi.release_readiness",
      "Release Readiness",
      "kpi_card",
      "qep.reporting.release_readiness",
    ),
    widget(
      "qep.trend.quality",
      "Quality Trend",
      "trend_chart",
      "qep.reporting.quality_trend",
    ),
    widget(
      "qep.trend.execution",
      "Execution Trend",
      "trend_chart",
      "qep.execution.trend",
    ),
    widget(
      "qep.trend.automation",
      "Automation Activity",
      "trend_chart",
      "qep.automation.activity",
    ),
    widget("qep.trend.scm", "Repository Activity", "trend_chart", "qep.scm.activity"),
    widget(
      "qep.trend.evidence",
      "Evidence Growth",
      "trend_chart",
      "qep.evidence.growth",
    ),
    widget(
      "qep.coverage.requirements",
      "Requirement Coverage",
      "coverage_view",
      "qep.requirements.coverage",
    ),
    widget("qep.matrix.risk", "Risk Matrix", "risk_matrix", "qep.qi.risk_matrix"),
    widget(
      "qep.heatmap.failures",
      "Failure Concentration",
      "heat_map",
      "qep.execution.failure_heatmap",
    ),
    widget(
      "qep.gauge.confidence",
      "Confidence",
      "confidence_gauge",
      "qep.qi.confidence",
    ),
    widget(
      "qep.panel.recommendations",
      "Recommendations",
      "recommendation_panel",
      "qep.qi.recommendations",
    ),
    widget("qep.feed.activity", "Activity Feed", "activity_feed", "qep.activity.feed"),
    widget(
      "qep.timeline.audit",
      "Audit Timeline",
      "audit_timeline",
      "qep.audit.timeline",
    ),
    widget(
      "qep.status.providers",
      "Provider Status",
      "provider_status",
      "qep.providers.status",
    ),
    widget(
      "qep.health.automation",
      "Automation Health",
      "health_indicator",
      "qep.automation.health",
    ),
    widget("qep.health.scm", "Repository Health", "health_indicator", "qep.scm.health"),
    widget("qep.status.defects", "Defect Status", "status_card", "qep.defects.status"),
    widget(
      "qep.progress.regression",
      "Regression Progress",
      "progress_bar",
      "qep.execution.regression",
    ),
    widget(
      "qep.timeline.evidence",
      "Evidence Timeline",
      "timeline",
      "qep.evidence.timeline",
    ),
    widget(
      "qep.timeline.execution",
      "Execution Timeline",
      "timeline",
      "qep.execution.timeline",
    ),
  ];
}

function dash(
  dashboardId: string,
  name: string,
  audience: DashboardDefinition["audience"],
  description: string,
  widgetIds: readonly string[],
  roles: readonly string[],
): DashboardDefinition {
  return {
    dashboardId,
    productId: PRODUCT,
    name,
    description,
    audience,
    requiredPermissions: [PERM],
    lifecycle: "published",
    defaultForRoles: roles,
    widgets: widgetIds.map((widgetId, index) => ({
      instanceId: `${dashboardId}-${index + 1}`,
      widgetId,
      order: index + 1,
      columnSpan:
        widgetId.includes("trend") ||
        widgetId.includes("matrix") ||
        widgetId.includes("heatmap")
          ? 2
          : 1,
    })),
  };
}

export function createQepDashboardDefinitions(): readonly DashboardDefinition[] {
  return [
    dash(
      "qep-executive",
      "Executive Dashboard",
      "executive",
      "Portfolio quality posture, readiness and top recommendations.",
      [
        "qep.kpi.quality_score",
        "qep.kpi.release_readiness",
        "qep.trend.quality",
        "qep.matrix.risk",
        "qep.panel.recommendations",
      ],
      ["executive", "product_board"],
    ),
    dash(
      "qep-engineering",
      "Engineering Dashboard",
      "engineering",
      "Delivery health, automation and repository activity.",
      [
        "qep.trend.execution",
        "qep.trend.automation",
        "qep.trend.scm",
        "qep.health.automation",
        "qep.status.defects",
      ],
      ["engineering_manager", "developer"],
    ),
    dash(
      "qep-qa",
      "QA Dashboard",
      "qa",
      "Coverage, evidence completeness, signals and regression.",
      [
        "qep.coverage.requirements",
        "qep.trend.evidence",
        "qep.progress.regression",
        "qep.gauge.confidence",
        "qep.panel.recommendations",
      ],
      ["qa_lead", "tester"],
    ),
    dash(
      "qep-project",
      "Project Dashboard",
      "project",
      "Single-project quality slice.",
      [
        "qep.kpi.quality_score",
        "qep.coverage.requirements",
        "qep.status.defects",
        "qep.timeline.execution",
      ],
      ["engineering_manager", "qa_lead", "release_manager"],
    ),
    dash(
      "qep-portfolio",
      "Portfolio Dashboard",
      "portfolio",
      "Cross-project quality overview.",
      ["qep.kpi.quality_score", "qep.trend.quality", "qep.matrix.risk"],
      ["executive", "engineering_manager"],
    ),
    dash(
      "qep-operations",
      "Operations Dashboard",
      "operations",
      "Provider status and platform health.",
      [
        "qep.status.providers",
        "qep.health.automation",
        "qep.health.scm",
        "qep.timeline.audit",
      ],
      ["operations", "administrator"],
    ),
    dash(
      "qep-release",
      "Release Dashboard",
      "release",
      "Release readiness, gates and residuals.",
      [
        "qep.kpi.release_readiness",
        "qep.matrix.risk",
        "qep.status.defects",
        "qep.progress.regression",
        "qep.panel.recommendations",
      ],
      ["release_manager", "executive"],
    ),
    dash(
      "qep-compliance",
      "Compliance Dashboard",
      "compliance",
      "Audit and certification readiness views.",
      ["qep.timeline.audit", "qep.kpi.release_readiness", "qep.feed.activity"],
      ["administrator", "product_board"],
    ),
    dash(
      "qep-automation",
      "Automation Dashboard",
      "automation",
      "Automation activity and health.",
      ["qep.trend.automation", "qep.health.automation", "qep.heatmap.failures"],
      ["qa_lead", "operations"],
    ),
    dash(
      "qep-repository",
      "Repository Dashboard",
      "repository",
      "SCM activity and repository health.",
      ["qep.trend.scm", "qep.health.scm", "qep.feed.activity"],
      ["developer", "operations"],
    ),
    dash(
      "qep-evidence",
      "Evidence Dashboard",
      "evidence",
      "Evidence growth and timelines.",
      ["qep.trend.evidence", "qep.timeline.evidence", "qep.coverage.requirements"],
      ["qa_lead", "tester"],
    ),
    dash(
      "qep-quality-intelligence",
      "Quality Intelligence Dashboard",
      "quality_intelligence",
      "QI scores, confidence and recommendations.",
      [
        "qep.kpi.quality_score",
        "qep.gauge.confidence",
        "qep.panel.recommendations",
        "qep.matrix.risk",
        "qep.trend.quality",
      ],
      ["qa_lead", "executive", "release_manager"],
    ),
  ];
}
