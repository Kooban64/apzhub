import { expect, test } from "@playwright/test";

/**
 * APZIDENTITY-003 — mock HTTP only. Verifies typed client path surface.
 * NO Identity Workbench UI.
 */

test.describe("APZIDENTITY-003 Identity HTTP typed client (mocked)", () => {
  test("mock fetch to /api/v1/identity serves user list envelope", async ({
    page,
  }) => {
    await page.route("**/api/v1/identity/**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith("/identity/users")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "user_pw",
                tenantId: "tenant_a",
                email: "user@example.com",
                displayName: "Playwright User",
                status: "active",
                createdAt: "2026-07-16T12:00:00.000Z",
                updatedAt: "2026-07-16T12:00:00.000Z",
                createdBy: "user_1",
                updatedBy: "user_1",
                revision: 1,
              },
            ],
            page: { limit: 1, hasMore: false },
            meta: { correlationId: "pw-apzidentity-003" },
          }),
        });
        return;
      }
      if (path.endsWith("/identity/management-capabilities")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              identityEnabled: true,
              managementPlaneReady: true,
              httpEnabled: true,
              workbenchEnabled: false,
              authenticationManaged: false,
              provisioningEnabled: false,
              directorySyncEnabled: false,
            },
            meta: { correlationId: "pw-apzidentity-003" },
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
      const usersRes = await fetch("/api/v1/identity/users", {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const users = await usersRes.json();
      const capsRes = await fetch("/api/v1/identity/management-capabilities", {
        credentials: "include",
        headers: { accept: "application/json" },
      });
      const caps = await capsRes.json();
      return { users, caps };
    });

    expect(result.users.data[0].id).toBe("user_pw");
    expect(result.users.page).toBeDefined();
    expect(result.caps.data.httpEnabled).toBe(true);
    expect(result.caps.data.workbenchEnabled).toBe(false);
    expect(result.caps.data.authenticationManaged).toBe(false);
  });
});
