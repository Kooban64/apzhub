import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { DEFINITION_ID, mockWorkflowApi, signIn } from "./workflow-workbench-helpers";

/**
 * APZ Workflow V1.0 Hardening — WF-H1 · WF-H2 · WF-H3
 * Mocked API; Delivery Standard closeout evidence.
 */

const PRIMARY_SURFACES = [
  { path: "/workspace/workflow", heading: "Home", testId: "workflow-page" },
  {
    path: "/workspace/workflow/journeys",
    heading: "Business journeys",
    testId: "workflow-journey-catalogue",
  },
  {
    path: "/workspace/workflow/templates",
    heading: "Workflow template library",
    testId: "workflow-template-library",
  },
  {
    path: "/workspace/workflow/monitoring",
    heading: "Process monitoring",
    testId: "workflow-process-monitoring",
  },
] as const;

const BUDGETS = {
  headingReadyMs: 5_000,
} as const;

async function openWorkflowSurface(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("WF-H1 APZ Workflow V1.0 product journeys", () => {
  test("Home → Journeys → detail → templates → monitoring", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockWorkflowApi(page);

    await page.goto("/workspace/workflow");
    await expect(page.getByTestId("workflow-page")).toBeVisible();
    await expect(page.getByTestId("workflow-home-open-catalogue")).toBeVisible();
    await page.getByTestId("workflow-home-open-catalogue").click();
    await expect(page).toHaveURL(/\/workspace\/workflow\/journeys/);
    await expect(page.getByTestId("workflow-journey-catalogue")).toBeVisible();
    await expect(page.getByTestId("workflow-journey-bj_e2e_1")).toBeVisible();
    await page.getByTestId("workflow-journey-bj_e2e_1").click();
    await expect(page).toHaveURL(/\/workspace\/workflow\/journeys\/bj_e2e_1/);
    await expect(page.getByTestId("workflow-journey-detail")).toBeVisible();

    await page.goto("/workspace/workflow/templates");
    await expect(page.getByTestId("workflow-template-library")).toBeVisible();
    await expect(page.getByTestId("workflow-template-project-approval")).toBeVisible();

    await page.goto("/workspace/workflow/monitoring");
    await expect(page.getByTestId("workflow-process-monitoring")).toBeVisible();
  });

  test("execute honesty — Start run hidden and gated disclosure visible", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockWorkflowApi(page);
    await page.goto(`/workspace/workflow/definitions/${DEFINITION_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("workflow-definition-detail")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("workflow-definition-start-run")).toHaveCount(0);
    await expect(page.getByTestId("workflow-definition-execute-gated")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("workflow-definition-execute-gated")).toContainText(
      /gated/i,
    );
  });
});

test.describe("WF-H2 APZ Workflow V1.0 accessibility", () => {
  test("primary surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockWorkflowApi(page);

    for (const surface of PRIMARY_SURFACES) {
      await openWorkflowSurface(page, surface.path, surface.testId);
      await expect(
        page.getByRole("heading", { level: 1, name: surface.heading }),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      );
      expect(
        blocking,
        `${surface.path}\n${blocking.map((v) => `${v.id}: ${v.help}`).join("\n")}`,
      ).toEqual([]);
    }
  });
});

test.describe("WF-H3 APZ Workflow V1.0 performance", () => {
  test("warm-shell heading budgets on primary surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockWorkflowApi(page);

    // Warm compile excluded from budgets.
    await openWorkflowSurface(page, "/workspace/workflow", "workflow-page");

    for (const surface of PRIMARY_SURFACES) {
      await openWorkflowSurface(page, surface.path, surface.testId);
      const t0 = Date.now();
      await expect(
        page.getByRole("heading", { level: 1, name: surface.heading }),
      ).toBeVisible({ timeout: 20_000 });
      const ms = Date.now() - t0;
      expect(ms, `${surface.path} heading budget`).toBeLessThanOrEqual(
        BUDGETS.headingReadyMs,
      );
    }
  });
});
