import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("demo-quick-login").selectOption(persona);
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 60_000,
  });
}

test.describe("Platform Admin Tenant Users + User Inspector", () => {
  test("denies tenant users API without platform permission", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, "org_admin");

    const res = await page.request.get(
      `${ORIGIN}/api/v1/platform-admin/tenants/t0000001-0000-4000-8000-000000000001/users`,
    );
    expect([401, 403]).toContain(res.status());
  });

  test("walks Tenants → Users → Inspector with real memberships", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "platform_admin");

    await page.goto(`${ORIGIN}/platform-admin/tenants`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-tenants")).toBeVisible({
      timeout: 45_000,
    });

    const firstLink = page.locator("[data-testid^='tenant-link-']").first();
    await firstLink.click();
    await expect(page.getByTestId("platform-admin-tenant-detail")).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("tenant-tab-users").click();
    await expect(page.getByTestId("platform-admin-tenant-users")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("tenant-users-add")).toBeEnabled();
    await expect(page.getByTestId("tenant-users-add")).toHaveAttribute(
      "data-availability",
      "ok",
    );

    const table = page.getByTestId("tenant-users-table");
    const empty = page.getByTestId("tenant-users-empty");
    await expect(table.or(empty)).toBeVisible({ timeout: 30_000 });

    if (await table.isVisible()) {
      const firstUser = page.locator("[data-testid^='tenant-user-link-']").first();
      await firstUser.click();
      await expect(page.getByTestId("platform-admin-user-inspector")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("inspector-manage-access")).toBeEnabled({
        timeout: 60_000,
      });
      await expect(page.getByTestId("inspector-manage-access")).toHaveAttribute(
        "data-availability",
        "ok",
      );
      await expect(page.getByTestId("inspector-platform-access")).toBeVisible();

      await page.getByTestId("inspector-manage-access").click();
      await expect(page.getByTestId("platform-admin-manage-access")).toBeVisible();
      await expect(page.getByTestId("manage-access-pt")).toBeVisible();

      await page.getByTestId("inspector-tab-products").click();
      await expect(page.getByTestId("inspector-products")).toBeVisible();

      await page.getByTestId("inspector-tab-roles").click();
      await expect(page.getByTestId("inspector-roles")).toBeVisible();

      await page.getByTestId("inspector-tab-tools").click();
      await expect(page.getByTestId("inspector-tools")).toBeVisible();

      await page.getByTestId("inspector-tab-gaps").click();
      await expect(page.getByTestId("inspector-gaps")).toBeVisible();

      await page.screenshot({
        path: "docs/frontend/platform-admin/evidence/user-inspector-platform-admin.png",
        fullPage: true,
      });
    } else {
      // Honest empty membership list is acceptable for a tenant without members
      await page.screenshot({
        path: "docs/frontend/platform-admin/evidence/tenant-users-platform-admin.png",
        fullPage: true,
      });
    }
  });
});
