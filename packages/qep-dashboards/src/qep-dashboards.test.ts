import { describe, expect, it } from "vitest";

import { createQepDashboards } from "./compose";
import {
  QEP_DASHBOARDS_BASE_PATH,
  isQepDashboardsRoute,
  QEP_DASHBOARDS_ROUTES,
} from "./presentation/routes";

describe("APZQEP-164 qep-dashboards", () => {
  it("exposes workspace routes under /workspace/qep/dashboards", () => {
    expect(QEP_DASHBOARDS_ROUTES.home).toBe(QEP_DASHBOARDS_BASE_PATH);
    expect(isQepDashboardsRoute("/workspace/qep/dashboards/executive")).toBe(true);
    expect(isQepDashboardsRoute("/workspace/qep/quality-intelligence")).toBe(false);
  });

  it("registers twelve persona dashboards without business calculations", () => {
    const qep = createQepDashboards();
    const dashboards = qep.listDashboards();
    expect(dashboards).toHaveLength(12);
    expect(dashboards.every((d) => d.productId === "apzqep")).toBe(true);
    expect(dashboards.every((d) => d.lifecycle === "published")).toBe(true);

    const resolved = qep.resolveWidgetProjections("qep-executive", [
      "qep.dashboards.read",
    ]);
    expect(resolved.dashboard.widgets.length).toBeGreaterThan(0);
    expect(Object.keys(resolved.projections).length).toBeGreaterThan(0);

    // Projections are honest-empty — not fabricated quality scores (QX-P1-02)
    const overall = qep.getProjection("qep.qi.scores.overall");
    expect(overall.kind).toBe("kpi");
    if (overall.kind === "kpi") {
      expect(overall.descriptor.value).toBe("No data");
      expect(overall.attribution).toBe("empty:no_system_of_record_binding");
    }
  });

  it("lists visualization kinds from platform-visualization", () => {
    const qep = createQepDashboards();
    expect(qep.listVisualizationKinds().length).toBeGreaterThan(10);
  });
});
