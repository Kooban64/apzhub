/**
 * OSS-110-12 — Support Vertical performance baseline (mocked). Measurement only.
 * Timings reflect in-process mock overhead, not production Zammad latency.
 * All operations must complete within generous CI thresholds.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_TENANT_ID,
} from "@apzhub/integration-zammad";
import {
  createPlatformServicesWithZammad,
  InMemoryEntityMappingStore,
} from "@apzhub/platform-services";

import {
  handleListSupportRequests,
  handleGetSupportRequest,
  handleCreateSupportRequest,
  handleSupportSearch,
  handleSupportAnalytics,
  handleGetSupportHistory,
  handleListOrganizations,
  handleListGroups,
  handleListSupportUsers,
} from "../../apps/web/lib/api/v1/handlers/support";

import type { PlatformApiRequestContext } from "../../apps/web/lib/api/v1/auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../../apps/web/lib/api/v1/gateway/bootstrap";
import { buildMockSession } from "../../apps/web/lib/api/v1/testing/fixtures";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TENANT = TEST_TENANT_ID;
const USER = "user_support_perf_001";
const CORR = "corr-support-perf-001";

/** Maximum acceptable wall-clock ms for any mocked operation in CI. */
const GENEROUS_THRESHOLD_MS = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  url: string,
  init?: { method?: string; body?: string },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: { "content-type": "application/json" },
  });
}

function makeContext(tenantId = TENANT): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-perf-001",
      correlationId: CORR,
      timestamp: "2026-07-11T00:00:00.000Z",
    },
    session: buildMockSession({
      userId: USER,
      tenantId,
    }) as PlatformApiRequestContext["session"],
    serviceContext: {
      tenantId,
      userId: USER,
      correlationId: CORR,
      permissions: [
        "support.requests.list",
        "support.requests.read",
        "support.requests.create",
        "support.organizations.list",
        "support.groups.list",
        "support.users.list",
        "support.search.query",
        "support.history.list",
        "support.analytics.read",
        "support.articles.list",
      ],
      requestId: "req-perf-001",
    },
  };
}

