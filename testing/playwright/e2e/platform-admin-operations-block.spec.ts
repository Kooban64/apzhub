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

test.describe("Platform Admin operational block", () => {
  test("Products → Provisioning → Providers → Operations", async ({ page }) => {
    test.setTimeout(300_000);
    await loginAs(page, "platform_admin");

    await page.goto(`${ORIGIN}/platform-admin/products`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-products")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("platform-product-productivity")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/platform-products.png",
      fullPage: true,
    });

    await page
      .getByRole("link", { name: /View Product/i })
      .last()
      .click();
    await expect(page.getByTestId("platform-admin-product-detail")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("product-capabilities")).toBeVisible();
    await expect(page.getByTestId("capability-projects")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/platform-product-apzprd.png",
      fullPage: true,
    });

    await page.goto(`${ORIGIN}/platform-admin/provisioning`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-provisioning")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("provisioning-counts")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/platform-provisioning.png",
      fullPage: true,
    });

    await page.goto(`${ORIGIN}/platform-admin/providers`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-providers")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("providers-table")).toBeVisible();
    // Must not invent Healthy for unconfigured/unknown
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/● Healthy[\s\S]*● Healthy[\s\S]*● Healthy/);
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/platform-providers.png",
      fullPage: true,
    });

    const zammad = page.getByTestId("provider-row-zammad");
    if (await zammad.count()) {
      await zammad.getByRole("link").click();
      await expect(page.getByTestId("platform-admin-provider-detail")).toBeVisible({
        timeout: 30_000,
      });
      await page.screenshot({
        path: "docs/frontend/platform-admin/evidence/platform-provider-zammad.png",
        fullPage: true,
      });
    }

    await page.goto(`${ORIGIN}/platform-admin/operations`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-operations")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("ops-core")).toBeVisible();
    await expect(page.getByTestId("ops-products")).toBeVisible();
    await expect(page.getByTestId("ops-issues")).toBeVisible();
    const opsText = await page.locator("body").innerText();
    expect(opsText).toMatch(/Projects|Support|Time/);
    expect(opsText.toLowerCase()).not.toMatch(/\bzammad\b.*● healthy/);
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/platform-operations.png",
      fullPage: true,
    });
  });
});
