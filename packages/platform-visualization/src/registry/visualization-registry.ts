import { VISUALIZATION_KINDS, type VisualizationKind } from "../builders/descriptors";

export interface VisualizationKindDescriptor {
  readonly kind: VisualizationKind;
  readonly title: string;
  readonly category: "chart" | "matrix" | "timeline" | "gauge" | "evidence";
}

const CATEGORY: Record<VisualizationKind, VisualizationKindDescriptor["category"]> = {
  kpi: "gauge",
  line_chart: "chart",
  bar_chart: "chart",
  sparkline: "chart",
  timeline: "timeline",
  heat_map: "matrix",
  risk_matrix: "matrix",
  gauge: "gauge",
  confidence_indicator: "gauge",
  screenshot_viewer: "evidence",
  video_viewer: "evidence",
  trace_viewer: "evidence",
  execution_log_viewer: "evidence",
  artifact_explorer: "evidence",
  evidence_timeline: "evidence",
  relationship_viewer: "evidence",
  reference_viewer: "evidence",
};

export class VisualizationRegistry {
  list(): readonly VisualizationKindDescriptor[] {
    return VISUALIZATION_KINDS.map((kind) => ({
      kind,
      title: kind
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      category: CATEGORY[kind],
    }));
  }

  has(kind: string): boolean {
    return (VISUALIZATION_KINDS as readonly string[]).includes(kind);
  }
}
