import {
  buildChart,
  buildGauge,
  buildKpi,
  buildRiskMatrix,
  buildTimeline,
  downsamplePoints,
  type ChartDescriptor,
  type GaugeDescriptor,
  type KpiDescriptor,
  type RiskMatrixDescriptor,
  type TimelineDescriptor,
} from "@apzhub/platform-visualization";

/**
 * Read-model projection payload for widgets.
 * Values are placeholders / passthrough — no quality business calculations.
 */
export type ProjectionPayload =
  | { readonly kind: "kpi"; readonly descriptor: KpiDescriptor }
  | { readonly kind: "chart"; readonly descriptor: ChartDescriptor }
  | { readonly kind: "gauge"; readonly descriptor: GaugeDescriptor }
  | { readonly kind: "timeline"; readonly descriptor: TimelineDescriptor }
  | { readonly kind: "risk_matrix"; readonly descriptor: RiskMatrixDescriptor }
  | {
      readonly kind: "list";
      readonly title: string;
      readonly items: readonly {
        readonly id: string;
        readonly label: string;
        readonly href?: string;
      }[];
    }
  | {
      readonly kind: "status";
      readonly title: string;
      readonly status: string;
      readonly detail: string;
    };

/**
 * Projection adapter: returns pre-shaped presentation data.
 * In production, ports would fetch from Reporting/QI/Evidence APIs —
 * this foundation uses honest demo projections (not calculated quality rules).
 */
export function resolveProjection(queryId: string): ProjectionPayload {
  switch (queryId) {
    case "qep.qi.scores.overall":
      return {
        kind: "kpi",
        descriptor: buildKpi({
          kpiId: queryId,
          title: "Overall Quality Score",
          value: "—",
          trend: "flat",
          href: "/workspace/qep/quality-intelligence/scores",
        }),
      };
    case "qep.reporting.release_readiness":
      return {
        kind: "kpi",
        descriptor: buildKpi({
          kpiId: queryId,
          title: "Release Readiness",
          value: "Pending data",
          href: "/workspace/qep/enterprise-reporting",
        }),
      };
    case "qep.qi.confidence":
      return {
        kind: "gauge",
        descriptor: buildGauge({
          gaugeId: queryId,
          title: "Confidence",
          value: 0,
          level: "low",
        }),
      };
    case "qep.reporting.quality_trend":
    case "qep.execution.trend":
    case "qep.automation.activity":
    case "qep.scm.activity":
    case "qep.evidence.growth": {
      const points = downsamplePoints(
        [
          { x: "T-2", y: 0 },
          { x: "T-1", y: 0 },
          { x: "T0", y: 0 },
        ],
        50,
      );
      return {
        kind: "chart",
        descriptor: buildChart({
          chartId: queryId,
          kind: "line",
          title: queryId,
          series: [{ seriesId: "s1", name: "Projection", points }],
        }),
      };
    }
    case "qep.qi.risk_matrix":
      return {
        kind: "risk_matrix",
        descriptor: buildRiskMatrix({
          matrixId: queryId,
          title: "Risk Matrix",
          cells: [],
        }),
      };
    case "qep.evidence.timeline":
    case "qep.execution.timeline":
    case "qep.audit.timeline":
      return {
        kind: "timeline",
        descriptor: buildTimeline({
          timelineId: queryId,
          title: queryId,
          events: [],
        }),
      };
    case "qep.qi.recommendations":
      return {
        kind: "list",
        title: "Recommendations",
        items: [
          {
            id: "link",
            label: "Open Quality Intelligence recommendations",
            href: "/workspace/qep/quality-intelligence",
          },
        ],
      };
    case "qep.providers.status":
      return {
        kind: "list",
        title: "Providers",
        items: [
          {
            id: "automation",
            label: "Automation providers",
            href: "/workspace/qep/automation",
          },
          { id: "scm", label: "SCM providers", href: "/workspace/qep/scm" },
          {
            id: "qi",
            label: "Quality Intelligence providers",
            href: "/workspace/qep/quality-intelligence/providers",
          },
        ],
      };
    default:
      return {
        kind: "status",
        title: queryId,
        status: "ready",
        detail: "Projection placeholder — bind to platform API in runtime ports",
      };
  }
}
