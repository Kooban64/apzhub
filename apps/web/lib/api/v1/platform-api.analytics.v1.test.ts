/**
 * Canonical Analytics HTTP API tests (APZHUB-PLATFORM-ANALYTICS-005).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  createAnalyticsPlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import { PlatformApiHttpError } from "./errors";
import {
  assertAnalyticsHttpEnabled,
  handleCreateAnalyticsSaved,
  handleDeleteAnalyticsSaved,
  handleGetAnalyticsCapabilities,
  handleGetAnalyticsDashboard,
  handleGetAnalyticsHealth,
  handleGetAnalyticsReadiness,
  handleListAnalyticsCategories,
  handleListAnalyticsDashboards,
  handleListAnalyticsDatasets,
  handleListAnalyticsReports,
  handleListAnalyticsSaved,
  handleUpdateAnalyticsSaved,
} from "./handlers/analytics";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "./gateway/bootstrap";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import {
  createAnalyticsSavedBodySchema,
  updateAnalyticsSavedBodySchema,
} from "./schemas/analytics";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  API_TEST_TENANT_A,
} from "./testing/fixtures";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-analytics",
      correlationId: "corr-test-analytics",
      timestamp: "2026-07-19T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      tenantId: API_TEST_TENANT_A,
      correlationId: "corr-test-analytics",
    }),
  };
}

function installAnalyticsGateway() {
  const analytics = createAnalyticsPlatformServicesForTest({
    tenantId: API_TEST_TENANT_A,
  });
  const { gateway } = createPlatformServices({
    analytics,
    authorizationMode: "allow-all",
  });
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, {
      analyticsEnabled: true,
      analyticsReadiness: analytics.readiness,
      authorizationMode: "allow-all",
    }),
  );
  return gateway;
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZHUB-PLATFORM-ANALYTICS-005 Analytics HTTP API", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when Analytics HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        analyticsEnabled: false,
      }),
    );
    await expect(assertAnalyticsHttpEnabled()).rejects.toBeInstanceOf(
      PlatformApiHttpError,
    );
    await expect(assertAnalyticsHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "ANALYTICS_SERVICE_UNAVAILABLE" },
    });
  });

  it("exposes health, readiness, and capabilities", async () => {
    installAnalyticsGateway();
    const ctx = makeContext();

    const health = await handleGetAnalyticsHealth(
      makeRequest("/api/v1/analytics/health"),
      ctx,
    );
    expect(health.status).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.data.status).toBe("healthy");
    expect(healthBody.meta.correlationId).toBe("corr-test-analytics");

    const readiness = await handleGetAnalyticsReadiness(
      makeRequest("/api/v1/analytics/readiness"),
      ctx,
    );
    expect(readiness.status).toBe(200);
    const readinessBody = await readiness.json();
    expect(readinessBody.data.readiness).toBeTruthy();

    const caps = await handleGetAnalyticsCapabilities(
      makeRequest("/api/v1/analytics/capabilities"),
      ctx,
    );
    expect(caps.status).toBe(200);
    const capsBody = await caps.json();
    expect(capsBody.data.analyticsEnabled).toBe(true);
    expect(capsBody.data.workbenchReady).toBe(true);
    expect(capsBody.data.productReady).toBe(true);
    expect(capsBody.data.httpApiVersion).toBe("1.0.0");
  });

  it("lists dashboards, categories, datasets, and reports", async () => {
    installAnalyticsGateway();
    const ctx = makeContext();

    const dashboards = await handleListAnalyticsDashboards(
      makeRequest("/api/v1/analytics/dashboards"),
      ctx,
    );
    expect(dashboards.status).toBe(200);
    const dashboardsBody = await dashboards.json();
    expect(dashboardsBody.data.length).toBeGreaterThan(0);
    expect(JSON.stringify(dashboardsBody)).not.toMatch(
      /X-Api-Key|session\/properties/i,
    );

    const dashboardId = dashboardsBody.data[0].id as string;
    const one = await handleGetAnalyticsDashboard(
      makeRequest(`/api/v1/analytics/dashboards/${dashboardId}`),
      ctx,
      { params: Promise.resolve({ dashboardId }) },
    );
    expect(one.status).toBe(200);

    const categories = await handleListAnalyticsCategories(
      makeRequest("/api/v1/analytics/categories"),
      ctx,
    );
    expect(categories.status).toBe(200);

    const datasets = await handleListAnalyticsDatasets(
      makeRequest("/api/v1/analytics/datasets"),
      ctx,
    );
    expect(datasets.status).toBe(200);

    const reports = await handleListAnalyticsReports(
      makeRequest("/api/v1/analytics/reports"),
      ctx,
    );
    expect(reports.status).toBe(200);
  });

  it("supports saved dashboard create, patch, and archive (DELETE)", async () => {
    installAnalyticsGateway();
    const ctx = makeContext();

    const listed = await handleListAnalyticsSaved(
      makeRequest("/api/v1/analytics/saved"),
      ctx,
    );
    expect(listed.status).toBe(200);

    const created = await handleCreateAnalyticsSaved(
      makeRequest("/api/v1/analytics/saved", {
        method: "POST",
        body: JSON.stringify({
          dashboardId: "dash_exec_overview",
          name: "HTTP Saved",
          status: "draft",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    const createdBody = await created.json();
    const savedId = createdBody.data.id as string;
    expect(savedId).toMatch(/^saved_/);

    const patched = await handleUpdateAnalyticsSaved(
      makeRequest(`/api/v1/analytics/saved/${savedId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: "HTTP Saved Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ savedId }) },
    );
    expect(patched.status).toBe(200);
    const patchedBody = await patched.json();
    expect(patchedBody.data.name).toBe("HTTP Saved Updated");

    const archived = await handleDeleteAnalyticsSaved(
      makeRequest(`/api/v1/analytics/saved/${savedId}`, { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ savedId }) },
    );
    expect(archived.status).toBe(200);
    const archivedBody = await archived.json();
    expect(archivedBody.data.status).toBe("archived");
  });

  it("denies catalogue access when authorization provider denies", async () => {
    const analytics = createAnalyticsPlatformServicesForTest({
      tenantId: API_TEST_TENANT_A,
    });
    const { gateway } = createPlatformServices({
      analytics,
      authorizationMode: "production",
      authorization: {
        authorize: async () => ({
          effect: "deny" as const,
          reason: "test-deny",
        }),
      },
    });
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, {
        analyticsEnabled: true,
        analyticsReadiness: analytics.readiness,
        authorizationMode: "production",
      }),
    );
    const ctx = makeContext();
    await expect(
      handleListAnalyticsDashboards(makeRequest("/api/v1/analytics/dashboards"), ctx),
    ).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });

  it("validates saved bodies", () => {
    expect(
      createAnalyticsSavedBodySchema.safeParse({
        dashboardId: "dash_exec_overview",
        name: "Ok",
      }).success,
    ).toBe(true);
    expect(
      createAnalyticsSavedBodySchema.safeParse({ name: "missing dashboard" }).success,
    ).toBe(false);
    expect(updateAnalyticsSavedBodySchema.safeParse({}).success).toBe(false);
    expect(updateAnalyticsSavedBodySchema.safeParse({ name: "Renamed" }).success).toBe(
      true,
    );
  });

  it("registers Analytics routes with withPlatformApiAuth and OpenAPI paths", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/analytics"));
    expect(routes.length).toBe(10);
    for (const route of routes) {
      const content = readFileSync(route, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).not.toMatch(/@apzhub\/integration-metabase/);
    }

    const handler = readFileSync(
      join(process.cwd(), "apps/web/lib/api/v1/handlers/analytics.ts"),
      "utf8",
    );
    expect(handler).not.toMatch(/@apzhub\/integration-metabase/);

    const spec = loadPlatformOpenApiSpecObject() as {
      openapi: string;
      info: { version: string };
      paths: Record<string, unknown>;
    };
    expect(spec.openapi.startsWith("3.1")).toBe(true);
    expect(spec.info.version).toBe("1.14.0");
    expect(spec.paths["/analytics/health"]).toBeTruthy();
    expect(spec.paths["/analytics/readiness"]).toBeTruthy();
    expect(spec.paths["/analytics/capabilities"]).toBeTruthy();
    expect(spec.paths["/analytics/dashboards"]).toBeTruthy();
    expect(spec.paths["/analytics/dashboards/{dashboardId}"]).toBeTruthy();
    expect(spec.paths["/analytics/categories"]).toBeTruthy();
    expect(spec.paths["/analytics/datasets"]).toBeTruthy();
    expect(spec.paths["/analytics/reports"]).toBeTruthy();
    expect(spec.paths["/analytics/saved"]).toBeTruthy();
    expect(spec.paths["/analytics/saved/{savedId}"]).toBeTruthy();
  });
});
