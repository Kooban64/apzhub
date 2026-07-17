/**
 * APZOBSERVE-003 — typed client / accessor coverage.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

import {
  clearObserveQueries,
  createHttpObserveClient,
  createMockObserveClient,
  getObserveCapabilities,
  getObserveClient,
  getObserveHealth,
  getObserveReadiness,
  listHealthChecks,
  ObserveClientError,
  observeQueryKeys,
  resetObserveClient,
  setObserveClient,
  toObserveUserMessage,
} from "./index";

describe("APZOBSERVE-003 observe client coverage", () => {
  afterEach(() => {
    resetObserveClient();
    vi.unstubAllGlobals();
  });

  it("covers mock facets, diagnostics, and accessors", async () => {
    const client = createMockObserveClient();
    setObserveClient(client);

    expect((await listHealthChecks()).items[0]?.id).toBe("hc_mock_1");
    expect((await getObserveCapabilities()).providerExecutionEnabled).toBe(false);
    expect((await getObserveHealth()).status).toBe("healthy");
    expect((await getObserveReadiness()).ready).toBe(true);

    for (const facet of [
      "readinessChecks",
      "livenessChecks",
      "serviceHealth",
      "serviceStatus",
      "componentStatus",
      "metricDefinitions",
      "metricSamples",
      "alertDefinitions",
      "alertStates",
      "dashboardDefinitions",
      "logSources",
      "traceDefinitions",
      "traceSpans",
      "incidentReferences",
      "maintenanceWindows",
      "healthSummaries",
      "metadata",
    ] as const) {
      expect((await client[facet].list()).items.length).toBe(1);
      expect((await client[facet].get("x")).id).toBeTruthy();
      expect((await client[facet].create({ name: "n" })).revision).toBe(1);
      expect((await client[facet].update("x", { name: "n2" })).revision).toBe(2);
    }

    expect((await client.diagnostics.list()).items[0]?.id).toBe("pd_mock_1");
    expect((await client.diagnostics.get("pd_mock_1")).id).toBe("pd_mock_1");
    expect((await client.diagnostics.create({ key: "k" })).id).toBe("pd_new");
    expect((await client.diagnostics.update("pd_new", { name: "n" })).revision).toBe(2);
    expect((await client.diagnostics.health()).providerExecutionEnabled).toBe(false);
    expect((await client.diagnostics.readiness()).ready).toBe(true);
    expect((await client.diagnostics.capabilities()).workbenchReady).toBe(false);
    expect((await client.diagnostics.management()).observeEnabled).toBe(true);

    expect(getObserveClient()).toBe(client);
  });

  it("covers HTTP diagnostics paths and error helpers", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        if (url.includes("/diagnostics/health") || /\/observe\/health$/.test(url)) {
          return new Response(
            JSON.stringify({
              data: {
                status: "healthy",
                persistenceMode: "memory",
                providerExecutionEnabled: false,
                checkedAt: "2026-07-17T00:00:00.000Z",
              },
            }),
            { status: 200 },
          );
        }
        if (
          url.includes("/diagnostics/readiness") ||
          /\/observe\/readiness$/.test(url)
        ) {
          return new Response(
            JSON.stringify({
              data: {
                ready: true,
                observeEnabled: true,
                persistenceMode: "memory",
                providerExecutionEnabled: false,
                capabilities: ["healthChecks"],
              },
            }),
            { status: 200 },
          );
        }
        if (
          url.includes("/management-diagnostics") ||
          url.includes("/capabilities")
        ) {
          return new Response(
            JSON.stringify({
              data: {
                observeEnabled: true,
                managementPlaneReady: true,
                persistenceReady: true,
                providerExecutionEnabled: false,
                workbenchReady: false,
              },
            }),
            { status: 200 },
          );
        }
        if (url.includes("/diagnostics") && method === "POST") {
          return new Response(
            JSON.stringify({ data: { id: "pd_new", name: "n" } }),
            { status: 200 },
          );
        }
        if (url.includes("/diagnostics/") && method === "PATCH") {
          return new Response(
            JSON.stringify({ data: { id: "pd_1", name: "n2", revision: 2 } }),
            { status: 200 },
          );
        }
        if (url.includes("/diagnostics/") && method === "GET") {
          return new Response(
            JSON.stringify({ data: { id: "pd_1", name: "d" } }),
            { status: 200 },
          );
        }
        if (url.includes("/diagnostics")) {
          return new Response(
            JSON.stringify({
              data: [{ id: "pd_1" }],
              page: { limit: 1, hasMore: false },
            }),
            { status: 200 },
          );
        }
        if (url.includes("/health-checks")) {
          if (method === "GET" && !url.includes("/health-checks/")) {
            return new Response(
              JSON.stringify({
                data: [{ id: "hc_1" }],
                page: { limit: 1, hasMore: false },
              }),
              { status: 200 },
            );
          }
        }
        return new Response(
          JSON.stringify({
            error: { message: "boom", code: "X" },
            meta: { correlationId: "c", requestId: "r" },
          }),
          { status: 500 },
        );
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpObserveClient();

    expect((await client.diagnostics.health()).status).toBe("healthy");
    expect((await client.diagnostics.readiness()).ready).toBe(true);
    expect((await client.diagnostics.capabilities()).observeEnabled).toBe(true);
    expect((await client.diagnostics.management()).managementPlaneReady).toBe(
      true,
    );
    expect((await client.diagnostics.list()).items[0]?.id).toBe("pd_1");
    expect((await client.diagnostics.get("pd_1")).id).toBe("pd_1");
    expect((await client.diagnostics.create({ key: "k", name: "n" })).id).toBe(
      "pd_new",
    );
    expect(
      (await client.diagnostics.update("pd_1", { name: "n2" })).revision,
    ).toBe(2);
    expect((await client.getHealth()).status).toBe("healthy");
    expect((await client.getReadiness()).ready).toBe(true);
    expect((await client.getCapabilities()).observeEnabled).toBe(true);
    expect((await client.healthChecks.list({ limit: 1 })).items[0]?.id).toBe(
      "hc_1",
    );

    await expect(client.healthChecks.get("x")).rejects.toBeInstanceOf(
      ObserveClientError,
    );

    expect(toObserveUserMessage(new ObserveClientError({ message: "m" }))).toBe(
      "m",
    );
    expect(toObserveUserMessage(new Error("e"))).toBe("e");
    expect(toObserveUserMessage("x")).toBe("Observability request failed");

    const qc = new QueryClient();
    clearObserveQueries(qc);
    for (const facet of [
      "healthChecks",
      "readinessChecks",
      "livenessChecks",
      "serviceHealth",
      "serviceStatus",
      "componentStatus",
      "metricDefinitions",
      "metricSamples",
      "alertDefinitions",
      "alertStates",
      "dashboardDefinitions",
      "logSources",
      "traceDefinitions",
      "traceSpans",
      "incidentReferences",
      "maintenanceWindows",
      "healthSummaries",
      "metadata",
    ] as const) {
      expect(observeQueryKeys[facet].all[0]).toBe("observe");
      expect(observeQueryKeys[facet].list()[2]).toBe("list");
      expect(observeQueryKeys[facet].detail("id_1")[3]).toBe("id_1");
    }
    expect(observeQueryKeys.diagnostics.all[1]).toBe("diagnostics");
    expect(observeQueryKeys.diagnostics.list()[2]).toBe("list");
    expect(observeQueryKeys.diagnostics.detail("pd_1")[3]).toBe("pd_1");
    expect(observeQueryKeys.diagnostics.health()[2]).toBe("health");
    expect(observeQueryKeys.diagnostics.readiness()[2]).toBe("readiness");
    expect(observeQueryKeys.diagnostics.capabilities()[2]).toBe("capabilities");
    expect(observeQueryKeys.diagnostics.management()[1]).toBe(
      "management-diagnostics",
    );
    expect(observeQueryKeys.health()[1]).toBe("health");
    expect(observeQueryKeys.readiness()[1]).toBe("readiness");
    expect(observeQueryKeys.capabilities()[1]).toBe("capabilities");
  });
});
