import { expect, test } from "@playwright/test";
import path from "node:path";

import { PROJECT_ID, WORKSPACE_ID, mockProjectsApi } from "./projects-ui-cert-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");

test.describe("APZHUB-PROJECTS-001 Workbench", () => {
  test.use({ storageState: authFile });

  test("open Projects list and project cockpit", async ({ page }) => {
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
    await page.goto("/workspace/projects/list");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await expect(page.getByText("Delivery Alpha").first()).toBeVisible();

    await page.getByTestId(`projects-list-row-${PROJECT_ID}`).click();
    await expect(page).toHaveURL(new RegExp(`/workspace/projects/${PROJECT_ID}`), {
      timeout: 15_000,
    });
    await expect(page.getByTestId("projects-cockpit")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("projects-intent-overview")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("open initiate project wizard", async ({ page }) => {
    test.setTimeout(60_000);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects/new");
    await expect(page.getByTestId("projects-initiate-wizard")).toBeVisible();
    await expect(
      page.getByTestId("projects-create-workspace").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-create-workspace").selectOption(WORKSPACE_ID);
    await page.getByTestId("projects-create-name").fill("Printer Ops");
    await page.getByTestId("projects-create-identifier").fill("PRINT");
    await page.getByTestId("projects-create-submit").click();
    // Multi-stage initiation wizard advances past Stage 1 (Release 3.0).
    await expect(page.getByText(/Stage 2/i)).toBeVisible({ timeout: 15_000 });
  });

  test("search and health surfaces", async ({ page }) => {
    test.setTimeout(60_000);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects/search");
    await page.getByTestId("projects-search-q").fill("Delivery");
    await page.getByTestId("projects-search-submit").click();
    await expect(page.getByTestId("projects-search-results")).toBeVisible();

    await page.goto("/workspace/projects/health");
    await expect(page.getByTestId("projects-health-platform")).toBeVisible();
    await expect(page.getByTestId("projects-health-status")).toHaveText("ok");
  });
});
