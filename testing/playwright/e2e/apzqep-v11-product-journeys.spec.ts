import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * QX-HD-01 / H1 — V1.1 product journeys: automation · SCM · QI · dashboards.
 * Mocked API; asserts operable shell surfaces (no intermittent empty shells).
 */

async function fulfillJson(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

async function mockAutomationApi(page: Page) {
  await page.route("**/api/v1/qep/automation/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path.endsWith("/executions") && route.request().method() === "GET") {
      await fulfillJson(route, {
        executions: [
          {
            executionId: "exec_e2e_1",
            providerId: "playwright",
            state: "succeeded",
            resultSummary: "Dry-run OK",
          },
        ],
      });
      return;
    }
    if (path.endsWith("/providers")) {
      await fulfillJson(route, {
        providers: [{ providerId: "playwright", status: "ready", name: "Playwright" }],
      });
      return;
    }
    if (path.includes("/executions/")) {
      await fulfillJson(route, {
        execution: {
          executionId: "exec_e2e_1",
          providerId: "playwright",
          state: "succeeded",
          resultSummary: "Dry-run OK",
          timeline: [],
          artifacts: [],
          evidenceRefs: [],
        },
      });
      return;
    }
    await fulfillJson(route, {});
  });
}

async function mockScmApi(page: Page) {
  await page.route("**/api/v1/qep/scm/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/repositories") && route.request().method() === "GET") {
      await fulfillJson(route, {
        repositories: [
          {
            repositoryId: "repo_e2e_1",
            fullName: "apzor/apzhub",
            providerId: "github",
            state: "active",
            defaultBranch: "main",
            health: { ok: true },
          },
        ],
      });
      return;
    }
    if (path.endsWith("/providers")) {
      await fulfillJson(route, {
        providers: [{ providerId: "github", status: "ready", name: "GitHub" }],
      });
      return;
    }
    if (path.endsWith("/webhooks")) {
      await fulfillJson(route, { deliveries: [] });
      return;
    }
    await fulfillJson(route, {});
  });
}

async function mockQiApi(page: Page) {
  await page.route("**/api/v1/qep/quality-intelligence/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/recommendations") && route.request().method() === "GET") {
      await fulfillJson(route, {
        recommendations: [
          {
            recommendationId: "rec_e2e_1",
            type: "strengthen_regression_coverage",
            priority: "high",
            reason: "Coverage gap on release path",
            status: "open",
            providerId: "rules",
            confidence: { level: "medium", numeric: 0.62 },
          },
        ],
      });
      return;
    }
    if (path.endsWith("/providers")) {
      await fulfillJson(route, {
        providers: [{ providerId: "rules", status: "ready", name: "Rules" }],
      });
      return;
    }
    if (path.endsWith("/signals") || path.endsWith("/observations")) {
      await fulfillJson(route, { signals: [], observations: [] });
      return;
    }
    if (path.endsWith("/scores")) {
      await fulfillJson(route, { scores: [] });
      return;
    }
    await fulfillJson(route, {});
  });
}

async function mockDashboardsApi(page: Page) {
  await page.route("**/api/v1/qep/dashboards**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (method === "GET" && path.endsWith("/dashboards")) {
      await fulfillJson(route, {
        dashboards: [
          {
            dashboardId: "qep-executive",
            name: "Executive Dashboard",
            audience: "executive",
            description: "E2E fixture",
          },
        ],
      });
      return;
    }

    if (method === "GET" && path.includes("/dashboards/qep-executive")) {
      await fulfillJson(route, {
        dashboard: {
          dashboard: {
            dashboardId: "qep-executive",
            name: "Executive Dashboard",
            description: "E2E fixture",
            audience: "executive",
          },
          widgets: [
            {
              instance: { instanceId: "w1", widgetId: "overall" },
              descriptor: {
                title: "Overall Quality Score",
                kind: "kpi",
                projectionQueryId: "qep.qi.scores.overall",
              },
            },
          ],
          columns: 3,
        },
        projections: {
          "qep.qi.scores.overall": {
            kind: "kpi",
            attribution: "empty:no_system_of_record_binding",
            descriptor: {
              title: "Overall Quality Score",
              value: "No data",
            },
          },
        },
      });
      return;
    }

    if (path.endsWith("/views")) {
      await fulfillJson(route, { pinned: [] });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function expectNoCriticalAxe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(serious).toEqual([]);
}

test.describe("QX-HD-01 H1 product journeys", () => {
  test("automation home lists executions", async ({ page }) => {
    await signInDevUser(page);
    await mockAutomationApi(page);
    await page.goto("/workspace/qep/automation");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Enterprise Automation")).toBeVisible();
    await expect(page.getByText("exec_e2e")).toBeVisible();
    await expect(page.getByText("Dry-run OK")).toBeVisible();
  });

  test("scm home lists repositories", async ({ page }) => {
    await signInDevUser(page);
    await mockScmApi(page);
    await page.goto("/workspace/qep/scm");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Enterprise Source Control")).toBeVisible();
    await expect(page.getByText("apzor/apzhub")).toBeVisible();
  });

  test("quality intelligence home lists recommendations", async ({ page }) => {
    await signInDevUser(page);
    await mockQiApi(page);
    await page.goto("/workspace/qep/quality-intelligence");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Enterprise Quality Intelligence")).toBeVisible();
    await expect(page.getByText("strengthen_regression_coverage")).toBeVisible();
  });

  test("dashboards home and detail show honest empty KPI", async ({ page }) => {
    await signInDevUser(page);
    await mockDashboardsApi(page);
    await page.goto("/workspace/qep/dashboards");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText("Enterprise Dashboard & Quality Experience"),
    ).toBeVisible();
    await expect(page.getByText("Executive Dashboard")).toBeVisible();

    await page.goto("/workspace/qep/dashboards/view/qep-executive");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("No data")).toBeVisible();
    await expect(page.getByText(/Honest empty/i)).toBeVisible();
  });

  test("automation / scm / qi / dashboards have no critical axe violations", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await signInDevUser(page);
    await mockAutomationApi(page);
    await mockScmApi(page);
    await mockQiApi(page);
    await mockDashboardsApi(page);

    for (const path of [
      "/workspace/qep/automation",
      "/workspace/qep/scm",
      "/workspace/qep/quality-intelligence",
      "/workspace/qep/dashboards",
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
      await expectNoCriticalAxe(page);
    }
  });
});
