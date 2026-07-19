import { expect, test } from "@playwright/test";

import { PROJECT_ID, mockProjectsApi, signIn } from "./projects-ui-cert-helpers";

/**
 * APZHUB-PROJECTS-001 UI certification — Workbench product surface.
 * Engine branding must remain hidden; Platform HTTP only.
 */
test.describe("APZHUB-PROJECTS-001 UI certification", () => {
  test("certifies Projects Workbench navigation and core views", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText(/plane/i)).toHaveCount(0);

    await page.goto("/workspace/projects/list");
    await expect(page.getByTestId("projects-list-filters")).toBeVisible();
    await page.getByTestId("projects-filter-search").fill("Alpha");
    await expect(page.getByText("Delivery Alpha")).toBeVisible();

    await page.goto(`/workspace/projects/${PROJECT_ID}/tasks`);
    await expect(page.getByTestId("projects-tab-tasks")).toBeVisible();
    await expect(page.getByText("Ship Workbench UI")).toBeVisible();

    await page.goto("/workspace/projects/tasks");
    await expect(page.getByTestId("projects-tasks-picker")).toBeVisible();
    await expect(
      page.getByTestId("projects-tasks-picker").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-tasks-picker").selectOption(PROJECT_ID);
    await expect(page.getByText("Ship Workbench UI")).toBeVisible();

    await page.goto("/workspace/projects/backlog");
    await expect(
      page.getByTestId("projects-backlog-picker").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-backlog-picker").selectOption(PROJECT_ID);
    await expect(page.getByTestId("projects-page")).toBeVisible();

    await page.goto("/workspace/projects/sprints");
    await expect(
      page.getByTestId("projects-sprints-picker").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-sprints-picker").selectOption(PROJECT_ID);
    await expect(page.getByTestId("projects-page")).toBeVisible();

    await page.goto("/workspace/projects/roadmap");
    await expect(
      page.getByTestId("projects-roadmap-picker").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-roadmap-picker").selectOption(PROJECT_ID);
    await expect(page.getByTestId("projects-page")).toBeVisible();

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
