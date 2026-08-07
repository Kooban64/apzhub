import { expect, test } from "@playwright/test";
import path from "node:path";

import { PROJECT_ID, mockProjectsApi } from "./projects-ui-cert-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");

/**
 * APZHUB-PROJECTS Release 3.0 UI certification — Operational Workspace + core surfaces.
 * Engine branding must remain hidden; Platform HTTP only.
 */
test.describe("APZHUB-PROJECTS-001 UI certification", () => {
  test.use({ storageState: authFile });

  test("certifies Projects Operational Workspace navigation and core views", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByTestId("projects-breadcrumbs").getByText("Operational Workspace"),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("operational-queue")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/plane/i)).toHaveCount(0);

    await page.goto("/workspace/projects/list");
    await expect(page.getByTestId("projects-list-filters")).toBeVisible();
    await page.getByTestId("projects-filter-search").fill("Alpha");
    await expect(page.getByText("Delivery Alpha")).toBeVisible();

    await page.goto(`/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("projects-cockpit")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByLabel("Cockpit focus")).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/workspace/projects/tasks");
    await expect(page.getByTestId("projects-tasks-picker")).toBeVisible();
    await expect(
      page
        .getByTestId("projects-tasks-picker")
        .locator(`option[value="${PROJECT_ID}"]`),
    ).toBeAttached({ timeout: 20_000 });
    await page.getByTestId("projects-tasks-picker").selectOption(PROJECT_ID);
    await expect(page.getByText("Ship Workbench UI")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/workspace/projects/search");
    await page.getByTestId("projects-search-q").fill("Delivery");
    await page.getByTestId("projects-search-submit").click();
    await expect(page.getByTestId("projects-search-results")).toBeVisible();

    await page.goto("/workspace/projects/health");
    await expect(page.getByTestId("projects-health-platform")).toBeVisible();
    await expect(page.getByTestId("projects-diagnostics")).toBeVisible();
    await expect(page.getByTestId("projects-audit")).toBeVisible();
  });
});
