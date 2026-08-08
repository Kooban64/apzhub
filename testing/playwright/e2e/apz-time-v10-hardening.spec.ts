import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { mockTimeApi, signIn, TIMESHEET_ID } from "./time-ui-cert-helpers";

/**
 * APZ Time V1.0 Hardening — TIME-H1 · TIME-H2 · TIME-H3
 */

const PRIMARY_SURFACES = [
  { path: "/workspace/time", testId: "time-page" },
  { path: "/workspace/time/help", testId: "time-help" },
  { path: "/workspace/time/timesheets", testId: "time-timesheets-filters" },
  {
    path: `/workspace/time/timesheets/${TIMESHEET_ID}`,
    testId: "time-timesheet-detail",
  },
] as const;

const BUDGETS = {
  readyMs: 8_000,
} as const;

async function openSurface(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("TIME-H1 APZ Time V1.0 product journeys", () => {
  test("Overview → Timesheets → detail + honesty surfaces", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockTimeApi(page);

    await page.goto("/workspace/time");
    await expect(page.getByTestId("time-page")).toBeVisible();

    await page.goto("/workspace/time/timesheets");
    await expect(page.getByTestId("time-timesheets-filters")).toBeVisible();
    await page.getByTestId(`time-timesheet-row-${TIMESHEET_ID}`).click();
    await expect(page.getByTestId("time-timesheet-detail")).toBeVisible();

    await page.goto("/workspace/time/help");
    await expect(page.getByTestId("time-help-limitations")).toBeVisible();
    await expect(page.getByTestId("time-help-limitations")).toContainText(
      /Approvals, reporting UI/i,
    );
  });

  test("denied path — 403 does not leak engine identity", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.route(/\/api\/v1\/time\/timesheets(\?|$)/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "kimai denied" },
          meta: { requestId: "req_h", correlationId: "corr_h" },
        }),
      });
    });
    await page.goto("/workspace/time/timesheets");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/kimai/i);
  });
});

test.describe("TIME-H2 APZ Time V1.0 accessibility", () => {
  test("primary surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockTimeApi(page);

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

test.describe("TIME-H3 APZ Time V1.0 performance", () => {
  test("warm-shell ready budgets on primary surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockTimeApi(page);

    await openSurface(page, "/workspace/time", "time-page");

    for (const surface of PRIMARY_SURFACES) {
      const t0 = Date.now();
      await openSurface(page, surface.path, surface.testId);
      const ms = Date.now() - t0;
      expect(ms, `${surface.path} ready budget`).toBeLessThanOrEqual(BUDGETS.readyMs);
    }
  });
});
