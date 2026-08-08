/**
 * QX-PR-04 — Dashboard LayoutStore Postgres durability evidence.
 * Proves: migration-backed tables · write · restart hydrate · tenant isolation.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkDatabaseHealth, createDb } from "@apzhub/config";
import {
  createPostgresLayoutStore,
  deleteDashboardDataForTenant,
} from "@apzhub/qep-dashboards";
import type { DashboardLayout, SavedDashboardView } from "@apzhub/platform-dashboard";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const stamp = Date.now().toString(36);
const tenantA = `t-qxpr04-a-${stamp}`;
const tenantB = `t-qxpr04-b-${stamp}`;
const layoutIdA = `layout-qxpr04-a-${stamp}`;
const layoutIdB = `layout-qxpr04-b-${stamp}`;
const viewIdA = `view-qxpr04-a-${stamp}`;
const viewIdB = `view-qxpr04-b-${stamp}`;

function layout(layoutId: string, tenantId: string): DashboardLayout {
  const now = new Date().toISOString();
  return {
    layoutId,
    tenantId,
    userId: "qx-pr-04-verifier",
    dashboardId: "qep-executive",
    name: "QX-PR-04 layout",
    columns: 3,
    widgetOrder: ["w1", "w2"],
    updatedAt: now,
  };
}

function view(viewId: string, tenantId: string): SavedDashboardView {
  const now = new Date().toISOString();
  return {
    viewId,
    tenantId,
    userId: "qx-pr-04-verifier",
    dashboardId: "qep-executive",
    name: "QX-PR-04 view",
    pinned: true,
    favourite: false,
    createdAt: now,
    updatedAt: now,
  };
}

describe.skipIf(!hasDb)("QX-PR-04 Dashboard Postgres durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL unhealthy: ${health.message ?? "unknown"}`);
    }
  });

  afterAll(async () => {
    const db = createDb();
    await deleteDashboardDataForTenant(tenantA, db);
    await deleteDashboardDataForTenant(tenantB, db);
  });

  it("survives client recreation (simulated restart) and isolates tenants", async () => {
    const writer = createPostgresLayoutStore(createDb());
    await writer.saveLayout(layout(layoutIdA, tenantA));
    await writer.saveLayout(layout(layoutIdB, tenantB));
    await writer.saveView(view(viewIdA, tenantA));
    await writer.saveView(view(viewIdB, tenantB));

    const reader = createPostgresLayoutStore(createDb(process.env.DATABASE_URL));
    const hydratedLayout = await reader.getLayout(layoutIdA);
    expect(hydratedLayout).toBeDefined();
    expect(hydratedLayout?.layoutId).toBe(layoutIdA);
    expect(hydratedLayout?.tenantId).toBe(tenantA);
    expect(hydratedLayout?.widgetOrder).toEqual(["w1", "w2"]);

    const hydratedView = await reader.getView(viewIdA);
    expect(hydratedView).toBeDefined();
    expect(hydratedView?.viewId).toBe(viewIdA);
    expect(hydratedView?.tenantId).toBe(tenantA);
    expect(hydratedView?.pinned).toBe(true);

    const listedLayoutsA = await reader.listLayouts(tenantA);
    expect(listedLayoutsA.every((row) => row.tenantId === tenantA)).toBe(true);
    expect(listedLayoutsA.some((row) => row.layoutId === layoutIdA)).toBe(true);
    expect(listedLayoutsA.some((row) => row.layoutId === layoutIdB)).toBe(false);

    const listedViewsA = await reader.listViews(tenantA);
    expect(listedViewsA.some((row) => row.viewId === viewIdA)).toBe(true);
    expect(listedViewsA.some((row) => row.viewId === viewIdB)).toBe(false);

    const pinnedA = await reader.listPinned(tenantA, "qx-pr-04-verifier");
    expect(pinnedA.some((row) => row.viewId === viewIdA)).toBe(true);
    expect(pinnedA.some((row) => row.viewId === viewIdB)).toBe(false);
  });
});
