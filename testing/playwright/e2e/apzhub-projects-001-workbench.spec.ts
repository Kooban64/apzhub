import { expect, test } from "@playwright/test";

import {
  CREATED_PROJECT_ID,
  PROJECT_ID,
  WORKSPACE_ID,
  mockProjectsApi,
  signIn,
} from "./projects-ui-cert-helpers";

test.describe("APZHUB-PROJECTS-001 Workbench", () => {
  test("open Projects list and project detail", async ({ page }) => {
    await signIn(page);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await page.goto("/workspace/projects/list");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await expect(page.getByText("Delivery Alpha")).toBeVisible();

    await page.getByTestId(`projects-list-row-${PROJECT_ID}`).click();
    await expect(page).toHaveURL(new RegExp(`/workspace/projects/${PROJECT_ID}`), {
      timeout: 15_000,
    });
    await expect(page.getByTestId("projects-detail-overview")).toBeVisible();
    await expect(page.getByText(/ALPHA · Updated/)).toBeVisible();
  });

  test("create project", async ({ page }) => {
    test.setTimeout(60_000);
    await signIn(page);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects");
    await page.goto("/workspace/projects/new");
    await expect(page.getByTestId("projects-create-form")).toBeVisible();
    await expect(
      page.getByTestId("projects-create-workspace").locator("option"),
    ).toHaveCount(2, { timeout: 15_000 });
    await page.getByTestId("projects-create-workspace").selectOption(WORKSPACE_ID);
    await page.getByTestId("projects-create-name").click();
    await page.getByTestId("projects-create-name").fill("Printer Ops");
    await page.getByTestId("projects-create-identifier").fill("PRINT");

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/v1/projects") &&
          response.request().method() === "POST" &&
          response.ok(),
      ),
      page.getByTestId("projects-create-submit").click(),
    ]);

    await expect(page).toHaveURL(
      new RegExp(`/workspace/projects/${CREATED_PROJECT_ID}`),
      { timeout: 15_000 },
    );
  });

  test("search and health surfaces", async ({ page }) => {
    await signIn(page);
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
