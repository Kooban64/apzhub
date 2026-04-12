import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("admin provisioning queue", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("loads queue, selects failed job, and shows enabled retry", async ({ page }) => {
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

    await page.goto("/admin/provisioning");
    await page.setViewportSize({ width: 1400, height: 900 });

    await expect(page.getByTestId("admin-provisioning-page")).toBeVisible();
    await page.getByTestId("admin-provisioning-job-row-job-cal-fail").click();
    await expect(page.getByTestId("admin-inspector-body")).toContainText(/Provisioning job/i);
    await expect(page.getByTestId("admin-inspector-body")).toContainText(/job-cal-fail/);

    const retry = page.getByRole("button", { name: /Retry job/i });
    await expect(retry).toBeEnabled();
  });
});
