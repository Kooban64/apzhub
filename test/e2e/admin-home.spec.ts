import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("admin control plane home", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("shows modules, secondary rail, and inspector with selection", async ({ page }) => {
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

    await page.goto("/admin");
    await page.setViewportSize({ width: 1400, height: 900 });

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByTestId("secondary-rail")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();
    await expect(page.getByTestId("right-utility-panel-title")).toHaveText("Inspector");
    await expect(page.getByTestId("admin-inspector-body")).toBeVisible();

    await expect(page.getByTestId("admin-module-platform_health")).toBeVisible();
    await expect(page.getByTestId("admin-module-action_required")).toBeVisible();

    await page.getByTestId("admin-alert-row-alert-2").click();
    await expect(page.getByTestId("admin-inspector-body")).toContainText(/SCIM token expiring/i);
  });

  test("secondary rail Overview link targets admin home", async ({ page }) => {
    await page.goto("/admin");
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/admin");
  });
});
