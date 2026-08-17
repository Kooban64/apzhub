import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

test.describe("Platform Admin Tenants", () => {
  test("lists real tenants without special-casing APZOR", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("demo-quick-login").selectOption("platform_admin");
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 60_000,
    });

    await page.goto(`${ORIGIN}/platform-admin/tenants`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByTestId("platform-admin-tenants")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("tenants-table")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("platform-admin-create-tenant")).toBeDisabled();
    await expect(page.getByText("System Tenant")).toHaveCount(0);

    const rowsBefore = await page
      .getByTestId("tenants-table")
      .locator("tbody tr")
      .count();
    expect(rowsBefore).toBeGreaterThan(0);

    await page.getByTestId("tenants-search").fill("zzz-no-such-tenant");
    await expect(page.getByTestId("tenants-empty")).toBeVisible();
    await page.getByTestId("tenants-search").fill("");
    await expect(page.getByTestId("tenants-table")).toBeVisible();

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/tenants-platform-admin.png",
      fullPage: true,
    });

    const firstLink = page.locator("[data-testid^='tenant-link-']").first();
    await firstLink.click();
    await expect(page.getByTestId("platform-admin-tenant-detail")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("tenant-detail-tabs")).toBeVisible();
    await expect(page.getByTestId("tenant-tab-users")).toBeEnabled();
    expect(page.url()).toMatch(/\/platform-admin\/tenants\//);
  });
});
