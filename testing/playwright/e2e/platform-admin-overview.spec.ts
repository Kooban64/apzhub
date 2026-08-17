import { expect, test } from "@playwright/test";

/**
 * Focused slice: Platform Admin Overview for platform_admin persona.
 * Requires ALLOW_DEMO_PERSONAS and a running web on PLAYWRIGHT_BASE_URL.
 */
const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

test.describe("Platform Admin Overview", () => {
  test("platform_admin lands on overview with honest panels", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("demo-quick-login").selectOption("platform_admin");
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 60_000,
    });

    expect(new URL(page.url()).pathname).toMatch(/^\/platform-admin/);

    await expect(page.getByTestId("platform-admin-shell")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("platform-admin-sidebar")).toBeVisible();
    await expect(page.getByTestId("platform-admin-nav-overview")).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByTestId("platform-admin-overview")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("platform-admin-status-strip")).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page.getByTestId("platform-admin-attention-unavailable"),
    ).toBeVisible();
    await expect(page.getByTestId("platform-admin-activity-unavailable")).toBeVisible();

    // Compact sidebar — no permanent child explosion
    await expect(page.getByText("All Tenants")).toHaveCount(0);

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/overview-platform-admin.png",
      fullPage: true,
    });
  });
});
