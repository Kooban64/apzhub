import { describe, expect, it } from "vitest";

import { DASHBOARD_EVENT_TYPES } from "./contracts/events";
import { createPlatformDashboard } from "./sdk/create-dashboard";

describe("APZQEP-164 platform-dashboard", () => {
  it("registers builtin widgets without business logic", () => {
    const platform = createPlatformDashboard();
    const widgets = platform.widgets.list();
    expect(widgets.length).toBeGreaterThanOrEqual(18);
    expect(widgets.every((w) => w.widgetId.startsWith("platform."))).toBe(true);
    expect(widgets.find((w) => w.kind === "kpi_card")).toBeDefined();
    expect(widgets.find((w) => w.kind === "recommendation_panel")).toBeDefined();
  });

  it("registers product dashboards and resolves by permission", () => {
    const platform = createPlatformDashboard();
    platform.dashboards.register({
      dashboardId: "demo-exec",
      productId: "demo",
      name: "Demo Executive",
      description: "Demo only",
      audience: "executive",
      requiredPermissions: ["demo.read"],
      lifecycle: "published",
      defaultForRoles: ["executive"],
      widgets: [
        {
          instanceId: "w1",
          widgetId: "platform.kpi_card",
          order: 1,
          columnSpan: 1,
        },
        {
          instanceId: "w2",
          widgetId: "platform.trend_chart",
          order: 2,
          columnSpan: 2,
        },
      ],
    });

    const resolved = platform.engine.resolveDashboard({
      dashboardId: "demo-exec",
      userPermissions: [],
      breakpoint: "desktop",
    });
    expect(resolved.widgets).toHaveLength(2);
    expect(resolved.columns).toBe(3);

    const mobile = platform.engine.resolveDashboard({
      dashboardId: "demo-exec",
      userPermissions: [],
      breakpoint: "mobile",
    });
    expect(mobile.columns).toBe(1);
  });

  it("saves layouts and pinned views", async () => {
    const events: string[] = [];
    const platform = createPlatformDashboard({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    platform.dashboards.register({
      dashboardId: "demo-qa",
      productId: "demo",
      name: "Demo QA",
      description: "Demo",
      audience: "qa",
      requiredPermissions: [],
      lifecycle: "published",
      widgets: [{ instanceId: "a", widgetId: "platform.status_card", order: 1 }],
    });

    const layout = await platform.engine.saveLayout({
      tenantId: "t1",
      userId: "u1",
      dashboardId: "demo-qa",
      name: "My layout",
      columns: 2,
      widgetOrder: ["a"],
      correlationId: "c1",
    });
    expect(layout.layoutId).toBeTruthy();
    expect(events).toContain(DASHBOARD_EVENT_TYPES.layoutSaved);

    const view = await platform.engine.saveView({
      tenantId: "t1",
      userId: "u1",
      dashboardId: "demo-qa",
      name: "Pinned QA",
      pinned: true,
      favourite: true,
      layoutId: layout.layoutId,
      correlationId: "c2",
    });
    expect(platform.engine.listPinned("t1", "u1")).toHaveLength(1);
    expect(platform.engine.listFavourites("t1", "u1")).toHaveLength(1);
    expect(view.pinned).toBe(true);
  });

  it("selects dashboards by role presets", () => {
    const platform = createPlatformDashboard();
    platform.dashboards.register({
      dashboardId: "exec",
      productId: "demo",
      name: "Exec",
      description: "",
      audience: "executive",
      requiredPermissions: [],
      lifecycle: "published",
      defaultForRoles: ["executive"],
      widgets: [],
    });
    platform.dashboards.register({
      dashboardId: "ops",
      productId: "demo",
      name: "Ops",
      description: "",
      audience: "operations",
      requiredPermissions: [],
      lifecycle: "published",
      defaultForRoles: ["operations"],
      widgets: [],
    });

    const selected = platform.engine.selectForRoles(["executive"]);
    expect(selected.map((d) => d.dashboardId)).toEqual(["exec"]);
  });
});
