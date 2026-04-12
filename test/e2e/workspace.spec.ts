import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

const linkedAdmin = {
  ...mockAdminSession(),
  linkedAccounts: { google: "linked" as const },
};

test.describe("workspace home", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(linkedAdmin),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("shows launcher tiles and right panel tabs", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("workspace-app-launcher")).toBeVisible();
    await expect(page.getByTestId("launcher-tile-calendar")).toBeVisible();
    await expect(page.getByTestId("right-panel-tab-mail")).toBeVisible();
    await page.getByTestId("right-panel-tab-mail").click();
    await expect(page.getByRole("tabpanel")).toContainText(/mail/i);
  });
});
