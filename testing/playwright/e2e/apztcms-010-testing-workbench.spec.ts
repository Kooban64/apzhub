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

/**
 * RG-TCMS-WB: workbench uses HTTP TestingClient against `/api/v1/testing/*`.
 * Without route mocks, dashboard never reaches stats and certification detail
 * stays on ErrorState (no `testing-page`).
 */
async function mockTestingWorkbenchApi(page: Page) {
  await page.route("**/api/v1/testing/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/v1/testing/dashboard") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            headline: "Testing & Certification overview",
            cards: [
              {
                id: "card-plans",
                label: "Active plans",
                value: "1 active",
                tone: "neutral",
              },
              {
                id: "card-executions",
                label: "Executions in progress",
                value: "0 running",
                tone: "success",
              },
              {
                id: "card-certifications",
                label: "Certifications pending",
                value: "1 pending",
                tone: "warning",
              },
              {
                id: "card-defects",
                label: "Open defects",
                value: "0 open",
                tone: "danger",
              },
            ],
            recentCertifications: [],
            recentExecutions: [],
          },
          meta: { correlationId: "pw-apztcms-010-rg-tcms-wb" },
        }),
      });
      return;
    }

    if (url.pathname === `/api/v1/testing/certifications/${CERTIFICATION_ID}`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: CERTIFICATION_ID,
            name: "Release 2.4 Certification",
            state: "pending_approval",
            recommendation: "ready_for_approval",
            recommendationAdvisoryOnly: true,
            gates: [
              {
                id: "gate-coverage",
                name: "Requirement coverage",
                status: "pass",
                reason: "98% of planned requirements covered by executed cases.",
                evaluatedAt: "2026-07-10T00:00:00.000Z",
                evaluator: "coverage-engine",
              },
            ],
            approvals: [],
            audit: [],
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
          meta: { correlationId: "pw-apztcms-010-rg-tcms-wb" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { total: 0 },
        meta: { correlationId: "pw-apztcms-010-rg-tcms-wb" },
      }),
    });
  });
}

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
    await mockTestingWorkbenchApi(page);
    await gotoTestingSection(page, TESTING_ROUTES.dashboard);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Dashboard/i);
    await expect(page.getByTestId("testing-dashboard-stats")).toBeVisible({
      timeout: 30_000,
    });
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
    await mockTestingWorkbenchApi(page);
    const detailPath = `${TESTING_ROUTES.certification}/${CERTIFICATION_ID}`;
    const certResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        response.url().includes(`/api/v1/testing/certifications/${CERTIFICATION_ID}`),
      { timeout: 45_000 },
    );
    await gotoTestingSection(page, detailPath);
    expect((await certResponse).ok()).toBeTruthy();
    await expect(page.getByTestId("testing-page")).toBeVisible({ timeout: 45_000 });
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
