/** Product-agnostic widget kinds — presentation only. */
export type WidgetKind =
  | "kpi_card"
  | "metric_tile"
  | "trend_chart"
  | "status_card"
  | "progress_bar"
  | "timeline"
  | "heat_map"
  | "risk_matrix"
  | "coverage_view"
  | "confidence_gauge"
  | "recommendation_panel"
  | "activity_feed"
  | "audit_timeline"
  | "provider_status"
  | "health_indicator"
  | "empty_state"
  | "loading_state"
  | "error_state";

/**
 * Widget descriptor registered in the Widget Registry.
 * Data is fetched via projectionQueryId — never calculated here.
 */
export interface WidgetDescriptor {
  readonly widgetId: string;
  readonly version: string;
  readonly title: string;
  readonly kind: WidgetKind;
  readonly requiredPermissions: readonly string[];
  /** Opaque projection / API query identifier owned by the consuming product. */
  readonly projectionQueryId?: string;
  readonly refreshPolicy: "manual" | "interval" | "event";
  readonly refreshIntervalMs?: number;
  readonly visualizationKind?: string;
  readonly emptyLabel?: string;
  readonly a11yLabel: string;
}

export interface WidgetInstance {
  readonly instanceId: string;
  readonly widgetId: string;
  readonly order: number;
  readonly columnSpan?: 1 | 2 | 3 | 4;
  readonly config?: Readonly<Record<string, string | number | boolean>>;
}
