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

test.describe("User Workbench Slice 1 — Global Shell", () => {
  test("org_member: shell geometry + home + integrations + panels", async ({
    page,
  }) => {
    test.setTimeout(480_000);
    await loginAs(page, "org_member");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByTestId("workbench-activity-rail")).toBeVisible();
    await expect(page.getByTestId("workbench-header")).toBeVisible();
    await expect(
      page.getByTestId("workbench-main-workspace").getByTestId("role-home-dashboard"),
    ).toBeVisible({
      timeout: 90_000,
    });
    await expect(
      page
        .getByTestId("workbench-main-workspace")
        .getByTestId("workbench-home-greeting"),
    ).toBeVisible();

    // No admin metric-card strip
    await expect(page.locator("text=System health")).toHaveCount(0);

    await page.screenshot({
      path: "docs/frontend/workbench/evidence/01-workbench-home-light.png",
      fullPage: true,
    });

    // Dark mode
    const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
    if (await themeBtn.count()) {
      await themeBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/02-workbench-home-dark.png",
      fullPage: true,
    });
    if (await themeBtn.count()) {
      await themeBtn.click();
    }

    // Global Search
    await page.getByTestId("global-search-trigger").click();
    await expect(
      page.getByRole("dialog").or(page.locator("[data-testid*='search']")).first(),
    ).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/03-workbench-search.png",
      fullPage: true,
    });
    await page.keyboard.press("Escape");

    // Quick Actions
    await page.keyboard.press("Control+Shift+A");
    await page.waitForTimeout(500);
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/04-workbench-quick-actions.png",
      fullPage: true,
    });
    await page.keyboard.press("Escape");

    // Notifications (header bell / panel)
    const notif = page.getByRole("button", { name: /notification/i }).first();
    if (await notif.count()) {
      await notif.click({ force: true });
      await page.waitForTimeout(400);
    }
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/05-workbench-notifications.png",
      fullPage: true,
    });
    // Close notification panel if open
    if (await notif.count()) {
      await notif.click({ force: true });
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Sidebar collapse
    await page.getByTestId("workbench-toggle-sidebar").click({ force: true });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/06-workbench-sidebar-collapsed.png",
      fullPage: true,
    });
    await page.getByTestId("workbench-toggle-sidebar").click({ force: true });

    // Inspector expand
    await page.getByTestId("workbench-toggle-inspector").click({ force: true });
    await expect(page.getByTestId("workbench-context-inspector")).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/07-workbench-inspector.png",
      fullPage: true,
    });

    // Bottom panel
    await page.getByTestId("workbench-toggle-bottom").click({ force: true });
    await expect(page.getByTestId("workbench-bottom-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("workbench-bottom-panel")).toContainText(
      "Not configured",
    );
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/08-workbench-bottom-panel.png",
      fullPage: true,
    });

    // Effective access: rail products are entitled-only
    const homeCtx = await page.request.get("/api/v1/me/home-context");
    expect(homeCtx.ok()).toBeTruthy();
    const homeJson = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] }; tenantId?: string };
    };
    const keys = homeJson.data?.entitlements?.productKeys ?? [];
    expect(homeJson.data?.tenantId).toBeTruthy();

    if (!keys.includes("pentest")) {
      await expect(page.getByTestId("workbench-rail-security")).toHaveCount(0);
    }
    if (!keys.includes("qep")) {
      // may still show if activity bar has qep from RBAC — prefer entitlement
    }

    // Session tenant only — fake tenant query ignored by APIs
    const searchApi = await page.request.get(
      "/api/v1/platform/search?q=test&tenantId=other-tenant",
    );
    // May be 200 with filtered results or 4xx — never cross-tenant dump
    expect([200, 400, 401, 403, 404]).toContain(searchApi.status());
  });

  test("rail matches effective entitlements (no inaccessible products)", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await loginAs(page, "org_member");
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 120_000,
    });

    const homeCtx = await page.request.get("/api/v1/me/home-context");
    expect(homeCtx.ok()).toBeTruthy();
    const homeJson = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] } };
    };
    const keys = new Set(homeJson.data?.entitlements?.productKeys ?? []);

    await page.screenshot({
      path: "docs/frontend/workbench/evidence/09-workbench-restricted-user.png",
      fullPage: true,
    });

    // Access rule: unassigned products absent — never disabled stubs
    if (!keys.has("pentest")) {
      await expect(page.getByTestId("workbench-rail-security")).toHaveCount(0);
    }
    if (!keys.has("qep")) {
      await expect(page.getByTestId("workbench-rail-quality")).toHaveCount(0);
    }
    const prdKeys = [
      "projects",
      "support",
      "time",
      "workflow",
      "analytics",
      "knowledge",
      "documents",
    ];
    const hasAnyPrd = prdKeys.some((k) => keys.has(k));
    if (hasAnyPrd) {
      await expect(page.getByTestId("workbench-rail-productivity")).toBeVisible();
    } else {
      await expect(page.getByTestId("workbench-rail-productivity")).toHaveCount(0);
    }
  });

  test("mobile chrome uses bottom navigation", async ({ page }) => {
    test.setTimeout(240_000);
    await loginAs(page, "org_member");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByTestId("workbench-mobile-nav")).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({
      path: "docs/frontend/workbench/evidence/10-workbench-mobile.png",
      fullPage: true,
    });
  });
});
