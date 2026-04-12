import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("workspace launch decision layer", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("launcher shows readiness and navigates on ready mail tile", async ({ page }) => {
    await page.goto("/workspace");
    await page.setViewportSize({ width: 1200, height: 900 });

    const mail = page.getByTestId("launcher-tile-mail");
    await expect(mail).toBeVisible();
    await expect(mail).toContainText(/Ready/i);

    await mail.click();
    await expect(page).toHaveURL(/\/workspace\/launch\/mock-oidc/);
    await expect(page.getByTestId("mock-launch-oidc-page")).toBeVisible();
  });

  // 14D optional e2e: assert `launch_events` after a real JWT flow when e2e env has migrated Postgres +
  // APZHUB_LAUNCH_SOURCE=real + APZHUB_LAUNCH_JWT_SIGNING_SECRET (not enabled in default mock e2e).
});
