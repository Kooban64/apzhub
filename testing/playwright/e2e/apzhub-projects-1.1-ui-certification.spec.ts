import { expect, test } from "@playwright/test";

import {
  ASSIGNEE_ID,
  PROJECT_ID,
  STATUS_IN_PROGRESS,
  TASK_ID,
  mockProjectsApi,
  signIn,
} from "./projects-ui-cert-helpers";

/**
 * APZ Projects v1.1 UI certification — mutations, honesty labels, My Work defaults.
 * Engine branding must remain hidden; Platform HTTP only.
 */
test.describe("APZ Projects 1.1 UI certification", () => {
  test("certifies task transition, assignee, project edit, honesty, and search empty state", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockProjectsApi(page);

    await page.goto("/workspace/projects/tasks");
    await expect(
      page.getByTestId("projects-tasks-picker").locator("option"),
    ).toHaveCount(2, {
      timeout: 15_000,
    });
    await page.getByTestId("projects-tasks-picker").selectOption(PROJECT_ID);
    await expect(page.getByTestId(`projects-task-actions-${TASK_ID}`)).toBeVisible();

    await page
      .getByTestId(`projects-task-status-${TASK_ID}`)
      .selectOption(STATUS_IN_PROGRESS);
    await page.getByTestId(`projects-task-transition-${TASK_ID}`).click();
    await expect(page.getByTestId(`projects-task-status-${TASK_ID}`)).toHaveValue(
      STATUS_IN_PROGRESS,
    );

    await page.getByTestId(`projects-task-assignee-${TASK_ID}`).fill(ASSIGNEE_ID);
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
    await expect(page.getByTestId("projects-detail-edit")).toBeVisible();
    await page.getByTestId("projects-detail-edit-name").fill("Delivery Alpha Renamed");
    const patchPromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/v1/projects/${PROJECT_ID}`) &&
        response.request().method() === "PATCH",
    );
    await page.getByTestId("projects-detail-edit-save").click();
    const patchResponse = await patchPromise;
    expect(patchResponse.ok()).toBeTruthy();
    await expect(
      page.getByRole("heading", { level: 1, name: "Delivery Alpha Renamed" }),
    ).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/workspace/projects/sprints");
    await expect(page.getByTestId("projects-sprints-honesty")).toBeVisible();
    await expect(page.getByText(/plane/i)).toHaveCount(0);

    await page.goto("/workspace/projects/roadmap");
    await expect(page.getByTestId("projects-roadmap-honesty")).toBeVisible();

    await page.goto("/workspace/projects/my-work");
    await expect(page.getByTestId("projects-mywork-session-hint")).toBeVisible();
    await expect(page.getByTestId("projects-mywork-picker")).toHaveValue(PROJECT_ID);

    await page.goto("/workspace/projects/search");
    await expect(page.getByTestId("projects-search-health-link")).toBeVisible();
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
    await expect(page.getByTestId("projects-search-empty-health-link")).toBeVisible();
  });
});
