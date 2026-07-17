import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const WORKFLOWS_HOME = "/workspace/workflows";

async function mockWorkflowsHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/workflows**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname + url.search);

    if (url.pathname.endsWith("/workflows/diagnostics")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            workflowEnabled: true,
            executionEnabled: false,
            engineConfigured: false,
            persistenceMode: "memory",
            capabilities: {
              metadataCrud: true,
              lifecycle: true,
              validation: true,
              templates: true,
              categories: true,
              folders: true,
              audit: true,
              execution: false,
              schedules: false,
              n8n: false,
            },
            platformServicesVersion: "pw",
          },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (
      url.pathname.endsWith("/workflows/capabilities") ||
      url.pathname.endsWith("/workflows/health") ||
      url.pathname.endsWith("/workflows/readiness")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            workflowEnabled: true,
            executionEnabled: false,
            engineConfigured: false,
            persistenceMode: "memory",
            capabilities: {
              metadataCrud: true,
              lifecycle: true,
              validation: true,
              templates: true,
              categories: true,
              folders: true,
              audit: true,
              execution: false,
              schedules: false,
              n8n: false,
            },
            healthy: true,
            ready: true,
            status: "ok",
          },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/workflows/templates")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wft_pw_1",
              key: "pw-template",
              name: "Playwright Template",
              lifecycle: "draft",
              createdAt: "2026-07-15T10:00:00.000Z",
              updatedAt: "2026-07-15T10:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/workflows/categories")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wfc_pw_1",
              name: "General",
              createdAt: "2026-07-15T10:00:00.000Z",
              updatedAt: "2026-07-15T10:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/workflows/folders")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wff_pw_1",
              name: "Root",
              path: "/",
              createdAt: "2026-07-15T10:00:00.000Z",
              updatedAt: "2026-07-15T10:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (/\/workflows\/[^/]+\/versions\/[^/]+$/.test(url.pathname)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "wfv_pw_1",
            workflowId: "wf_pw_1",
            versionNumber: 1,
            status: "draft",
            lifecycle: "draft",
            createdAt: "2026-07-15T10:00:00.000Z",
            createdBy: "user_pw",
            graph: {
              nodes: [
                {
                  id: "node_trigger",
                  nodeKind: "trigger",
                  kind: "manual",
                  label: "Start",
                },
                {
                  id: "node_action",
                  nodeKind: "action",
                  kind: "notify",
                  label: "Notify",
                },
              ],
              connections: [
                {
                  id: "conn_1",
                  sourceNodeId: "node_trigger",
                  targetNodeId: "node_action",
                },
              ],
            },
            triggers: [{ id: "t1", kind: "manual", label: "Start" }],
            actions: [{ id: "a1", kind: "notify", label: "Notify" }],
            variables: [],
            parameters: [],
            conditions: [],
            connections: [
              {
                id: "conn_1",
                sourceNodeId: "node_trigger",
                targetNodeId: "node_action",
              },
            ],
          },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (/\/workflows\/[^/]+\/versions$/.test(url.pathname)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wfv_pw_1",
              workflowId: "wf_pw_1",
              versionNumber: 1,
              status: "draft",
              lifecycle: "draft",
              createdAt: "2026-07-15T10:00:00.000Z",
              createdBy: "user_pw",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (/\/workflows\/[^/]+\/audit$/.test(url.pathname)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wfa_pw_1",
              workflowId: "wf_pw_1",
              action: "workflow.created",
              actorUserId: "user_pw",
              createdAt: "2026-07-15T10:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (
      /\/workflows\/[^/]+$/.test(url.pathname) &&
      route.request().method() === "GET" &&
      !url.pathname.endsWith("/workflows")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "wf_pw_1",
            key: "pw-onboarding",
            name: "Playwright Onboarding",
            description: "PW mock workflow",
            lifecycle: "draft",
            currentVersionId: "wfv_pw_1",
            categoryId: "wfc_pw_1",
            folderId: "wff_pw_1",
            createdAt: "2026-07-15T10:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_pw",
            updatedBy: "user_pw",
          },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/workflows") || url.pathname.endsWith("/workflows/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wf_pw_1",
              key: "pw-onboarding",
              name: "Playwright Onboarding",
              lifecycle: "draft",
              currentVersionId: "wfv_pw_1",
              updatedAt: "2026-07-15T12:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzworkflow-004" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { limit: 0, hasMore: false },
        meta: { correlationId: "pw-apzworkflow-004" },
      }),
    });
  });
}

test.describe("APZWORKFLOW-004 Platform Workflows workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens Workflows workbench through mocked /api/v1/workflows", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockWorkflowsHttpApi(page, seen);

    await page.goto(WORKFLOWS_HOME, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workflows-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { level: 1, name: /Overview/i }),
    ).toBeVisible();
    await expect(page.getByText("Playwright Onboarding")).toBeVisible();
    await expect(page.getByTestId("card-execution-status")).toContainText(
      "Workflow Execution Not Available",
    );

    expect(seen.some((p) => p.includes("/api/v1/workflows"))).toBe(true);
  });

  test("exposes command toolbar and diagnostics panel", async ({ page }) => {
    const seen: string[] = [];
    await mockWorkflowsHttpApi(page, seen);

    await page.goto(WORKFLOWS_HOME, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workflows-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("toolbar", { name: /Workflows commands/i }),
    ).toBeVisible();

    await page.goto(`${WORKFLOWS_HOME}/diagnostics`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("workflows-diagnostics-panel")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("diagnostics-execution-status")).toContainText(
      "Workflow Execution Not Available",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("workflows-page")).toBeVisible();
  });
});
