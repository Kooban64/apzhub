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

test.describe("Platform Admin Tenant Products / Subscription / Provisioning", () => {
  test("walks Products → Subscription → Provisioning with honest fields", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await loginAs(page, "platform_admin");

    await page.goto(`${ORIGIN}/platform-admin/tenants`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-tenants")).toBeVisible({
      timeout: 45_000,
    });

    const apzor = page.getByRole("link", { name: /APZOR/i }).first();
    if (await apzor.count()) {
      await apzor.click();
    } else {
      await page.locator("[data-testid^='tenant-link-']").first().click();
    }

    await expect(page.getByTestId("platform-admin-tenant-detail")).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("tenant-tab-products").click();
    await expect(page.getByTestId("platform-admin-tenant-products")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("tenant-suite-qa")).toBeVisible();
    await expect(page.getByTestId("tenant-suite-productivity")).toBeVisible();
    // Licences must not be invented numbers — Not configured or real count language
    await expect(page.getByTestId("tenant-suite-qa")).toContainText(
      /Not configured|Business|Active/,
    );

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/tenant-products.png",
      fullPage: true,
    });

    await page.getByTestId("tenant-tab-subscription").click();
    await expect(page.getByTestId("platform-admin-tenant-subscription")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("tenant-subscription-manage")).toBeDisabled();

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/tenant-subscription.png",
      fullPage: true,
    });

    await page.getByTestId("tenant-tab-provisioning").click();
    await expect(page.getByTestId("platform-admin-tenant-provisioning")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("provision-queue-note")).toContainText(
      "Not configured",
    );

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/tenant-provisioning.png",
      fullPage: true,
    });
  });
});
