/**
 * Platform Metrics HTTP handler coverage (APZMETRICS-003).
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertMetricsHttpEnabled,
  buildMetricsManagementPlaneDto,
  handleCreateMetric,
  handleGetMetric,
  handleGetMetricsCapabilities,
  handleGetMetricsDiagnosticsHealth,
  handleGetMetricsHealth,
  handleGetMetricsReadiness,
  handleListMetrics,
  handleUpdateMetric,
} from "./metrics";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { PlatformApiHttpError } from "../errors";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-metrics",
      correlationId: "corr-test-metrics",
      timestamp: "2026-07-17T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZMETRICS-003 metrics handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when metrics HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        metricsEnabled: false,
      }),
    );
    await expect(assertMetricsHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "METRICS_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates metrics with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();

    const list = await handleListMetrics(
      makeRequest("/api/v1/metrics/metrics?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.meta.requestId).toBe("req-test-metrics");
    expect(listBody.page.limit).toBe(10);

    const created = await handleCreateMetric(
      makeRequest("/api/v1/metrics/metrics", {
        method: "POST",
        body: JSON.stringify({
          key: "latency",
          name: "Latency",
          status: "active",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(200);
    const createdBody = await created.json();
    expect(createdBody.data.id).toBeTruthy();

    const got = await handleGetMetric(
      makeRequest("/api/v1/metrics/metrics/metrics_1"),
      ctx,
      { params: Promise.resolve({ metricId: "metrics_1" }) },
    );
    expect(got.status).toBe(200);

    const updated = await handleUpdateMetric(
      makeRequest("/api/v1/metrics/metrics/metrics_1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Latency Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ metricId: "metrics_1" }) },
    );
    expect(updated.status).toBe(200);
  });

  it("exposes diagnostics health/readiness/capabilities metadata only", async () => {
    installMockGateway();
    const ctx = makeContext();
    const health = await handleGetMetricsDiagnosticsHealth(
      makeRequest("/api/v1/metrics/diagnostics/health"),
      ctx,
    );
    expect(health.status).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.data.formulaExecutionEnabled).toBe(false);
    expect(healthBody.data.kpiExecutionEnabled).toBe(false);

    const readiness = await handleGetMetricsReadiness(
      makeRequest("/api/v1/metrics/readiness"),
      ctx,
    );
    expect(readiness.status).toBe(200);

    const caps = await handleGetMetricsCapabilities(
      makeRequest("/api/v1/metrics/capabilities"),
      ctx,
    );
    expect(caps.status).toBe(200);
    const capsBody = await caps.json();
    expect(capsBody.data.formulaExecutionEnabled).toBe(false);
    expect(capsBody.data.workbenchReady).toBe(false);
  });

  it("builds management plane DTO without execution capabilities", () => {
    const dto = buildMetricsManagementPlaneDto({
      metricsEnabled: true,
      persistenceMode: "memory",
    });
    expect(dto.formulaExecutionEnabled).toBe(false);
    expect(dto.kpiExecutionEnabled).toBe(false);
    expect(dto.providerIntegrationEnabled).toBe(false);
    expect(dto.capabilities.formulaExecution).toBe(false);
  });

  it("registers metrics routes under App Router and OpenAPI tag", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/metrics"));
    expect(routes.length).toBeGreaterThanOrEqual(40);
    const spec = loadPlatformOpenApiSpecObject() as {
      info: { version: string };
      tags?: { name: string }[];
      paths: Record<string, unknown>;
    };
    expect(spec.info.version).toMatch(/^1\.(?:9|\d{2,})\./);
    expect(spec.tags?.some((t) => t.name === "Platform Metrics Administration")).toBe(
      true,
    );
    expect(spec.paths["/metrics/metrics"]).toBeTruthy();
    expect(spec.paths["/metrics/kpis"]).toBeTruthy();
    expect(spec.paths["/metrics/diagnostics/health"]).toBeTruthy();
  });

  it("throws PlatformApiHttpError type for unavailable service", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        metricsEnabled: false,
      }),
    );
    try {
      await assertMetricsHttpEnabled();
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect(handleGetMetricsHealth).toBeTypeOf("function");
    }
  });
});
