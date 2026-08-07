import { expect, test } from "@playwright/test";

import { DASHBOARD_ID, mockAnalyticsApi, signIn } from "./analytics-workbench-helpers";

test.describe("APZHUB Analytics Workbench (Decision Companion)", () => {
  test("open question-first home, question detail, and insight answer", async ({
    page,
  }) => {
    await signIn(page);
    await mockAnalyticsApi(page);

    await page.goto("/workspace/analytics");
    await expect(page.getByTestId("analytics-page")).toBeVisible();
    await expect(page.getByTestId("analytics-home-horizons")).toBeVisible();
    await expect(page.getByTestId("analytics-home-questions")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

    await page.goto("/workspace/analytics/questions");
    await expect(page.getByTestId("analytics-questions-catalogue")).toBeVisible();

    await page.getByTestId("analytics-question-row-EQ-E01").click();
    await expect(page).toHaveURL(/\/workspace\/analytics\/questions\/EQ-E01/, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("analytics-decision-context")).toBeVisible();

    await page.goto("/workspace/analytics/executive");
    await expect(page.getByTestId("analytics-suite-executive")).toBeVisible();
    await expect(page.getByText("Executive Overview")).toBeVisible();

    await page.getByTestId(`analytics-dashboard-row-${DASHBOARD_ID}`).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/analytics/dashboards/${DASHBOARD_ID}`),
      { timeout: 15_000 },
    );
    await expect(page.getByTestId("analytics-dashboard-detail")).toBeVisible();
    await expect(page.getByTestId("analytics-dashboard-title")).toHaveText(
      "Executive Overview",
    );
  });

  test("horizons, help, settings, and administrative surfaces", async ({ page }) => {
    await signIn(page);
    await mockAnalyticsApi(page);

    await page.goto("/workspace/analytics/horizons/operational");
    await expect(page.getByTestId("analytics-horizon-operational")).toBeVisible();

    await page.goto("/workspace/analytics/help");
    await expect(page.getByTestId("analytics-help")).toBeVisible();

    await page.goto("/workspace/analytics/settings");
    await expect(page.getByTestId("analytics-settings")).toBeVisible();

    await page.goto("/workspace/analytics/datasets");
    await expect(page.getByTestId("analytics-datasets-table")).toBeVisible();

    await page.goto("/workspace/analytics/reports");
    await expect(page.getByTestId("analytics-reports-table")).toBeVisible();

    await page.goto("/workspace/analytics/saved");
    await expect(page.getByTestId("analytics-saved-create")).toBeVisible();
    await expect(page.getByTestId("analytics-saved-row-saved_exec_mine")).toBeVisible();

    await page.goto("/workspace/analytics/search");
    await page.getByTestId("analytics-search-q").fill("Executive");
    await page.getByTestId("analytics-search-submit").click();
    await expect(page.getByTestId("analytics-search-results")).toBeVisible();
    await expect(page.getByText("Executive Overview")).toBeVisible();

    await page.goto("/workspace/analytics/health");
    await expect(page.getByTestId("analytics-health-platform")).toBeVisible();
    await expect(page.getByTestId("analytics-health-status")).toHaveText("healthy");

    await page.goto("/workspace/analytics/diagnostics");
    await expect(page.getByTestId("analytics-diagnostics-panel")).toBeVisible();
  });

  test("analytics pages expose accessible landmarks", async ({ page }) => {
    await signIn(page);
    await mockAnalyticsApi(page);

    await page.goto("/workspace/analytics");
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByTestId("analytics-page")).toBeVisible();

    await page.goto("/workspace/analytics/health");
    await expect(page.getByRole("heading", { level: 1, name: "Health" })).toBeVisible();
  });
});
