import { expect, test } from "@playwright/test";

import {
  APPROVAL_ID,
  DEFINITION_ID,
  RUN_ID,
  SCHEDULE_ID,
  TASK_ID,
  mockWorkflowApi,
  signIn,
} from "./workflow-workbench-helpers";

test.describe("APZHUB Workflow Workbench (WORKFLOW-006)", () => {
  test("open Workflow home, definitions, and definition detail", async ({ page }) => {
    await signIn(page);
    await mockWorkflowApi(page);

    await page.goto("/workspace/workflow");
    await expect(page.getByTestId("workflow-page")).toBeVisible();
    await expect(page.getByTestId("workflow-home-links")).toBeVisible();

    await page.goto("/workspace/workflow/definitions");
    await expect(page.getByTestId("workflow-definitions-table")).toBeVisible();
    await expect(page.getByText("E2E Demo Workflow")).toBeVisible();

    await page.getByTestId(`workflow-definition-row-${DEFINITION_ID}`).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/workflow/definitions/${DEFINITION_ID}`),
      { timeout: 15_000 },
    );
    await expect(page.getByTestId("workflow-definition-detail")).toBeVisible();
  });

  test("runs, schedules, tasks, approvals, notifications, search, health, diagnostics, capabilities", async ({
    page,
  }) => {
    await signIn(page);
    await mockWorkflowApi(page);

    await page.goto("/workspace/workflow/runs");
    await expect(page.getByTestId("workflow-runs-table")).toBeVisible();
    await page.getByTestId(`workflow-run-row-${RUN_ID}`).click();
    await expect(page.getByTestId("workflow-run-detail")).toBeVisible();

    await page.goto("/workspace/workflow/schedules");
    await expect(page.getByTestId("workflow-schedules-table")).toBeVisible();
    await page.getByTestId(`workflow-schedule-row-${SCHEDULE_ID}`).click();
    await expect(page.getByTestId("workflow-schedule-detail")).toBeVisible();

    await page.goto("/workspace/workflow/tasks");
    await expect(page.getByTestId("workflow-tasks-table")).toBeVisible();
    await page.getByTestId(`workflow-task-row-${TASK_ID}`).click();
    await expect(page.getByTestId("workflow-task-detail")).toBeVisible();

    await page.goto("/workspace/workflow/approvals");
    await expect(page.getByTestId("workflow-approvals-table")).toBeVisible();
    await page.getByTestId(`workflow-approval-row-${APPROVAL_ID}`).click();
    await expect(page.getByTestId("workflow-approval-detail")).toBeVisible();

    await page.goto("/workspace/workflow/notifications");
    await expect(page.getByTestId("workflow-notifications-table")).toBeVisible();

    await page.goto("/workspace/workflow/search");
    await page.getByTestId("workflow-search-q").fill("E2E");
    await page.getByTestId("workflow-search-submit").click();
    await expect(page.getByTestId("workflow-search-results")).toBeVisible();
    await expect(page.getByText("E2E Demo Workflow")).toBeVisible();

    await page.goto("/workspace/workflow/health");
    await expect(page.getByTestId("workflow-health-platform")).toBeVisible();
    await expect(page.getByTestId("workflow-health-status")).toHaveText("healthy");

    await page.goto("/workspace/workflow/diagnostics");
    await expect(page.getByTestId("workflow-diagnostics-panel")).toBeVisible();

    await page.goto("/workspace/workflow/capabilities");
    await expect(page.getByTestId("workflow-capabilities-panel")).toBeVisible();
    await expect(page.getByTestId("workflow-capabilities-http")).toHaveText("1.0.0");
  });

  test("workflow pages expose accessible landmarks", async ({ page }) => {
    await signIn(page);
    await mockWorkflowApi(page);

    await page.goto("/workspace/workflow");
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("APZ Workflow").first()).toBeVisible();
    await expect(page.getByTestId("workflow-page")).toBeVisible();

    await page.goto("/workspace/workflow/health");
    await expect(
      page.getByRole("heading", { level: 1, name: "Workflow Health" }),
    ).toBeVisible();
  });
});
