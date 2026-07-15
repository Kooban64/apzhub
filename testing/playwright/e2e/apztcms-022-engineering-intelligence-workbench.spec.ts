import { expect, test, type Page } from "@playwright/test";

import {
  expectTestingHeading,
  expectTestingPageVisible,
  gotoTestingSection,
  signIn,
} from "./testing-ui-helpers";

const EI_HOME = "/workspace/testing/engineering-intelligence";

async function mockEngineeringIntelligenceHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/testing/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    const score = {
      id: "qs_pw",
      score: 78.5,
      computedAt: "2026-07-12T12:00:00.000Z",
      scope: {},
      inputs: { coverage: 80 },
      components: [
        {
          key: "coverage",
          weight: 0.15,
          input: 80,
          contribution: 12,
          inverted: false,
        },
      ],
    };

    const risk = {
      overallScore: 22,
      overallLevel: "low",
      factors: [
        { key: "quality", score: 15, level: "low", reasons: ["pw"] },
      ],
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
        body: JSON.stringify({
          data: score,
          meta: { correlationId: "pw-apztcms-022" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/engineering-intelligence/health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: health,
          meta: { correlationId: "pw-apztcms-022" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/engineering-intelligence/risk")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: risk,
          meta: { correlationId: "pw-apztcms-022" },
        }),
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
          meta: { correlationId: "pw-apztcms-022" },
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
        meta: { correlationId: "pw-apztcms-022" },
      }),
    });
  });
}

test.describe("APZTCMS-022 Engineering Intelligence workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens Engineering Intelligence through mocked /api/v1/testing", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockEngineeringIntelligenceHttpApi(page, seen);

    await gotoTestingSection(page, EI_HOME);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Engineering Intelligence/i);
    await expect(page.getByLabelText(/Quality score/i)).toBeVisible();

    expect(seen).toContain("/api/v1/testing/engineering-intelligence/score");
    expect(seen).toContain("/api/v1/testing/engineering-intelligence/health");
  });

  test("supports panel tabs and a11y landmarks", async ({ page }) => {
    const seen: string[] = [];
    await mockEngineeringIntelligenceHttpApi(page, seen);

    await gotoTestingSection(page, EI_HOME);
    await expect(
      page.getByRole("tablist", { name: /Engineering Intelligence panels/i }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Trends" }).click();
    await expect(page.getByText("Quality & delivery trends")).toBeVisible();
    await expect(page.getByLabelText("Search trends")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("heading", { name: /Engineering Intelligence/i }),
    ).toBeVisible();
  });
});
