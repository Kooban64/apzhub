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
}

test.describe("Organisation Admin block 2 — Teams / Roles / Products / Provisioning", () => {
  test("org_admin: four surfaces + isolation + no provider leak + PA 403", async ({
    page,
  }) => {
    test.setTimeout(480_000);
    await loginAs(page, "org_admin");

    await page.goto("/organisation-admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-shell")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByTestId("organisation-admin-org-name")).toBeVisible();
    await expect(page.getByTestId("organisation-admin-sidebar")).toContainText(
      "Organisation Administration",
    );

    for (const id of ["teams", "roles", "products", "provisioning"] as const) {
      await expect(page.getByTestId(`organisation-admin-nav-${id}`)).toHaveAttribute(
        "data-implemented",
        "true",
      );
    }

    await page.goto("/organisation-admin/teams", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-teams")).toBeVisible({
      timeout: 60_000,
    });
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/teams.png",
      fullPage: true,
    });

    await page.goto("/organisation-admin/roles-access", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("organisation-admin-roles-access")).toBeVisible({
      timeout: 90_000,
    });
    // Wait for Users tab content or empty state before switching tabs (query must resolve).
    await expect(
      page
        .getByTestId("org-admin-roles-users-table")
        .or(page.getByText(/No product role assignments/i)),
    ).toBeVisible({ timeout: 90_000 });
    await page.getByTestId("org-admin-roles-tab-product-roles").click();
    await expect(page.getByTestId("org-admin-product-roles-catalogue")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("product-roles-suite-productivity")).toContainText(
      "APZPRD",
    );
    await expect(page.getByTestId("product-roles-projects")).toBeVisible();
    await expect(page.getByTestId("product-roles-support")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    for (const leak of ["Plane", "Zammad", "Kimai", "n8n", "Metabase", "Paperless"]) {
      expect(bodyText.includes(leak), `provider leak ${leak}`).toBeFalsy();
    }
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/roles-access.png",
      fullPage: true,
    });

    await page.goto("/organisation-admin/products", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("organisation-admin-products")).toBeVisible({
      timeout: 60_000,
    });
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/products.png",
      fullPage: true,
    });

    const firstProduct = page.locator("[data-testid^='org-admin-product-']").first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.getByRole("link", { name: /Manage Access/i }).click();
    await expect(page.getByTestId("organisation-admin-product-detail")).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId("org-admin-product-tab-overview").click();
    await expect(page.getByTestId("org-admin-product-overview")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/product-detail.png",
      fullPage: true,
    });

    await page.goto("/organisation-admin/provisioning", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("organisation-admin-provisioning")).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId("org-admin-provisioning-tab-issues").click();
    await expect(page.getByTestId("org-admin-provisioning-queue")).toContainText(
      "Not configured",
    );
    const provBody = await page.locator("body").innerText();
    for (const leak of ["Plane", "Zammad", "Kimai"]) {
      expect(provBody.includes(leak)).toBeFalsy();
    }
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/provisioning.png",
      fullPage: true,
    });

    // Permanent regression: tenant admin cannot escalate to Platform Admin APIs
    const paOverview = await page.request.get("/api/v1/platform-admin/overview");
    expect(paOverview.status()).toBe(403);
    const paTenants = await page.request.get("/api/v1/platform-admin/tenants");
    expect(paTenants.status()).toBe(403);

    const teamsApi = await page.request.get("/api/v1/organisation-admin/teams");
    expect(teamsApi.ok()).toBeTruthy();
    const teamsJson = (await teamsApi.json()) as { meta?: { tenantId?: string } };
    expect(teamsJson.meta?.tenantId).toBeTruthy();

    const productsApi = await page.request.get("/api/v1/organisation-admin/products");
    expect(productsApi.ok()).toBeTruthy();
  });

  test("org_member denied block-2 APIs", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "org_member");
    for (const path of [
      "/api/v1/organisation-admin/teams",
      "/api/v1/organisation-admin/roles-access",
      "/api/v1/organisation-admin/products",
      "/api/v1/organisation-admin/provisioning",
    ]) {
      const res = await page.request.get(path);
      expect([401, 403], path).toContain(res.status());
    }
  });
});
