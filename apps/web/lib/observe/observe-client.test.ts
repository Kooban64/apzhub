/**
 * Platform Observability typed client tests (APZOBSERVE-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertObserveApiPath,
  OBSERVE_FORBIDDEN_HTTP_SEGMENTS,
  createHttpObserveClient,
  createMockObserveClient,
  ObserveClientError,
  observeQueryKeys,
  getObserveClient,
  resetObserveClient,
  setObserveClient,
} from "./index";

describe("APZOBSERVE-003 observe typed client", () => {
  afterEach(() => {
    resetObserveClient();
    vi.unstubAllGlobals();
  });

  it("mock client covers core operations without provider methods", async () => {
    const client = createMockObserveClient();
    expect(await client.healthChecks.list()).toMatchObject({
      items: [{ id: "hc_mock_1" }],
    });
    expect(
      (
        await client.healthChecks.create({
          serviceKey: "api",
          name: "x",
          status: "healthy",
          providerKind: "internal",
        })
      ).id,
    ).toBe("hc_new");
    expect((await client.getCapabilities()).providerExecutionEnabled).toBe(false);
    expect((await client.diagnostics.health()).providerExecutionEnabled).toBe(false);
    expect(client).not.toHaveProperty("scrape");
    expect(client).not.toHaveProperty("queryPrometheus");
    expect(client).not.toHaveProperty("ingestLogs");
  });

  it("HTTP client builds routes, parses envelopes, and supports AbortSignal", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/capabilities")) {
        return new Response(
          JSON.stringify({
            data: {
              observeEnabled: true,
              managementPlaneReady: true,
              persistenceReady: true,
              providerExecutionEnabled: false,
              workbenchReady: false,
            },
            meta: { requestId: "r1", correlationId: "c1" },
          }),
          { status: 200 },
        );
      }
      if (init?.method === "POST" && url.endsWith("/api/v1/observe/health-checks")) {
        return new Response(
          JSON.stringify({
            data: {
              id: "hc_1",
              tenantId: "tenant_a",
              serviceKey: "api",
              name: "API",
              status: "healthy",
              providerKind: "internal",
              createdAt: "2026-07-17T12:00:00.000Z",
              updatedAt: "2026-07-17T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
            meta: { requestId: "r2", correlationId: "c2" },
          }),
          { status: 200 },
        );
      }
      if (url.includes("/health-checks?") || url.endsWith("/health-checks")) {
        return new Response(
          JSON.stringify({
            data: [{ id: "hc_1", tenantId: "tenant_a", name: "API" }],
            page: { limit: 1, hasMore: false },
            meta: { requestId: "r3", correlationId: "c3" },
          }),
          { status: 200 },
        );
      }
      if (url.includes("/health-checks/hc_1") && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({
            data: { id: "hc_1", name: "Updated", revision: 2 },
            meta: {},
          }),
          { status: 200 },
        );
      }
      if (url.includes("/health-checks/hc_1")) {
        return new Response(
          JSON.stringify({
            data: { id: "hc_1", name: "API", revision: 1 },
            meta: {},
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          error: { code: "NOT_FOUND", message: "missing" },
          meta: { correlationId: "cerr" },
        }),
        { status: 404 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpObserveClient();
    const controller = new AbortController();
    expect(
      (await client.getCapabilities({ signal: controller.signal })).observeEnabled,
    ).toBe(true);
    expect((await client.healthChecks.list({ limit: 5 })).items[0]?.id).toBe("hc_1");
    expect(
      (
        await client.healthChecks.create({
          serviceKey: "api",
          name: "API",
          status: "healthy",
          providerKind: "internal",
        })
      ).id,
    ).toBe("hc_1");
    expect((await client.healthChecks.get("hc_1")).id).toBe("hc_1");
    expect(
      (await client.healthChecks.update("hc_1", { name: "Updated" })).revision,
    ).toBe(2);

    await expect(client.healthChecks.get("missing")).rejects.toBeInstanceOf(
      ObserveClientError,
    );
  });

  it("rejects non-observe API paths and forbidden segments", () => {
    expect(() => assertObserveApiPath("/api/v1/identity/users")).toThrow(
      /only call \/api\/v1\/observe/,
    );
    for (const segment of OBSERVE_FORBIDDEN_HTTP_SEGMENTS) {
      expect(() => assertObserveApiPath(`/api/v1/observe/${segment}`)).toThrow(
        /Forbidden observe HTTP segment/,
      );
    }
  });

  it("exposes canonical query keys for all facets", () => {
    expect(observeQueryKeys.all).toEqual(["observe"]);
    expect(observeQueryKeys.healthChecks.list()).toEqual([
      "observe",
      "health-checks",
      "list",
    ]);
    expect(observeQueryKeys.diagnostics.health()).toEqual([
      "observe",
      "diagnostics",
      "health",
    ]);
    expect(observeQueryKeys.metadata.detail("om_1")).toEqual([
      "observe",
      "metadata",
      "detail",
      "om_1",
    ]);
  });

  it("runtime accessor defaults to mock in test env", () => {
    resetObserveClient();
    expect(getObserveClient()).toBeTruthy();
    const mock = createMockObserveClient();
    setObserveClient(mock);
    expect(getObserveClient()).toBe(mock);
  });
});
