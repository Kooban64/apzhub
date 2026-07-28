import type { AnalyticsRequestContext } from "@apzhub/analytics-contracts";
import {
  asAnalyticsDashboardId,
  asAnalyticsDatasetId,
  asSavedDashboardId,
} from "@apzhub/analytics-contracts";
import {
  createMetabaseAdapter,
  createMockMetabaseFetch,
  DEFAULT_TEST_METABASE_CONFIG,
  disposeMetabaseAdapter,
} from "@apzhub/integration-metabase";
import { describe, expect, it } from "vitest";

import { createPlatformServices } from "../create-platform-services";
import {
  createAnalyticsPlatformServicesForTest,
  createAnalyticsPlatformServicesWithMetabase,
} from "./create-analytics-platform-services";
import { aggregateAnalyticsReadiness } from "./analytics-service-impls";
import { createMockAnalyticsOpsProvider } from "./metabase-ops-provider";

const TENANT = "tenant_analytics_test";

function ctx(
  permissions: readonly string[] = ["analytics.*"],
): AnalyticsRequestContext {
  return {
    tenantId: TENANT,
    userId: "user_analytics_test",
    correlationId: "corr_analytics_svc",
    permissions,
  };
}

describe("Analytics Platform Services (APZHUB-PLATFORM-ANALYTICS-004)", () => {
  it("lists catalogue, datasets, reports, and saved dashboards (mock)", async () => {
    const bundle = createAnalyticsPlatformServicesForTest({ tenantId: TENANT });
    const gateway = bundle.gatewaySurface;

    const catalogue = await gateway.dashboards.listCatalogue(ctx());
    expect(catalogue.items.length).toBeGreaterThan(0);
    expect(catalogue.items[0]?.provider.providerId).toBe("metabase");
    expect(JSON.stringify(catalogue)).not.toMatch(/X-Api-Key|session\/properties/i);

    const dashboard = await gateway.dashboards.getDashboard(
      ctx(),
      catalogue.items[0]!.id,
    );
    expect(dashboard.title).toBe("Executive Overview");

    const datasets = await gateway.datasets.listDatasets(ctx());
    expect(datasets[0]?.key).toBe("projects.throughput");

    const reports = await gateway.reports.listReportLinks(ctx());
    expect(reports[0]?.reportingSorRef).toMatch(/^reporting:/);

    const saved = await gateway.savedDashboards.listSaved(ctx());
    expect(saved[0]?.name).toBe("My Executive");

    const health = await gateway.analytics.getHealth(ctx());
    expect(health.status).toBe("healthy");
    expect(bundle.readiness.opsMode).toBe("mock");

    const readiness = await gateway.analytics.getReadiness(ctx());
    expect(readiness.readiness).toBe("ready_with_limitations");
    expect(readiness.providerId).toBe("mock");

    const categories = await gateway.dashboards.listCategories(ctx());
    expect(categories[0]?.key).toBe("executive");
  });

  it("enforces permissions for view / manage / admin operations", async () => {
    const gateway = createAnalyticsPlatformServicesForTest({
      tenantId: TENANT,
    }).gatewaySurface;

    await expect(
      gateway.dashboards.listCatalogue(ctx(["time.view"])),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });

    await expect(
      gateway.datasets.listDatasets(ctx(["analytics.dashboard.view"])),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });

    await expect(
      gateway.permissions.assertCanViewKpi(ctx(["analytics.view"])),
    ).resolves.toBeUndefined();

    await expect(
      gateway.savedDashboards.listSaved(ctx(["analytics.view"])),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });

    await expect(
      gateway.dashboards.publish(ctx(["analytics.manage"]), {
        dashboardId: asAnalyticsDashboardId("dash_exec_overview"),
      }),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });

  it("opens dashboard and optionally issues embed session metadata", async () => {
    const gateway = createAnalyticsPlatformServicesForTest({
      tenantId: TENANT,
    }).gatewaySurface;

    const opened = await gateway.analytics.openDashboard(ctx(), {
      dashboardId: asAnalyticsDashboardId("dash_exec_overview"),
      issueEmbed: true,
    });
    expect(opened.dashboard.id).toBe("dash_exec_overview");
    expect(opened.embedding?.tokenRef).toMatch(/^token_ref_/);
    expect(opened.embedding?.tokenRef).not.toMatch(/secret|api.key/i);
  });

  it("saves and archives saved dashboards", async () => {
    const gateway = createAnalyticsPlatformServicesForTest({
      tenantId: TENANT,
    }).gatewaySurface;

    const saved = await gateway.savedDashboards.save(ctx(), {
      saved: {
        id: asSavedDashboardId("saved_new"),
        tenantId: TENANT,
        ownerPrincipalId: "user_analytics_test",
        dashboardId: asAnalyticsDashboardId("dash_exec_overview"),
        name: "Scratch",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "user_analytics_test",
        updatedBy: "user_analytics_test",
        revision: 1,
      },
    });
    expect(saved.name).toBe("Scratch");

    const archived = await gateway.savedDashboards.archive(ctx(), saved.id);
    expect(archived.status).toBe("archived");
  });

  it("aggregates readiness and capabilities from ops provider", async () => {
    const ops = createMockAnalyticsOpsProvider();
    const result = await aggregateAnalyticsReadiness(ops, ctx());
    expect(result.providerId).toBe("mock");
    expect(result.readiness).toBe("ready_with_limitations");
    expect(result.capabilities.some((c) => c.key === "health")).toBe(true);
  });

  it("integrates Metabase mock adapter for health and capabilities", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TENANT,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "test-metabase-key",
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });
    await adapter.connect({
      tenantId: TENANT,
      correlationId: "corr_metabase_analytics",
    });

    const bundle = createAnalyticsPlatformServicesWithMetabase(adapter, {
      tenantId: TENANT,
    });
    expect(bundle.readiness.opsMode).toBe("metabase");
    expect(bundle.readiness.providerId).toBe("metabase");

    const health = await bundle.gatewaySurface.analytics.getHealth(ctx());
    expect(health.status === "healthy" || health.status === "degraded").toBe(true);
    expect(health.providerStatuses[0]?.providerId).toBe("metabase");

    const caps = await bundle.gatewaySurface.capabilities.listCapabilities(ctx());
    expect(caps.length).toBeGreaterThan(0);
    expect(JSON.stringify(caps)).not.toMatch(/X-Api-Key|metabase\.example/i);

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("wires into createPlatformServices gateway.analytics", async () => {
    const analytics = createAnalyticsPlatformServicesForTest({ tenantId: TENANT });
    const services = createPlatformServices({
      analytics,
      authorizationMode: "allow-all",
    });

    const catalogue = await services.gateway.analytics.dashboards.listCatalogue(ctx());
    expect(catalogue.items.length).toBeGreaterThan(0);

    const dataset = await services.gateway.analytics.datasets.getDataset(
      ctx(),
      asAnalyticsDatasetId("ds_projects_throughput"),
    );
    expect(dataset.name).toBe("Projects Throughput");
  });
});
