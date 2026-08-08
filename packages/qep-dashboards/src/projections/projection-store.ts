/**
 * QX-P1-02 — Honest-empty dashboard projections.
 * No fabricated KPI/chart values. SoR ports may replace empties later (V1.2+).
 */

import {
  buildChart,
  buildKpi,
  buildRiskMatrix,
  buildTimeline,
  type ChartDescriptor,
  type GaugeDescriptor,
  type KpiDescriptor,
  type RiskMatrixDescriptor,
  type TimelineDescriptor,
} from "@apzhub/platform-visualization";

/** Attribution when a projection has no bound System of Record data. */
export const PROJECTION_EMPTY_ATTRIBUTION =
  "empty:no_system_of_record_binding" as const;

/**
 * Read-model projection payload for widgets.
 * Values are SoR-attributed or honest empty — never fabricated quality metrics.
 */
export type ProjectionPayload =
  | {
      readonly kind: "kpi";
      readonly descriptor: KpiDescriptor;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "chart";
      readonly descriptor: ChartDescriptor;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "gauge";
      readonly descriptor: GaugeDescriptor;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "timeline";
      readonly descriptor: TimelineDescriptor;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "risk_matrix";
      readonly descriptor: RiskMatrixDescriptor;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "list";
      readonly title: string;
      readonly items: readonly {
        readonly id: string;
        readonly label: string;
        readonly href?: string;
      }[];
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    }
  | {
      readonly kind: "status";
      readonly title: string;
      readonly status: "empty" | "ready" | "error";
      readonly detail: string;
      readonly attribution: typeof PROJECTION_EMPTY_ATTRIBUTION | `sor:${string}`;
    };

function emptyKpi(queryId: string, title: string, href?: string): ProjectionPayload {
  return {
    kind: "kpi",
    attribution: PROJECTION_EMPTY_ATTRIBUTION,
    descriptor: buildKpi({
      kpiId: queryId,
      title,
      value: "No data",
      trend: "flat",
      href,
    }),
  };
}

function emptyChart(queryId: string, title: string): ProjectionPayload {
  return {
    kind: "chart",
    attribution: PROJECTION_EMPTY_ATTRIBUTION,
    descriptor: buildChart({
      chartId: queryId,
      kind: "line",
      title,
      series: [],
    }),
  };
}

function emptyTimeline(queryId: string, title: string): ProjectionPayload {
  return {
    kind: "timeline",
    attribution: PROJECTION_EMPTY_ATTRIBUTION,
    descriptor: buildTimeline({
      timelineId: queryId,
      title,
      events: [],
    }),
  };
}

/**
 * Projection adapter: honest empty until SoR ports are bound.
 * Must not invent KPI numbers, chart series, or readiness scores.
 */
export function resolveProjection(queryId: string): ProjectionPayload {
  switch (queryId) {
    case "qep.qi.scores.overall":
      return emptyKpi(
        queryId,
        "Overall Quality Score",
        "/workspace/qep/quality-intelligence/scores",
      );
    case "qep.reporting.release_readiness":
      return emptyKpi(
        queryId,
        "Release Readiness",
        "/workspace/qep/enterprise-reporting",
      );
    case "qep.qi.confidence":
      return {
        kind: "status",
        title: "Confidence",
        status: "empty",
        detail: "No Quality Intelligence confidence bound — open QI when data exists.",
        attribution: PROJECTION_EMPTY_ATTRIBUTION,
      };
    case "qep.reporting.quality_trend":
    case "qep.execution.trend":
    case "qep.automation.activity":
    case "qep.scm.activity":
    case "qep.evidence.growth":
      return emptyChart(queryId, queryId);
    case "qep.qi.risk_matrix":
      return {
        kind: "risk_matrix",
        attribution: PROJECTION_EMPTY_ATTRIBUTION,
        descriptor: buildRiskMatrix({
          matrixId: queryId,
          title: "Risk Matrix",
          cells: [],
        }),
      };
    case "qep.evidence.timeline":
    case "qep.execution.timeline":
    case "qep.audit.timeline":
      return emptyTimeline(queryId, queryId);
    case "qep.qi.recommendations":
      return {
        kind: "list",
        title: "Recommendations",
        attribution: PROJECTION_EMPTY_ATTRIBUTION,
        items: [],
      };
    case "qep.providers.status":
      return {
        kind: "list",
        title: "Providers",
        attribution: PROJECTION_EMPTY_ATTRIBUTION,
        items: [],
      };
    default:
      return {
        kind: "status",
        title: queryId,
        status: "empty",
        detail:
          "No data — projection is not bound to a System of Record for this widget.",
        attribution: PROJECTION_EMPTY_ATTRIBUTION,
      };
  }
}
