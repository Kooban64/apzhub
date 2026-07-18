/**
 * Typed Metrics client tests (APZMETRICS-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpMetricsClient } from "./metrics-client";
import { MetricsClientError, toMetricsUserMessage } from "./metrics-errors";
import { createMockMetricsClient } from "./mock-metrics-client";
import {
  getMetricsClient,
  listMetrics,
  resetMetricsClient,
  setMetricsClient,
} from "./metrics-api";
import { clearMetricsQueries, metricsQueryKeys } from "./query-keys";
import { QueryClient } from "@tanstack/react-query";

afterEach(() => {
  resetMetricsClient();
  vi.unstubAllGlobals();
});

describe("createHttpMetricsClient", () => {
  it("lists metrics via /api/v1/metrics only", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      expect(url.startsWith("/api/v1/metrics")).toBe(true);
      return new Response(
        JSON.stringify({
          data: [{ id: "m1", name: "Latency", status: "active" }],
          page: { limit: 1, hasMore: false },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpMetricsClient();
    const result = await client.metrics.list({ limit: 1 });
    expect(result.items[0]?.id).toBe("m1");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("maps error envelopes to MetricsClientError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { code: "METRICS_SERVICE_UNAVAILABLE", message: "disabled" },
              meta: { correlationId: "c1", requestId: "r1" },
            }),
            { status: 503, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const client = createHttpMetricsClient();
    await expect(client.getCapabilities()).rejects.toBeInstanceOf(MetricsClientError);
    try {
      await client.getCapabilities();
    } catch (error) {
      expect(toMetricsUserMessage(error)).toContain("not available");
    }
  });

  it("creates and updates via HTTP methods", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({ data: { id: "new", key: "k", status: "active" } }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (init?.method === "PATCH") {
          return new Response(
            JSON.stringify({ data: { id: "m1", name: "n2", status: "active" } }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (url.includes("/diagnostics/health") || url.endsWith("/health")) {
          return new Response(
            JSON.stringify({
              data: {
                status: "healthy",
                persistenceMode: "memory",
                formulaExecutionEnabled: false,
                kpiExecutionEnabled: false,
                providerIntegrationEnabled: false,
                checkedAt: "2026-07-17T00:00:00.000Z",
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({ data: { id: "m1", name: "n", status: "active" } }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );
    const client = createHttpMetricsClient();
    await expect(
      client.metrics.create({ key: "k", name: "n", status: "active" }),
    ).resolves.toMatchObject({
      id: "new",
    });
    await expect(client.metrics.update("m1", { name: "n2" })).resolves.toMatchObject({
      name: "n2",
    });
    await expect(client.metrics.get("m1")).resolves.toMatchObject({ id: "m1" });
    await expect(client.diagnostics.health()).resolves.toMatchObject({
      formulaExecutionEnabled: false,
    });
    await expect(client.getHealth()).resolves.toMatchObject({ status: "healthy" });
  });

  it("covers diagnostics readiness/capabilities/management aliases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("readiness")) {
          return new Response(
            JSON.stringify({
              data: {
                ready: true,
                metricsEnabled: true,
                persistenceMode: "memory",
                formulaExecutionEnabled: false,
                kpiExecutionEnabled: false,
                providerIntegrationEnabled: false,
                capabilities: ["metrics"],
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({
            data: {
              metricsEnabled: true,
              managementPlaneReady: true,
              persistenceReady: true,
              formulaExecutionEnabled: false,
              kpiExecutionEnabled: false,
              providerIntegrationEnabled: false,
              workbenchReady: false,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );
    const client = createHttpMetricsClient();
    await expect(client.diagnostics.readiness()).resolves.toMatchObject({
      ready: true,
    });
    await expect(client.diagnostics.capabilities()).resolves.toMatchObject({
      formulaExecutionEnabled: false,
    });
    await expect(client.diagnostics.management()).resolves.toMatchObject({
      workbenchReady: false,
    });
    await expect(client.getReadiness()).resolves.toMatchObject({ ready: true });
    await expect(client.getCapabilities()).resolves.toMatchObject({
      metricsEnabled: true,
    });
  });
});

describe("metrics accessors and query keys", () => {
  it("uses mock client in tests and exposes query keys", async () => {
    setMetricsClient(createMockMetricsClient());
    expect(getMetricsClient()).toBeTruthy();
    const listed = await listMetrics();
    expect(listed.items.length).toBe(1);
    expect(metricsQueryKeys.metrics.list()).toEqual(["metrics", "metrics", "list"]);
    expect(metricsQueryKeys.metrics.all).toEqual(["metrics", "metrics"]);
    expect(metricsQueryKeys.metrics.detail("m1")).toEqual([
      "metrics",
      "metrics",
      "detail",
      "m1",
    ]);
    expect(metricsQueryKeys.definitions.list()).toEqual([
      "metrics",
      "definitions",
      "list",
    ]);
    expect(metricsQueryKeys.definitions.detail("d1")).toEqual([
      "metrics",
      "definitions",
      "detail",
      "d1",
    ]);
    expect(metricsQueryKeys.versions.list()[2]).toBe("list");
    expect(metricsQueryKeys.categories.detail("c1")[3]).toBe("c1");
    expect(metricsQueryKeys.groups.list()[1]).toBe("groups");
    expect(metricsQueryKeys.dimensions.detail("x")[2]).toBe("detail");
    expect(metricsQueryKeys.labels.list()[1]).toBe("labels");
    expect(metricsQueryKeys.units.detail("u")[3]).toBe("u");
    expect(metricsQueryKeys.formulas.list()[1]).toBe("formulas");
    expect(metricsQueryKeys.aggregations.detail("a")[3]).toBe("a");
    expect(metricsQueryKeys.thresholds.list()[1]).toBe("thresholds");
    expect(metricsQueryKeys.owners.detail("o")[3]).toBe("o");
    expect(metricsQueryKeys.consumers.list()[1]).toBe("consumers");
    expect(metricsQueryKeys.retentionPolicies.detail("r")[3]).toBe("r");
    expect(metricsQueryKeys.classifications.list()[1]).toBe("classifications");
    expect(metricsQueryKeys.dependencies.detail("d")[3]).toBe("d");
    expect(metricsQueryKeys.kpis.detail("k1")).toEqual([
      "metrics",
      "kpis",
      "detail",
      "k1",
    ]);
    expect(metricsQueryKeys.kpiGroups.list()[1]).toBe("kpi-groups");
    expect(metricsQueryKeys.kpiTargets.detail("t")[3]).toBe("t");
    expect(metricsQueryKeys.relationships.list()[1]).toBe("relationships");
    expect(metricsQueryKeys.metadata.detail("m")[3]).toBe("m");
    expect(metricsQueryKeys.diagnostics.health()).toEqual([
      "metrics",
      "diagnostics",
      "health",
    ]);
    expect(metricsQueryKeys.diagnostics.readiness()[2]).toBe("readiness");
    expect(metricsQueryKeys.diagnostics.capabilities()[2]).toBe("capabilities");
    expect(metricsQueryKeys.diagnostics.management()[1]).toBe("management-diagnostics");
    expect(metricsQueryKeys.health()[1]).toBe("health");
    expect(metricsQueryKeys.readiness()[1]).toBe("readiness");
    expect(metricsQueryKeys.capabilities()[1]).toBe("capabilities");
    const qc = new QueryClient();
    clearMetricsQueries(qc);
  });
});

describe("index barrel", () => {
  it("re-exports public surface", async () => {
    const mod = await import("./index");
    expect(mod.METRICS_API_BASE).toBe("/api/v1/metrics");
    expect(mod.createHttpMetricsClient).toBeTypeOf("function");
    expect(mod.createMockMetricsClient).toBeTypeOf("function");
    expect(mod.metricsQueryKeys.all).toEqual(["metrics"]);
    expect(mod.toMetricsUserMessage(new Error("x"))).toBe("x");
    expect(mod.toMetricsUserMessage("plain")).toBe("Metrics request failed");
  });
});

describe("metrics client error paths", () => {
  it("maps collection error envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { code: "FORBIDDEN", message: "nope" },
              meta: { correlationId: "c", requestId: "r" },
            }),
            { status: 403, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const client = createHttpMetricsClient();
    await expect(client.metrics.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("toMetricsUserMessage falls back for Error and unknown", () => {
    expect(toMetricsUserMessage(new Error("boom"))).toBe("boom");
    expect(toMetricsUserMessage(123)).toBe("Metrics request failed");
  });
});
