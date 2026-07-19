import { expect, test } from "@playwright/test";

import {
  CREATED_TIMESHEET_ID,
  TIMESHEET_ID,
  mockTimeApi,
  signIn,
} from "./time-ui-cert-helpers";

test.describe("APZ Time 1.0.0 Workbench", () => {
  test("open Time timesheets list and detail", async ({ page }) => {
    await signIn(page);
    await mockTimeApi(page);

    await page.goto("/workspace/time");
    await expect(page.getByTestId("time-page")).toBeVisible();

    await page.goto("/workspace/time/timesheets");
    await expect(page.getByTestId("time-page")).toBeVisible();
    await expect(page.getByText("Client delivery block")).toBeVisible();

    await page.getByTestId(`time-timesheet-row-${TIMESHEET_ID}`).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/time/timesheets/${TIMESHEET_ID}`),
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByTestId("time-timesheet-detail")).toBeVisible();
  });

  test("create timesheet", async ({ page }) => {
    test.setTimeout(60_000);
    await signIn(page);
    await mockTimeApi(page);

    await page.goto("/workspace/time/timesheets/new");
    await expect(page.getByTestId("time-timesheet-create-form")).toBeVisible();
    await page.getByTestId("time-timesheet-create-description").fill("Sprint planning");

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/v1/time/timesheets") &&
          response.request().method() === "POST" &&
          response.ok(),
      ),
      page.getByTestId("time-timesheet-create-submit").click(),
    ]);

    await expect(page).toHaveURL(
      new RegExp(`/workspace/time/timesheets/${CREATED_TIMESHEET_ID}`),
      { timeout: 15_000 },
    );
  });

  test("search, health, and diagnostics surfaces", async ({ page }) => {
    await signIn(page);
    await mockTimeApi(page);

    await page.goto("/workspace/time/search");
    await page.getByTestId("time-search-q").fill("delivery");
    await page.getByTestId("time-search-submit").click();
    await expect(page.getByTestId("time-search-results")).toBeVisible();

    await page.goto("/workspace/time/health");
    await expect(page.getByTestId("time-health-platform")).toBeVisible();
    await expect(page.getByTestId("time-health-status")).toHaveText("ok");

    await page.goto("/workspace/time/diagnostics");
    await expect(page.getByTestId("time-diagnostics-panel")).toBeVisible();
    await page.getByTestId("time-connection-test").click();
    await expect(page.getByTestId("time-connection-result")).toBeVisible();
  });
});
