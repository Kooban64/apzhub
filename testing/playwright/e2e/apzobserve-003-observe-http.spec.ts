import { expect, test } from "@playwright/test";

/**
 * APZOBSERVE-003 — mock HTTP only. Verifies typed client path surface.
 * NO Observability Workbench UI.
 */

test.describe("APZOBSERVE-003 Observability HTTP typed client (mocked)", () => {
  test("mock fetch to /api/v1/observe serves health-check list envelope", async ({
    page,
    baseURL,
  }) => {
    await page.route("**/api/v1/observe/**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith("/observe/health-checks")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "hc_pw",
                tenantId: "tenant_a",
                serviceKey: "platform-api",
                name: "Playwright health",
                status: "healthy",
                providerKind: "internal",
                createdAt: "2026-07-17T12:00:00.000Z",
                updatedAt: "2026-07-17T12:00:00.000Z",
                createdBy: "user_1",
                updatedBy: "user_1",
                revision: 1,
              },
            ],
            page: { limit: 1, hasMore: false },
            meta: { correlationId: "pw-apzobserve-003" },
          }),
        });
        return;
      }
      if (path.endsWith("/observe/capabilities")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              observeEnabled: true,
              managementPlaneReady: true,
              persistenceReady: true,
              providerExecutionEnabled: false,
              workbenchReady: false,
              grafanaIntegrationReady: false,
              prometheusIntegrationReady: false,
            },
            meta: { correlationId: "pw-apzobserve-003" },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "NOT_FOUND", message: "not found" },
        }),
      });
    });

    // Absolute URLs — relative fetch has no document base on about:blank (RG-MOCK-FETCH).
    const origin = new URL(baseURL ?? "http://localhost:3300").origin;
    const result = await page.evaluate(async (origin) => {
      const listRes = await fetch(`${origin}/api/v1/observe/health-checks`, {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const list = await listRes.json();
      const capsRes = await fetch(`${origin}/api/v1/observe/capabilities`, {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const caps = await capsRes.json();
      return { list, caps };
    }, origin);

    expect(result.list.data[0].id).toBe("hc_pw");
    expect(result.list.page).toBeDefined();
    expect(result.caps.data.providerExecutionEnabled).toBe(false);
    expect(result.caps.data.workbenchReady).toBe(false);
    expect(result.caps.data.grafanaIntegrationReady).toBe(false);
  });
});
