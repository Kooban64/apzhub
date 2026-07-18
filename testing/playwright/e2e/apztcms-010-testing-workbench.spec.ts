import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  CERTIFICATION_ID,
  expectTestingHeading,
  expectTestingPageVisible,
  gotoTestingSection,
  signIn,
  TESTING_E2E_NOTE,
  TESTING_ROUTES,
} from "./testing-ui-helpers";

async function expectNoCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(critical).toEqual([]);
}

test.describe("APZTCMS-010 Testing workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("dashboard loads with testing page shell", async ({ page }) => {
    await gotoTestingSection(page, TESTING_ROUTES.dashboard);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Dashboard/i);
    await expect(page.getByTestId("testing-dashboard-stats")).toBeVisible();
  });

  test("navigates key testing sections", async ({ page }) => {
    await gotoTestingSection(page, TESTING_ROUTES.plans);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Test plans/i);

    await gotoTestingSection(page, TESTING_ROUTES.executions);
    await expectTestingHeading(page, /Executions/i);

    await gotoTestingSection(page, TESTING_ROUTES.certification);
    await expectTestingHeading(page, /Certification/i);

    await gotoTestingSection(page, TESTING_ROUTES.evidence);
    await expectTestingHeading(page, /Evidence/i);

    await gotoTestingSection(page, TESTING_ROUTES.reports);
    await expectTestingHeading(page, /Reports/i);
  });

  test("certification detail shows gates and advisory recommendation", async ({
    page,
  }) => {
    await gotoTestingSection(
      page,
      `${TESTING_ROUTES.certification}/${CERTIFICATION_ID}`,
    );
    await expectTestingPageVisible(page);
    await expect(page.getByText(/Advisory only/i)).toBeVisible();
    await expect(page.getByText("Requirement coverage")).toBeVisible();
  });

  test("workbench remains usable on mobile and desktop viewports", async ({ page }) => {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoTestingSection(page, TESTING_ROUTES.dashboard);
      await expectTestingPageVisible(page);
      await expectTestingHeading(page, /Dashboard/i);
    }
  });

  test("dashboard has no critical/serious axe violations", async ({ page }) => {
    await gotoTestingSection(page, TESTING_ROUTES.dashboard);
    await expectTestingPageVisible(page);
    await expectNoCriticalAxeViolations(page);
  });

  test("documents permission coverage split between Vitest and Playwright", async () => {
    expect(TESTING_E2E_NOTE).toMatch(/Vitest/);
  });
});
