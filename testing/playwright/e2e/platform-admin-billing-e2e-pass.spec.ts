import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
  });
  expect(credRes.ok(), `quick-login ${persona}`).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
  await page.goto("/platform-admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("platform-admin-shell")).toBeVisible({
    timeout: 90_000,
  });
}

test.describe("Platform Admin Billing + E2E pass", () => {
  test("Billing honesty + control-plane walk", async ({ page }) => {
    test.setTimeout(420_000);
    await loginAs(page, "platform_admin");

    await expect(page.getByTestId("platform-admin-sidebar")).toContainText(
      "control plane",
    );
    await expect(page.getByTestId("platform-admin-nav-billing")).toHaveAttribute(
      "data-implemented",
      "true",
    );
    await expect(page.getByTestId("platform-admin-nav-marketplace")).toHaveAttribute(
      "data-implemented",
      "false",
    );
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/e2e-overview.png",
      fullPage: true,
    });

    await page.goto("/platform-admin/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("platform-admin-billing")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("billing-active-subscriptions")).toBeVisible();
    await expect(page.getByTestId("billing-recent-activity")).toContainText(
      "Not configured",
    );
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/billing-overview.png",
      fullPage: true,
    });

    await page.getByTestId("billing-tab-invoices").click();
    await expect(page.getByTestId("billing-invoices")).toContainText("Not configured");
    await page.getByTestId("billing-tab-payments").click();
    await expect(page.getByTestId("billing-payments")).toContainText("Not configured");
    await page.getByTestId("billing-tab-billing-issues").click();
    await expect(page.getByTestId("billing-issues")).toContainText("Not configured");
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/billing-gaps.png",
      fullPage: true,
    });

    const stops: { path: string; testId: string }[] = [
      { path: "/platform-admin/tenants", testId: "platform-admin-tenants" },
      { path: "/platform-admin/products", testId: "platform-admin-products" },
      { path: "/platform-admin/provisioning", testId: "platform-admin-provisioning" },
      { path: "/platform-admin/providers", testId: "platform-admin-providers" },
      { path: "/platform-admin/operations", testId: "platform-admin-operations" },
      {
        path: "/platform-admin/identity-access",
        testId: "platform-admin-identity-access",
      },
      { path: "/platform-admin/security", testId: "platform-admin-security" },
      { path: "/platform-admin/audit", testId: "platform-admin-audit" },
      { path: "/platform-admin/marketplace", testId: "platform-admin-section-stub" },
    ];

    for (const stop of stops) {
      await page.goto(stop.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId(stop.testId)).toBeVisible({ timeout: 60_000 });
    }

    await page.goto("/platform-admin/tenants", { waitUntil: "domcontentloaded" });
    const firstTenant = page.locator("[data-testid^='tenant-link-']").first();
    await expect(firstTenant).toBeVisible({ timeout: 60_000 });
    const tenantHref = await firstTenant.getAttribute("href");
    expect(tenantHref).toBeTruthy();
    await page.goto(tenantHref!, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("platform-admin-tenant-detail")).toBeVisible({
      timeout: 60_000,
    });
    await page.goto(`${tenantHref}/users`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("platform-admin-tenant-users")).toBeVisible({
      timeout: 60_000,
    });
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/e2e-tenant-users.png",
      fullPage: true,
    });
  });
});
