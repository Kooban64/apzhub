import { expect, test } from "@playwright/test";

/**
 * APZMETRICS-003 — mock HTTP only. Verifies typed client path surface.
 * NO Metrics Workbench UI.
 */

test.describe("APZMETRICS-003 Metrics HTTP typed client (mocked)", () => {
  test("mock fetch to /api/v1/metrics serves metrics list envelope", async ({
    page,
  }) => {
    await page.route("**/api/v1/metrics/**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith("/metrics/metrics")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "m_pw",
                tenantId: "tenant_a",
                key: "latency",
                name: "Playwright latency",
                status: "active",
                createdAt: "2026-07-17T12:00:00.000Z",
                updatedAt: "2026-07-17T12:00:00.000Z",
                createdBy: "user_1",
                updatedBy: "user_1",
                revision: 1,
              },
            ],
            page: { limit: 1, hasMore: false },
            meta: { correlationId: "pw-apzmetrics-003" },
          }),
        });
        return;
      }
      if (path.endsWith("/metrics/capabilities")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              metricsEnabled: true,
              managementPlaneReady: true,
              persistenceReady: true,
              formulaExecutionEnabled: false,
              kpiExecutionEnabled: false,
              providerIntegrationEnabled: false,
              workbenchReady: false,
            },
            meta: { correlationId: "pw-apzmetrics-003" },
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

    const result = await page.evaluate(async () => {
      const listRes = await fetch("/api/v1/metrics/metrics", {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const list = await listRes.json();
      const capsRes = await fetch("/api/v1/metrics/capabilities", {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const caps = await capsRes.json();
      return { list, caps };
    });

    expect(result.list.data[0].key).toBe("latency");
    expect(result.caps.data.formulaExecutionEnabled).toBe(false);
    expect(result.caps.data.workbenchReady).toBe(false);
  });
});
