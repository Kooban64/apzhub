/** Route helper tests (APZMETRICS-003/004). */
import { describe, expect, it } from "vitest";

import {
  assertMetricsApiPath,
  isMetricsApiPath,
  isMetricsRoute,
  resolveMetricsSection,
  metricsSectionPath,
  METRICS_API_BASE,
  METRICS_WORKSPACE_BASE,
  METRICS_FORBIDDEN_HTTP_SEGMENTS,
} from "./routes";

describe("metrics routes", () => {
  it("accepts metrics API base paths", () => {
    expect(isMetricsApiPath(METRICS_API_BASE)).toBe(true);
    expect(isMetricsApiPath(`${METRICS_API_BASE}/kpis`)).toBe(true);
  });

  it("rejects non-metrics and forbidden segments", () => {
    expect(isMetricsApiPath("/api/v1/observe")).toBe(false);
    expect(() => assertMetricsApiPath("/api/v1/observe")).toThrow();
    for (const segment of METRICS_FORBIDDEN_HTTP_SEGMENTS.slice(0, 5)) {
      expect(() => assertMetricsApiPath(`${METRICS_API_BASE}/${segment}`)).toThrow(
        /Forbidden metrics HTTP segment/,
      );
    }
  });

  it("resolves workbench sections", () => {
    expect(isMetricsRoute(METRICS_WORKSPACE_BASE)).toBe(true);
    expect(isMetricsRoute(`${METRICS_WORKSPACE_BASE}/formulas`)).toBe(true);
    expect(isMetricsRoute("/workspace/observability")).toBe(false);
    expect(resolveMetricsSection(METRICS_WORKSPACE_BASE)).toBe("overview");
    expect(resolveMetricsSection(`${METRICS_WORKSPACE_BASE}/kpis`)).toBe("kpis");
    expect(resolveMetricsSection(`${METRICS_WORKSPACE_BASE}/unknown`)).toBe("overview");
    expect(metricsSectionPath()).toContain("/overview");
    expect(metricsSectionPath("formulas")).toContain("/formulas");
  });
});