async function timed(
  label: string,
  fn: () => Promise<unknown>,
): Promise<{ label: string; ms: number }> {
  const start = performance.now();
  await fn();
  return { label, ms: Number((performance.now() - start).toFixed(3)) };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("OSS-110-12 Support Vertical performance baseline (mocked)", () => {
  let adapter: Awaited<ReturnType<typeof createZammadAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createZammadAdapter>>["factory"];
  let mappingStore: InMemoryEntityMappingStore;

  // Cached IDs discovered in first HTTP list call
  let supportRequestId: string;
  let groupId: string;
  let requesterId: string;

  beforeEach(async () => {
    resetPlatformApiGatewayBootstrap();
    mappingStore = new InMemoryEntityMappingStore();

    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "support-perf-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;

    const bundle = createPlatformServicesWithZammad(adapter.core, mappingStore);
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(bundle.gateway, {
        zammadEnabled: true,
        providersRegistered: true,
        authorizationMode: "allow-all",
      }),
    );

    // Bootstrap IDs so individual benchmark tests don't pay extra setup cost.
    const ctx = makeContext();
    const listResp = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctx,
    );
    const listBody = await listResp.json();
    supportRequestId = listBody.data[0].id as string;
    groupId = listBody.data[0].groupId as string;
    requesterId = listBody.data[0].requesterId as string;
  });

  afterEach(async () => {
    resetPlatformApiGatewayBootstrap();
    if (adapter && factory) {
      await disposeZammadAdapter(adapter, factory);
    }
  });

  it("records baseline timings for HTTP-level support operations", async () => {
    const ctx = makeContext();
    const baselines: { label: string; ms: number }[] = [];

    // HTTP list support requests
    baselines.push(
      await timed("http.support.list", async () => {
        const resp = await handleListSupportRequests(
          makeRequest("/api/v1/support-requests"),
          ctx,
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP get support request
    baselines.push(
      await timed("http.support.get", async () => {
        const resp = await handleGetSupportRequest(
          makeRequest(`/api/v1/support-requests/${supportRequestId}`),
          ctx,
          { params: Promise.resolve({ supportRequestId }) },
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP create support request
    baselines.push(
      await timed("http.support.create", async () => {
        const resp = await handleCreateSupportRequest(
          makeRequest("/api/v1/support-requests", {
            method: "POST",
            body: JSON.stringify({
              title: "Perf baseline ticket",
              groupId,
              requesterId,
            }),
          }),
          ctx,
        );
        expect(resp.status).toBe(201);
      }),
    );

    // HTTP support search
    baselines.push(
      await timed("http.support.search", async () => {
        const resp = await handleSupportSearch(
          makeRequest("/api/v1/support-search?q=perf+baseline"),
          ctx,
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP support analytics
    baselines.push(
      await timed("http.support.analytics", async () => {
        const resp = await handleSupportAnalytics(
          makeRequest("/api/v1/support-analytics"),
          ctx,
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP support history
    baselines.push(
      await timed("http.support.history", async () => {
        const resp = await handleGetSupportHistory(
          makeRequest(`/api/v1/support-requests/${supportRequestId}/history`),
          ctx,
          { params: Promise.resolve({ supportRequestId }) },
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP list organizations
    baselines.push(
      await timed("http.support.organizations.list", async () => {
        const resp = await handleListOrganizations(
          makeRequest("/api/v1/support-organizations"),
          ctx,
        );
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP list groups
    baselines.push(
      await timed("http.support.groups.list", async () => {
        const resp = await handleListGroups(makeRequest("/api/v1/support-groups"), ctx);
        expect(resp.status).toBe(200);
      }),
    );

    // HTTP list users
    baselines.push(
      await timed("http.support.users.list", async () => {
        const resp = await handleListSupportUsers(
          makeRequest("/api/v1/support-users"),
          ctx,
        );
        expect(resp.status).toBe(200);
      }),
    );

    expect(baselines.length).toBeGreaterThanOrEqual(9);

    for (const row of baselines) {
      expect(row.ms).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(row.ms)).toBe(true);
      // Generous threshold — mocked operations should never hit 5 seconds
      expect(row.ms).toBeLessThan(GENEROUS_THRESHOLD_MS);
    }

    console.log(
      "SUPPORT_VERTICAL_HTTP_PERF_BASELINE",
      JSON.stringify({
        environment: "mocked-vitest",
        note: "Not production Zammad latency — in-process mock only",
        operations: baselines,
        count: baselines.length,
        min: Math.min(...baselines.map((b) => b.ms)),
        max: Math.max(...baselines.map((b) => b.ms)),
        average: Number(
          (baselines.reduce((sum, b) => sum + b.ms, 0) / baselines.length).toFixed(3),
        ),
      }),
    );
  });

  it("records baseline timings for gateway-level support operations", async () => {
    // Re-bootstrap with a fresh mapping store to isolate gateway timing
    const localStore = new InMemoryEntityMappingStore();
    const bundle = createPlatformServicesWithZammad(adapter.core, localStore);

    const serviceCtx = {
      tenantId: TENANT,
      userId: USER,
      correlationId: CORR,
      permissions: [
        "support.requests.list",
        "support.requests.read",
        "support.requests.create",
      ],
      requestId: "req-gateway-perf-001",
    };

    const ctx = { correlationId: CORR, tenantId: TENANT };
    const baselines: { label: string; ms: number }[] = [];

    baselines.push(
      await timed("gateway.support.listSupportRequests", async () => {
        await bundle.gateway.support.listSupportRequests(serviceCtx, {});
      }),
    );

    const items = (await bundle.gateway.support.listSupportRequests(serviceCtx, {}))
      .items;
    const pid = items[0]!.id;

    baselines.push(
      await timed("gateway.support.getSupportRequest", async () => {
        await bundle.gateway.support.getSupportRequest(serviceCtx, pid);
      }),
    );

    baselines.push(
      await timed("gateway.support.createSupportRequest", async () => {
        await bundle.gateway.support.createSupportRequest(serviceCtx, {
          title: "Gateway perf ticket",
          groupId: items[0]!.groupId!,
          requesterId: items[0]!.requesterId!,
        });
      }),
    );

    baselines.push(
      await timed("gateway.supportSearch.search", async () => {
        await bundle.gateway.supportSearch.search(serviceCtx, "perf query");
      }),
    );

    baselines.push(
      await timed("gateway.supportAnalytics.getSupportIntelligence", async () => {
        await bundle.gateway.supportAnalytics.getSupportIntelligence(serviceCtx);
      }),
    );

    baselines.push(
      await timed("gateway.supportHistory.getTimeline", async () => {
        await bundle.gateway.supportHistory.getTimeline(serviceCtx, pid);
      }),
    );

    // Adapter core (direct, no mapping layer)
    baselines.push(
      await timed("adapter.core.support.list", async () => {
        await adapter.core.support.list(ctx);
      }),
    );

    // Request pipeline via gateway (already wrapped, but explicit)
    baselines.push(
      await timed("requestPipeline.support.listSupportRequests", async () => {
        await bundle.gateway.support.listSupportRequests(serviceCtx, {});
      }),
    );

    expect(baselines.length).toBeGreaterThanOrEqual(8);

    for (const row of baselines) {
      expect(row.ms).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(row.ms)).toBe(true);
      expect(row.ms).toBeLessThan(GENEROUS_THRESHOLD_MS);
    }

    console.log(
      "SUPPORT_VERTICAL_GATEWAY_PERF_BASELINE",
      JSON.stringify({
        environment: "mocked-vitest",
        note: "Not production Zammad latency — in-process mock only",
        operations: baselines,
        count: baselines.length,
        min: Math.min(...baselines.map((b) => b.ms)),
        max: Math.max(...baselines.map((b) => b.ms)),
        average: Number(
          (baselines.reduce((sum, b) => sum + b.ms, 0) / baselines.length).toFixed(3),
        ),
      }),
    );
  });
});
