import { expect, test, type Page } from "@playwright/test";

import {
  expectTestingHeading,
  expectTestingPageVisible,
  gotoTestingSection,
  signIn,
} from "./testing-ui-helpers";

const DASH_HOME = "/workspace/testing/executive-dashboards";
const DASH_QA = "/workspace/testing/executive-dashboards/qa";

async function mockEiHttp(page: Page, seen: string[]) {
  await page.route("**/api/v1/testing/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    const score = {
      id: "qs_pw",
      score: 78.5,
      computedAt: "2026-07-12T12:00:00.000Z",
      scope: {},
      inputs: {
        coverage: 80,
        automation: 70,
        manualExecution: 30,
        failedTests: 5,
        openDefects: 10,
        certification: 90,
        approvals: 85,
        releaseReadiness: 75,
      },
      components: [],
    };
    const risk = {
      overallScore: 22,
      overallLevel: "low",
      factors: [{ key: "quality", score: 15, level: "low", reasons: ["pw"] }],
      computedAt: "2026-07-12T12:00:00.000Z",
    };
    const health = {
      status: "watch",
      overallScore: 76,
      qualityScore: 78.5,
      stabilityScore: 80,
      releaseReadinessScore: 75,
      riskScore: 22,
      coverageScore: 80,
      automationScore: 70,
      certificationScore: 90,
      pipelineHealthScore: 95,
      computedAt: "2026-07-12T12:00:00.000Z",
      isDecision: false,
      risk,
    };

    if (url.pathname.endsWith("/engineering-intelligence/score")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: score, meta: { correlationId: "pw-023" } }),
      });
      return;
    }
    if (url.pathname.endsWith("/engineering-intelligence/health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: health, meta: { correlationId: "pw-023" } }),
      });
      return;
    }
    if (url.pathname.endsWith("/engineering-intelligence/risk")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: risk, meta: { correlationId: "pw-023" } }),
      });
      return;
    }
    if (url.pathname.endsWith("/engineering-intelligence/trends")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "trend_quality",
              kind: "quality",
              direction: "improving",
              delta: 5,
              periodKind: "weekly",
              points: [{ at: "2026-07-12T12:00:00.000Z", value: 78.5 }],
              computedAt: "2026-07-12T12:00:00.000Z",
            },
          ],
          page: { total: 1 },
          meta: { correlationId: "pw-023" },
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
        meta: { correlationId: "pw-023" },
      }),
    });
  });
}

test.describe("APZTCMS-023 Executive Dashboards", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens executive dashboard via mocked EI APIs", async ({ page }) => {
    const seen: string[] = [];
    await mockEiHttp(page, seen);

    await gotoTestingSection(page, DASH_HOME);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Executive Dashboards/i);
    await expect(page.getByTestId("dashboard-executive")).toBeVisible();
    await expect(
      page.getByRole("tablist", { name: /Dashboard categories/i }),
    ).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();

    expect(seen).toContain("/api/v1/testing/engineering-intelligence/score");
    expect(seen).toContain("/api/v1/testing/engineering-intelligence/health");
  });

  test("opens QA dashboard and remains responsive", async ({ page }) => {
    const seen: string[] = [];
    await mockEiHttp(page, seen);

    await gotoTestingSection(page, DASH_QA);
    await expect(page.getByTestId("dashboard-qa")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("heading", { name: /Executive Dashboards/i }),
    ).toBeVisible();
  });
});
