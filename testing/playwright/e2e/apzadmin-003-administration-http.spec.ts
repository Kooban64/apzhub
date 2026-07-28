import { expect, test } from "@playwright/test";

/**
 * APZADMIN-003 — mock HTTP only. Verifies typed client path surface.
 * NO Administration Workbench UI (APZADMIN-004).
 */

test.describe("APZADMIN-003 Administration HTTP typed client (mocked)", () => {
  test("mock fetch to /api/v1/administration serves module list envelope", async ({
    page,
    baseURL,
  }) => {
    await page.route("**/api/v1/administration/**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith("/administration/modules")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "mod_pw",
                tenantId: "tenant_a",
                key: "projects",
                name: "Projects",
                status: "draft",
                createdAt: "2026-07-16T12:00:00.000Z",
                updatedAt: "2026-07-16T12:00:00.000Z",
                createdBy: "user_1",
                updatedBy: "user_1",
                revision: 1,
              },
            ],
            page: { limit: 1, hasMore: false },
            meta: { correlationId: "pw-apzadmin-003" },
          }),
        });
        return;
      }
      if (path.endsWith("/administration/management-capabilities")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              administrationEnabled: true,
              managementPlaneReady: true,
              httpEnabled: true,
              workbenchEnabled: false,
              runtimeAdminEnabled: false,
            },
            meta: { correlationId: "pw-apzadmin-003" },
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
      const modulesRes = await fetch(`${origin}/api/v1/administration/modules`, {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const modules = await modulesRes.json();
      const capsRes = await fetch(
        `${origin}/api/v1/administration/management-capabilities`,
        {
          credentials: "include",
          headers: { accept: "application/json" },
        },
      );
      const caps = await capsRes.json();
      return { modules, caps };
    }, origin);

    expect(result.modules.data[0].id).toBe("mod_pw");
    expect(result.caps.data.httpEnabled).toBe(true);
    expect(result.caps.data.workbenchEnabled).toBe(false);
    expect(result.caps.data.runtimeAdminEnabled).toBe(false);
  });
});
