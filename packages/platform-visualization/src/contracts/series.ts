/** Opaque series point for charts — values already derived by platform services. */
export interface SeriesPoint {
  readonly x: string;
  readonly y: number;
  readonly label?: string;
}

export interface ChartSeries {
  readonly seriesId: string;
  readonly name: string;
  readonly points: readonly SeriesPoint[];
}

export interface ChartDescriptor {
  readonly chartId: string;
  readonly kind: "line" | "bar" | "area" | "sparkline";
  readonly title: string;
  readonly series: readonly ChartSeries[];
  readonly unit?: string;
  readonly a11ySummary: string;
}

export interface TimelineEvent {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly title: string;
  readonly category?: string;
  readonly href?: string;
}

export interface TimelineDescriptor {
  readonly timelineId: string;
  readonly title: string;
  readonly events: readonly TimelineEvent[];
  readonly a11ySummary: string;
}

export interface HeatMapCell {
  readonly row: string;
  readonly column: string;
  readonly value: number;
  readonly label?: string;
}

export interface HeatMapDescriptor {
  readonly heatMapId: string;
  readonly title: string;
  readonly cells: readonly HeatMapCell[];
  readonly a11ySummary: string;
}

export interface MatrixCell {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly severity?: "low" | "medium" | "high" | "critical";
}

export interface RiskMatrixDescriptor {
  readonly matrixId: string;
  readonly title: string;
  readonly cells: readonly MatrixCell[];
  readonly a11ySummary: string;
}

export interface GaugeDescriptor {
  readonly gaugeId: string;
  readonly title: string;
  readonly value: number;
  readonly max: number;
  readonly level?: "low" | "medium" | "high";
  readonly a11ySummary: string;
}

export interface KpiDescriptor {
  readonly kpiId: string;
  readonly title: string;
  readonly value: string | number;
  readonly trend?: "up" | "down" | "flat";
  readonly href?: string;
  readonly a11ySummary: string;
}
