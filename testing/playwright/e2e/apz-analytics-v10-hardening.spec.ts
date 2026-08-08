import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { DASHBOARD_ID, mockAnalyticsApi, signIn } from "./analytics-workbench-helpers";

/**
 * APZ Analytics V1.0 Hardening — ANA-H1 · ANA-H2 · ANA-H3
 * Uses Decision Companion surfaces already mocked by analytics-workbench-helpers.
 */

const PRIMARY_SURFACES = [
  { path: "/workspace/analytics", testId: "analytics-page" },
  { path: "/workspace/analytics/help", testId: "analytics-help" },
  { path: "/workspace/analytics/executive", testId: "analytics-suite-executive" },
  {
    path: `/workspace/analytics/dashboards/${DASHBOARD_ID}`,
    testId: "analytics-dashboard-detail",
  },
] as const;

const BUDGETS = {
  readyMs: 8_000,
} as const;

async function openSurface(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("ANA-H1 APZ Analytics V1.0 product journeys", () => {
  test("Home → suite → insight + honesty surfaces", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockAnalyticsApi(page);

    await page.goto("/workspace/analytics");
    await expect(page.getByTestId("analytics-page")).toBeVisible();
    await expect(page.getByTestId("analytics-home-questions")).toBeVisible();

    await page.goto("/workspace/analytics/executive");
    await expect(page.getByTestId("analytics-suite-executive")).toBeVisible();
    await page.getByTestId(`analytics-dashboard-row-${DASHBOARD_ID}`).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/analytics/dashboards/${DASHBOARD_ID}`),
    );
    await expect(page.getByTestId("analytics-dashboard-detail")).toBeVisible();
    await expect(page.getByTestId("analytics-embed-honesty")).toContainText(
      /not available/i,
    );

    await page.goto("/workspace/analytics/help");
    await expect(page.getByTestId("analytics-help-limitations")).toBeVisible();
    await expect(page.getByTestId("analytics-help-limitations")).toContainText(
      /Live visual embed/i,
    );
  });

  test("denied path — 403 does not leak engine identity", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.route(/\/api\/v1\/analytics\/dashboards(\?|$)/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "metabase denied" },
          meta: { requestId: "req_h", correlationId: "corr_h" },
        }),
      });
    });
    await page.goto("/workspace/analytics/executive");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/metabase/i);
  });
});

test.describe("ANA-H2 APZ Analytics V1.0 accessibility", () => {
  test("primary surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockAnalyticsApi(page);

    for (const surface of PRIMARY_SURFACES) {
      await openSurface(page, surface.path, surface.testId);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      );
      expect(
        blocking,
        `${surface.path}\n${blocking.map((v) => `${v.id}: ${v.help}`).join("\n")}`,
      ).toEqual([]);
    }
  });
});

test.describe("ANA-H3 APZ Analytics V1.0 performance", () => {
  test("warm-shell ready budgets on primary surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockAnalyticsApi(page);

    await openSurface(page, "/workspace/analytics", "analytics-page");

    for (const surface of PRIMARY_SURFACES) {
      const t0 = Date.now();
      await openSurface(page, surface.path, surface.testId);
      const ms = Date.now() - t0;
      expect(ms, `${surface.path} ready budget`).toBeLessThanOrEqual(BUDGETS.readyMs);
    }
  });
});
