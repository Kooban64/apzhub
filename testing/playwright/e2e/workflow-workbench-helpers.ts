import { type Page, type Route } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

export { DEV_EMAIL, DEV_PASSWORD };

export const DEFINITION_ID = "wf_e2e_demo";
export const RUN_ID = "wrun_e2e_1";
export const SCHEDULE_ID = "wsch_e2e_1";
export const TASK_ID = "wtask_e2e_1";
export const APPROVAL_ID = "wtask_e2e_approval";

export function meta() {
  return { requestId: "req_workflow_e2e", correlationId: "corr_workflow_e2e" };
}

export function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

export function definition(overrides: Record<string, unknown> = {}) {
  return {
    id: DEFINITION_ID,
    tenantId: "tenant_e2e",
    key: "e2e_demo",
    name: "E2E Demo Workflow",
    description: "Workflow workbench e2e definition",
    lifecycle: "published",
    currentVersionId: "wver_e2e_1",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
    ...overrides,
  };
}

export function run(overrides: Record<string, unknown> = {}) {
  return {
    id: RUN_ID,
    workflowId: DEFINITION_ID,
    status: "running",
    correlationId: "corr_workflow_e2e",
    startedAt: "2026-07-19T00:00:00.000Z",
    ...overrides,
  };
}

export async function signIn(page: Page): Promise<void> {
  await signInDevUser(page);
}

export async function mockWorkflowApi(page: Page): Promise<void> {
  await page.route("**/api/v1/workflow/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path.endsWith("/workflow/health") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "healthy",
            checkedAt: "2026-07-19T00:00:00.000Z",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/readiness") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            readiness: "ready_with_limitations",
            reasons: ["e2e-mock"],
            workflowEnabled: true,
            runtimePlaneEnabled: true,
            providerExecuteSupported: false,
            opsProviderId: "mock",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/capabilities") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            capabilities: [{ id: "cap_runs", support: "supported" }],
            providers: [{ id: "mock" }],
            workflowEnabled: true,
            providerExecuteSupported: false,
            httpApiVersion: "1.0.0",
            workbenchReady: true,
            productReady: false,
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/business-journeys") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "bj_e2e_1",
                name: "E2E Project Approval",
                summary: "Approve project proposals",
                outcomes: ["Approved"],
                stages: [
                  { id: "st_1", name: "Submitted", order: 1 },
                  { id: "st_2", name: "Decision", order: 2 },
                ],
                transitions: [],
                processOwner: "PMO",
                businessSteward: "Steward",
                version: 1,
                publicationStatus: "approved",
                createdAt: "2026-08-01T00:00:00.000Z",
                updatedAt: "2026-08-08T00:00:00.000Z",
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (
      path.includes("/workflow/business-journeys/") &&
      path.endsWith("/audit") &&
      method === "GET"
    ) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { items: [] },
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/business-journeys/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "bj_e2e_1",
            name: "E2E Project Approval",
            summary: "Approve project proposals",
            outcomes: ["Approved"],
            stages: [
              { id: "st_1", name: "Submitted", order: 1 },
              { id: "st_2", name: "Decision", order: 2 },
            ],
            transitions: [],
            processOwner: "PMO",
            businessSteward: "Steward",
            version: 1,
            publicationStatus: "approved",
            createdAt: "2026-08-01T00:00:00.000Z",
            updatedAt: "2026-08-08T00:00:00.000Z",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/process-instances") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { items: [] },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/process-templates") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "bpt_e2e_1",
                key: "project-approval",
                name: "Project Approval",
                summary: "Template",
                defaultOutcomes: ["Approved"],
                version: 1,
                editable: true,
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/process-monitoring") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            activeInstances: 0,
            stalledStages: 0,
            overdueTransitions: 0,
            completedCount: 0,
            completionRatePercent: 0,
            byStage: [],
            computedAt: "2026-08-08T00:00:00.000Z",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/definitions") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [definition()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/definitions/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: definition(), meta: meta() }),
      });
    }

    if (path.endsWith("/workflow/runs") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [run()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    if (
      path.includes("/workflow/runs/") &&
      path.endsWith("/cancel") &&
      method === "POST"
    ) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: run({ status: "cancelled" }),
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/runs/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: run(), meta: meta() }),
      });
    }

    if (path.endsWith("/workflow/runs") && method === "POST") {
      // V1.0 honesty — execute gated (matches production readiness default).
      return route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "PROVIDER_EXECUTE_NOT_SUPPORTED",
            message: "Provider execute is not enabled for this deployment.",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/schedules") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: SCHEDULE_ID,
              workflowId: DEFINITION_ID,
              cron: "0 * * * *",
              timezone: "UTC",
              status: "armed",
            },
          ],
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/schedules/") && method === "PATCH") {
      const body = request.postDataJSON() as { status?: string };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: SCHEDULE_ID,
            workflowId: DEFINITION_ID,
            cron: "0 * * * *",
            status: body.status ?? "paused",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/tasks") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: TASK_ID,
              kind: "manual",
              status: "open",
              title: "E2E Task",
              runId: RUN_ID,
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/tasks/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: TASK_ID,
            kind: "manual",
            status: "open",
            title: "E2E Task",
            runId: RUN_ID,
          },
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/tasks/") && method === "PATCH") {
      const body = request.postDataJSON() as { action?: string };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: TASK_ID,
            kind: "manual",
            status: body.action === "complete" ? "completed" : "claimed",
            title: "E2E Task",
            runId: RUN_ID,
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/approvals") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: APPROVAL_ID,
              kind: "approval",
              status: "open",
              title: "E2E Approval",
              runId: RUN_ID,
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    if (path.includes("/workflow/approvals/") && method === "PATCH") {
      const body = request.postDataJSON() as { decision?: string };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: APPROVAL_ID,
            kind: "approval",
            status: "completed",
            title: "E2E Approval",
            decision: body.decision ?? "approved",
            runId: RUN_ID,
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/workflow/notifications") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "wnotif_e2e_1",
              templateKey: "workflow.run.cancelled",
              runId: RUN_ID,
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "NOT_FOUND", message: `Unhandled mock: ${method} ${path}` },
        meta: meta(),
      }),
    });
  });
}
