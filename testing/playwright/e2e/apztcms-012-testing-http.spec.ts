import { expect, test, type Page } from "@playwright/test";

import {
  expectTestingHeading,
  expectTestingPageVisible,
  gotoTestingSection,
  signIn,
  TESTING_ROUTES,
} from "./testing-ui-helpers";

async function mockTestingHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/testing/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    if (url.pathname === "/api/v1/testing/dashboard") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            headline: "Testing & Certification overview",
            metrics: { requirements: 4, executions: 2, certifications: 1, defects: 0 },
            recentCertifications: [],
            recentExecutions: [],
          },
          meta: { correlationId: "pw-apztcms-012" },
        }),
      });
      return;
    }

    if (url.pathname === "/api/v1/testing/plans") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "plan-playwright-apztcms-012",
              name: "APZTCMS-012 Playwright HTTP Plan",
              status: "ready",
              versionNumber: 1,
              suiteIds: ["suite-playwright"],
              updatedAt: "2026-07-10T00:00:00.000Z",
            },
          ],
          page: { total: 1 },
          meta: { correlationId: "pw-apztcms-012" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], page: { total: 0 }, meta: { correlationId: "pw-apztcms-012" } }),
    });
  });
}

test.describe("APZTCMS-012 Testing HTTP client workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens workbench and lists plans through mocked /api/v1/testing", async ({ page }) => {
    const seen: string[] = [];
    await mockTestingHttpApi(page, seen);

    await gotoTestingSection(page, TESTING_ROUTES.dashboard);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Dashboard/i);

    await gotoTestingSection(page, TESTING_ROUTES.plans);
    await expectTestingHeading(page, /Test plans/i);
    await expect(page.getByText("APZTCMS-012 Playwright HTTP Plan")).toBeVisible();

    expect(seen).toContain("/api/v1/testing/dashboard");
    expect(seen).toContain("/api/v1/testing/plans");
  });
});
