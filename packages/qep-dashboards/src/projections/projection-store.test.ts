/**
 * QX-P1-02 — Honest-empty projection evidence.
 */
import { describe, expect, it } from "vitest";

import { PROJECTION_EMPTY_ATTRIBUTION, resolveProjection } from "./projection-store";

const FABRICATED_QUERY_IDS = [
  "qep.qi.scores.overall",
  "qep.reporting.release_readiness",
  "qep.qi.confidence",
  "qep.reporting.quality_trend",
  "qep.execution.trend",
  "qep.automation.activity",
  "qep.scm.activity",
  "qep.evidence.growth",
  "qep.qi.risk_matrix",
  "qep.evidence.timeline",
  "qep.qi.recommendations",
  "qep.providers.status",
  "qep.unknown.widget",
] as const;

describe("QX-P1-02 resolveProjection honest empty", () => {
  it("attributes every default projection as empty (no SoR binding)", () => {
    for (const queryId of FABRICATED_QUERY_IDS) {
      const payload = resolveProjection(queryId);
      expect(payload.attribution).toBe(PROJECTION_EMPTY_ATTRIBUTION);
    }
  });

  it("does not fabricate chart series or numeric gauge values", () => {
    for (const queryId of [
      "qep.reporting.quality_trend",
      "qep.execution.trend",
      "qep.automation.activity",
      "qep.scm.activity",
      "qep.evidence.growth",
    ] as const) {
      const payload = resolveProjection(queryId);
      expect(payload.kind).toBe("chart");
      if (payload.kind === "chart") {
        expect(payload.descriptor.series).toEqual([]);
      }
    }

    const confidence = resolveProjection("qep.qi.confidence");
    expect(confidence.kind).toBe("status");
    if (confidence.kind === "status") {
      expect(confidence.status).toBe("empty");
    }
  });

  it("does not fabricate KPI readiness scores", () => {
    const readiness = resolveProjection("qep.reporting.release_readiness");
    expect(readiness.kind).toBe("kpi");
    if (readiness.kind === "kpi") {
      expect(readiness.descriptor.value).toBe("No data");
      expect(String(readiness.descriptor.value)).not.toMatch(/^\d/);
    }
  });
});
