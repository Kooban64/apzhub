import type { WidgetDescriptor } from "../contracts/widget";

/**
 * Built-in product-agnostic widget catalogue.
 * No projectionQueryId defaults — products bind their own queries.
 */
export function createBuiltinWidgetDescriptors(): readonly WidgetDescriptor[] {
  const kinds = [
    ["kpi_card", "KPI Card"],
    ["metric_tile", "Metric Tile"],
    ["trend_chart", "Trend Chart"],
    ["status_card", "Status Card"],
    ["progress_bar", "Progress Bar"],
    ["timeline", "Timeline"],
    ["heat_map", "Heat Map"],
    ["risk_matrix", "Risk Matrix"],
    ["coverage_view", "Coverage View"],
    ["confidence_gauge", "Confidence Gauge"],
    ["recommendation_panel", "Recommendation Panel"],
    ["activity_feed", "Activity Feed"],
    ["audit_timeline", "Audit Timeline"],
    ["provider_status", "Provider Status"],
    ["health_indicator", "Health Indicator"],
    ["empty_state", "Empty State"],
    ["loading_state", "Loading State"],
    ["error_state", "Error State"],
  ] as const;

  return kinds.map(([kind, title]) => ({
    widgetId: `platform.${kind}`,
    version: "0.1.0",
    title,
    kind,
    requiredPermissions: [],
    refreshPolicy: kind.includes("state") ? "manual" : "interval",
    refreshIntervalMs: kind.includes("state") ? undefined : 60_000,
    a11yLabel: title,
  }));
}
