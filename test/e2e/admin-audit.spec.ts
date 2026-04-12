import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("admin audit and alerts surfaces", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("audit page lists events and privileged rows", async ({ page }) => {
    await page.goto("/admin/audit");
    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(page.getByTestId("admin-audit-page")).toBeVisible();
    await expect(page.getByTestId("admin-audit-table-row-aud-1")).toBeVisible();
    await expect(page.getByTestId("admin-priv-row-priv-1")).toBeVisible();
  });

  test("alerts page shows actionable cards with internal links", async ({ page }) => {
    await page.goto("/admin/alerts");
    await expect(page.getByTestId("admin-alerts-page")).toBeVisible();
    await expect(page.getByTestId("admin-alert-card-alert-1")).toContainText(/domain=platform/i);
    await expect(page.getByRole("link", { name: /Open users/i })).toHaveAttribute("href", "/admin/users");
  });
});
