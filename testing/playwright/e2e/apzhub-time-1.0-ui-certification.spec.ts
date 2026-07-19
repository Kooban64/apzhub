import { expect, test } from "@playwright/test";

import { mockTimeApi, signIn } from "./time-ui-cert-helpers";

/**
 * APZ Time 1.0.0 UI certification — Workbench product surface.
 * Engine branding must remain hidden; Platform HTTP only.
 */
test.describe("APZ Time 1.0.0 UI certification", () => {
  test("certifies Time Workbench navigation and core views", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await mockTimeApi(page);

    await page.goto("/workspace/time");
    await expect(page.getByTestId("time-page")).toBeVisible();
    await expect(page.getByText(/kimai/i)).toHaveCount(0);

    await page.goto("/workspace/time/timesheets");
    await expect(page.getByTestId("time-timesheets-filters")).toBeVisible();
    await expect(page.getByText("Client delivery block")).toBeVisible();

    await page.goto("/workspace/time/activities");
    await expect(page.getByTestId("time-activities-filters")).toBeVisible();
    await expect(page.getByText("Implementation")).toBeVisible();

    await page.goto("/workspace/time/customers");
    await expect(page.getByTestId("time-customers-filters")).toBeVisible();
    await expect(page.getByText("Acme Consulting")).toBeVisible();

    await page.goto("/workspace/time/tags");
    await expect(page.getByTestId("time-tags-filters")).toBeVisible();
    await expect(page.getByText("billable")).toBeVisible();

    await page.goto("/workspace/time/search");
    await page.getByTestId("time-search-q").fill("Client");
    await page.getByTestId("time-search-submit").click();
    await expect(page.getByTestId("time-search-results")).toBeVisible();

    await page.goto("/workspace/time/health");
    await expect(page.getByTestId("time-health-platform")).toBeVisible();
    await expect(page.getByTestId("time-health-diagnostics")).toBeVisible();
    await expect(page.getByTestId("time-health-audit")).toBeVisible();

    await page.goto("/workspace/time/diagnostics");
    await expect(page.getByTestId("time-diagnostics-panel")).toBeVisible();
    await expect(page.getByTestId("time-capabilities-panel")).toBeVisible();
  });
});
