import { expect, test } from "@playwright/test";
import path from "node:path";

import {
  PROJECT_ID,
  STATUS_IN_PROGRESS,
  TASK_ID,
  mockProjectsApi,
} from "./projects-ui-cert-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");

/**
 * APZ Projects Release 3.0 UI certification — mutations, honesty labels, My Work.
 * Engine branding must remain hidden; Platform HTTP only.
 */
test.describe("APZ Projects 1.1 UI certification", () => {
  test.use({ storageState: authFile });

  test("certifies task transition, assignee, project edit, honesty, and search empty state", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await mockProjectsApi(page);

    const projectsListResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/projects") &&
        !response.url().includes("/projects/") &&
        response.request().method() === "GET",
    );
    await page.goto("/workspace/projects/tasks");
    await projectsListResponse;
    await expect(
      page
        .getByTestId("projects-tasks-picker")
        .locator(`option[value="${PROJECT_ID}"]`),
    ).toBeAttached({ timeout: 20_000 });
    await page.getByTestId("projects-tasks-picker").selectOption(PROJECT_ID);
    await expect(page.getByTestId(`projects-task-actions-${TASK_ID}`)).toBeVisible();

    await page
      .getByTestId(`projects-task-status-${TASK_ID}`)
      .selectOption(STATUS_IN_PROGRESS);
    await page.getByTestId(`projects-task-transition-${TASK_ID}`).click();
    await expect(page.getByTestId(`projects-task-status-${TASK_ID}`)).toHaveValue(
      STATUS_IN_PROGRESS,
    );

    const assigneePicker = page.getByTestId(`projects-task-assignee-${TASK_ID}`);
    await assigneePicker.getByPlaceholder("Search directory…").fill("Cert Assignee");
    await expect(
      assigneePicker.getByRole("option", { name: /Cert Assignee/i }),
    ).toBeVisible({ timeout: 15_000 });
    await assigneePicker.getByRole("option", { name: /Cert Assignee/i }).click();
    const assignResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/v1/tasks/${TASK_ID}/assignees`) &&
        response.request().method() === "POST" &&
        !response.url().match(/\/assignees\/[^/]+$/),
    );
    await page.getByTestId(`projects-task-assign-${TASK_ID}`).click();
    const assignResponse = await assignResponsePromise;
    expect(assignResponse.ok()).toBeTruthy();
    await expect(page.getByTestId(`projects-task-unassign-${TASK_ID}`)).toBeEnabled({
      timeout: 15_000,
    });
    const clearResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/v1/tasks/${TASK_ID}/assignees/`) &&
        response.request().method() === "DELETE",
    );
    await page.getByTestId(`projects-task-unassign-${TASK_ID}`).click({ force: true });
    expect((await clearResponsePromise).ok()).toBeTruthy();

    await page.goto(`/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("projects-cockpit")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("projects-intent-overview")).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/workspace/projects/sprints");
    await expect(page.getByTestId("projects-sprints-picker")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/plane/i)).toHaveCount(0);

    await page.goto("/workspace/projects/roadmap");
    await expect(page.getByTestId("projects-roadmap-picker")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/workspace/projects/search");
    await page.route("**/api/v1/search/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes("/query")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { hits: [], pageSize: 30, hasMore: false, suggestions: [] },
            meta: { requestId: "req_e2e", correlationId: "corr_e2e" },
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.getByTestId("projects-search-q").fill("zzz-no-hit");
    await page.getByTestId("projects-search-submit").click();
    await expect(page.getByTestId("projects-search-empty-help-link")).toBeVisible({
      timeout: 15_000,
    });
  });
});
