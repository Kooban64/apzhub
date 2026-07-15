import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { REQUEST_ID, mockSupportApi, signIn } from "./support-ui-cert-helpers";

async function expectNoCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(critical).toEqual([]);
}

test.describe("OSS-110-14 Support accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await mockSupportApi(page);
  });

  test("inbox has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test("request detail has no critical/serious axe violations", async ({ page }) => {
    await page.goto(`/workspace/support/requests/${REQUEST_ID}`);
    await expect(page.getByTestId("support-request-detail")).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test("search has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/workspace/support/search");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test("analytics has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-analytics")).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test("organizations has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/workspace/support/organizations");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test("keyboard Tab reaches a meaningful inbox control", async ({ page }) => {
    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();

    const create = page.getByTestId("support-inbox-create");
    const filter = page.getByTestId("support-filter-status");
    await expect(create.or(filter).first()).toBeVisible();

    let reached = false;
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press("Tab");
      const focusedCreate = await create.evaluate(
        (el) => el === document.activeElement || el.contains(document.activeElement),
      );
      const focusedFilter = await filter.evaluate(
        (el) => el === document.activeElement || el.contains(document.activeElement),
      );
      if (focusedCreate || focusedFilter) {
        reached = true;
        break;
      }
    }

    expect(reached).toBe(true);
  });
});
