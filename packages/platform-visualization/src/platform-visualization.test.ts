import { describe, expect, it } from "vitest";

import {
  buildChart,
  buildEvidenceViewer,
  buildGauge,
  buildKpi,
  VISUALIZATION_KINDS,
} from "./builders/descriptors";
import { downsamplePoints, summarizeSeries } from "./format/presentation";
import { createPlatformVisualization } from "./sdk/create-visualization";

describe("APZQEP-164 platform-visualization", () => {
  it("lists reusable visualization kinds", () => {
    const viz = createPlatformVisualization();
    expect(viz.registry.list().length).toBe(VISUALIZATION_KINDS.length);
    expect(viz.registry.has("line_chart")).toBe(true);
    expect(viz.registry.has("screenshot_viewer")).toBe(true);
  });

  it("builds presentation descriptors with a11y summaries", () => {
    const kpi = buildKpi({
      kpiId: "k1",
      title: "Coverage",
      value: 92,
      trend: "up",
    });
    expect(kpi.a11ySummary).toContain("Coverage");

    const chart = buildChart({
      chartId: "c1",
      kind: "line",
      title: "Quality trend",
      series: [
        {
          seriesId: "s1",
          name: "Score",
          points: [
            { x: "2026-01", y: 70 },
            { x: "2026-02", y: 80 },
          ],
        },
      ],
    });
    expect(chart.a11ySummary).toMatch(/trend up/i);

    const gauge = buildGauge({
      gaugeId: "g1",
      title: "Confidence",
      value: 75,
      level: "high",
    });
    expect(gauge.value).toBe(75);

    const viewer = buildEvidenceViewer({
      viewerId: "v1",
      kind: "screenshot",
      title: "Failure shot",
      evidenceRef: "evidence://artifact/1",
    });
    expect(viewer.evidenceRef.startsWith("evidence://")).toBe(true);
  });

  it("downsamples large series for performance", () => {
    const points = Array.from({ length: 1000 }, (_, i) => ({ y: i }));
    const sampled = downsamplePoints(points, 50);
    expect(sampled).toHaveLength(50);
    expect(summarizeSeries("Demo", sampled).length).toBeGreaterThan(0);
  });
});
