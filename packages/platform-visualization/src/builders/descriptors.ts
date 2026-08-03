import type {
  EvidenceViewerDescriptor,
  EvidenceViewerKind,
} from "../contracts/evidence-viewer";
import type {
  ChartDescriptor,
  ChartSeries,
  GaugeDescriptor,
  HeatMapDescriptor,
  KpiDescriptor,
  RiskMatrixDescriptor,
  TimelineDescriptor,
  TimelineEvent,
} from "../contracts/series";
import { clampDisplayPercent, summarizeSeries } from "../format/presentation";

export function buildKpi(input: {
  readonly kpiId: string;
  readonly title: string;
  readonly value: string | number;
  readonly trend?: "up" | "down" | "flat";
  readonly href?: string;
}): KpiDescriptor {
  return {
    ...input,
    a11ySummary: `${input.title}: ${input.value}${input.trend ? `, trend ${input.trend}` : ""}`,
  };
}

export function buildChart(input: {
  readonly chartId: string;
  readonly kind: ChartDescriptor["kind"];
  readonly title: string;
  readonly series: readonly ChartSeries[];
  readonly unit?: string;
}): ChartDescriptor {
  const summaries = input.series.map((s) => summarizeSeries(s.name, s.points));
  return {
    ...input,
    a11ySummary: `${input.title}. ${summaries.join(". ")}`,
  };
}

export function buildTimeline(input: {
  readonly timelineId: string;
  readonly title: string;
  readonly events: readonly TimelineEvent[];
}): TimelineDescriptor {
  return {
    ...input,
    a11ySummary: `${input.title}: ${input.events.length} events`,
  };
}

export function buildHeatMap(input: {
  readonly heatMapId: string;
  readonly title: string;
  readonly cells: HeatMapDescriptor["cells"];
}): HeatMapDescriptor {
  return {
    ...input,
    a11ySummary: `${input.title}: ${input.cells.length} cells`,
  };
}

export function buildRiskMatrix(input: {
  readonly matrixId: string;
  readonly title: string;
  readonly cells: RiskMatrixDescriptor["cells"];
}): RiskMatrixDescriptor {
  return {
    ...input,
    a11ySummary: `${input.title}: ${input.cells.length} risk cells`,
  };
}

export function buildGauge(input: {
  readonly gaugeId: string;
  readonly title: string;
  readonly value: number;
  readonly max?: number;
  readonly level?: GaugeDescriptor["level"];
}): GaugeDescriptor {
  const max = input.max ?? 100;
  const value = clampDisplayPercent((input.value / max) * 100);
  return {
    gaugeId: input.gaugeId,
    title: input.title,
    value,
    max: 100,
    level: input.level,
    a11ySummary: `${input.title}: ${value} of 100${input.level ? `, ${input.level}` : ""}`,
  };
}

export function buildEvidenceViewer(input: {
  readonly viewerId: string;
  readonly kind: EvidenceViewerKind;
  readonly title: string;
  readonly evidenceRef: string;
  readonly mimeType?: string;
  readonly caption?: string;
}): EvidenceViewerDescriptor {
  return {
    ...input,
    a11yLabel: `${input.title} (${input.kind})`,
  };
}

/** Catalog of supported visualization kinds for registry / metadata APIs. */
export const VISUALIZATION_KINDS = [
  "kpi",
  "line_chart",
  "bar_chart",
  "sparkline",
  "timeline",
  "heat_map",
  "risk_matrix",
  "gauge",
  "confidence_indicator",
  "screenshot_viewer",
  "video_viewer",
  "trace_viewer",
  "execution_log_viewer",
  "artifact_explorer",
  "evidence_timeline",
  "relationship_viewer",
  "reference_viewer",
] as const;

export type VisualizationKind = (typeof VISUALIZATION_KINDS)[number];
