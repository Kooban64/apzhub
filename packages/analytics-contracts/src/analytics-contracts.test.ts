import { describe, expect, it, expectTypeOf } from "vitest";

import type {
  AnalyticsPlatformGateway,
  AnalyticsService,
  CapabilityService,
  DashboardService,
  DatasetService,
  PermissionService,
  ReportService,
  SavedDashboardService,
} from "./index";
import {
  ANALYTICS_CONTRACTS_VERSION,
  ANALYTICS_PERMISSION_OPERATIONS,
  EXAMPLE_ANALYTICS_DASHBOARD,
  EXAMPLE_ANALYTICS_CONTEXT,
  EXAMPLE_CAPABILITY,
  EXAMPLE_DATASET,
  EXAMPLE_HEALTH,
  EXAMPLE_SAVED_DASHBOARD,
  PLATFORM_ANALYTICS_PERMISSIONS,
  asAnalyticsDashboardId,
  hasAnalyticsNamedOperation,
  hasAnalyticsPermission,
  isAnalyticsLifecycleStatus,
  isPlatformAnalyticsIdShape,
  isPlatformAnalyticsPermission,
} from "./index";

describe("@apzhub/analytics-contracts", () => {
  it("exports package version 0.1.1", () => {
    expect(ANALYTICS_CONTRACTS_VERSION).toBe("0.1.1");
  });

  it("brands identifiers and rejects invalid shapes", () => {
    expect(isPlatformAnalyticsIdShape("dash_1")).toBe(true);
    expect(asAnalyticsDashboardId("dash_1")).toBe("dash_1");
    expect(() => asAnalyticsDashboardId("")).toThrow(/Invalid platform analytics/);
  });

  it("enumerates Owner permission operations", () => {
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.*");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.dashboard.view");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.dataset.view");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.kpi.view");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.report.run");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.saved.manage");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.dashboard.share");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.dashboard.embed");
    expect(PLATFORM_ANALYTICS_PERMISSIONS).toContain("analytics.admin");
    expect(isPlatformAnalyticsPermission("analytics.view")).toBe(true);

    expect(ANALYTICS_PERMISSION_OPERATIONS.viewDashboard).toBe(
      "analytics.dashboard.view",
    );
    expect(ANALYTICS_PERMISSION_OPERATIONS.administerAnalytics).toBe("analytics.admin");
  });

  it("evaluates permission helpers with wildcards and aggregates", () => {
    expect(hasAnalyticsPermission(["analytics.*"], "dashboard.embed")).toBe(true);
    expect(hasAnalyticsPermission(["analytics.view"], "dashboard.view")).toBe(true);
    expect(hasAnalyticsPermission(["analytics.manage"], "saved.manage")).toBe(true);
    expect(hasAnalyticsPermission(["analytics.dashboard.view"], "manage")).toBe(false);
    expect(hasAnalyticsNamedOperation(["analytics.view"], "viewDashboard")).toBe(true);
    expect(hasAnalyticsNamedOperation(["analytics.admin"], "administerAnalytics")).toBe(
      true,
    );
  });

  it("guards lifecycle statuses", () => {
    expect(isAnalyticsLifecycleStatus("published")).toBe(true);
    expect(isAnalyticsLifecycleStatus("metabase")).toBe(false);
  });

  it("example shapes are provider-agnostic (no Metabase leakage)", () => {
    const blob = JSON.stringify({
      EXAMPLE_ANALYTICS_CONTEXT,
      EXAMPLE_ANALYTICS_DASHBOARD,
      EXAMPLE_DATASET,
      EXAMPLE_SAVED_DASHBOARD,
      EXAMPLE_HEALTH,
      EXAMPLE_CAPABILITY,
    });
    expect(blob.toLowerCase()).not.toMatch(/metabase|x-api-key|session\/properties/);
    expect(EXAMPLE_ANALYTICS_DASHBOARD.provider.providerId).toBe("analytics-provider");
    expect(EXAMPLE_DATASET.provider.providerRef).toMatch(/^prov_/);
  });

  it("exposes service interface types for composition", () => {
    expectTypeOf<AnalyticsService>().toHaveProperty("getHealth");
    expectTypeOf<AnalyticsService>().toHaveProperty("openDashboard");
    expectTypeOf<DashboardService>().toHaveProperty("listCatalogue");
    expectTypeOf<DatasetService>().toHaveProperty("listDatasets");
    expectTypeOf<ReportService>().toHaveProperty("resolveReportLink");
    expectTypeOf<SavedDashboardService>().toHaveProperty("listSaved");
    expectTypeOf<PermissionService>().toHaveProperty("assertCanViewDashboard");
    expectTypeOf<CapabilityService>().toHaveProperty("listCapabilities");
    expectTypeOf<AnalyticsPlatformGateway>().toHaveProperty("analytics");
    expectTypeOf<AnalyticsPlatformGateway>().toHaveProperty("permissions");
  });
});
