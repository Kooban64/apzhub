import { expect, test, type Page } from "@playwright/test";

import {
  expectTestingHeading,
  expectTestingPageVisible,
  gotoTestingSection,
  signIn,
} from "./testing-ui-helpers";

const PIPELINES_HOME = "/workspace/testing/pipelines";
const PIPELINES_RUNS = "/workspace/testing/pipelines/repos/acme/portal/runs";

async function mockPipelineHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/testing/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    if (url.pathname === "/api/v1/testing/pipelines") {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "pipe_playwright_018",
                key: "portal-ci",
                name: "APZTCMS-018 Playwright Pipeline",
                providerKind: "github_actions",
                status: "active",
                repositoryRef: "acme/portal",
                updatedAt: "2026-07-10T00:00:00.000Z",
              },
            ],
            page: { total: 1 },
            meta: { correlationId: "pw-apztcms-018" },
          }),
        });
        return;
      }
    }

    if (url.pathname === "/api/v1/testing/pipelines/providers") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ kind: "github_actions", version: "1.0.0" }],
          page: { total: 1 },
          meta: { correlationId: "pw-apztcms-018" },
        }),
      });
      return;
    }

    if (url.pathname === "/api/v1/testing/pipelines/repositories/acme/portal/runs") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "99",
              name: "CI",
              status: "passed",
              workflowId: "7",
              runNumber: 99,
              branch: "main",
              commit: "abc1234",
              actorRef: "ci-bot",
              durationMs: 120000,
              startedAt: "2026-07-10T00:00:00.000Z",
            },
          ],
          page: { total: 1 },
          meta: { correlationId: "pw-apztcms-018" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { total: 0 },
        meta: { correlationId: "pw-apztcms-018" },
      }),
    });
  });
}

test.describe("APZTCMS-018 Pipeline workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens pipelines section through mocked /api/v1/testing", async ({ page }) => {
    const seen: string[] = [];
    await mockPipelineHttpApi(page, seen);

    await gotoTestingSection(page, PIPELINES_HOME);
    await expectTestingPageVisible(page);
    await expectTestingHeading(page, /Pipelines/i);
    await expect(page.getByText("APZTCMS-018 Playwright Pipeline")).toBeVisible();

    expect(seen).toContain("/api/v1/testing/pipelines");
    expect(seen).toContain("/api/v1/testing/pipelines/providers");
  });

  test("opens workflow runs and asserts a11y landmarks", async ({ page }) => {
    const seen: string[] = [];
    await mockPipelineHttpApi(page, seen);

    await gotoTestingSection(page, PIPELINES_RUNS);
    await expectTestingHeading(page, /Workflow runs/i);
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByText("CI")).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(0);

    expect(seen).toContain("/api/v1/testing/pipelines/repositories/acme/portal/runs");
  });
});
