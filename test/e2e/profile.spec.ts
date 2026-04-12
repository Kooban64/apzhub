import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("profile settings", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("loads profile and mock-connects Google", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByTestId("profile-page-root")).toBeVisible();
    await expect(page.getByTestId("profile-section-appearance")).toBeVisible();
    await expect(page.getByTestId("profile-google-status")).toHaveText("not_linked");

    await page.getByTestId("profile-google-connect").click();
    await expect(page.getByTestId("profile-google-status")).toHaveText("linked", { timeout: 15_000 });

    await page.goto("/workspace", { waitUntil: "domcontentloaded" });
    await page.getByTestId("right-panel-tab-mail").click();
    await expect(page.getByTestId("right-panel-widget-enabled-mail")).toBeVisible();
  });
});
