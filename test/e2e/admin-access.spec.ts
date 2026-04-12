import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("admin access control routes", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("navigates users, matrix, bundles, and services", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "apzhub.shell.state.v1",
        JSON.stringify({
          version: 1,
          primaryRailCollapsed: false,
          secondaryRailOpenByMode: { workspace: false, admin: true },
          rightPanelCollapsed: false,
          splitLayouts: {},
        }),
      );
    });

    await page.goto("/admin/users");
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(page.getByTestId("admin-users-page")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();

    await page.goto("/admin/access");
    await expect(page.getByTestId("admin-matrix-page")).toBeVisible();
    await page.getByTestId("admin-matrix-cell-u-1001-mail").click();
    await expect(page.getByTestId("admin-inspector-body")).toContainText(/Matrix cell/i);

    await page.goto("/admin/bundles");
    await expect(page.getByTestId("admin-bundles-page")).toBeVisible();
    await page.getByTestId("admin-bundle-row-b-admin").click();
    await expect(page).toHaveURL(/\/admin\/bundles\/b-admin/);
    await expect(page.getByTestId("admin-bundle-editor")).toBeVisible();

    await page.goto("/admin/services");
    await expect(page.getByTestId("admin-services-page")).toBeVisible();
    await page.getByTestId("admin-service-row-mail").click();
    await expect(page).toHaveURL(/\/admin\/services\/mail/);
    await expect(page.getByTestId("admin-service-detail")).toBeVisible();
  });
});
