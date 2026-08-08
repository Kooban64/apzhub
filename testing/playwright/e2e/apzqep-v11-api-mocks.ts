/**
 * Shared mocked APIs for APZQEP V1.1 Hardening Playwright suites (H1/H2/…).
 */
import type { Page, Route } from "@playwright/test";

async function fulfillJson(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

export async function mockAutomationApi(page: Page) {
  await page.route("**/api/v1/qep/automation/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
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

export async function mockScmApi(page: Page) {
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

export async function mockQiApi(page: Page) {
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

export async function mockDashboardsApi(page: Page) {
  await page.route("**/api/v1/qep/dashboards**", async (route) => {
    const path = new URL(route.request().url()).pathname;
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

export async function mockEvidenceApi(page: Page) {
  await page.route("**/api/v1/qep/evidence**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (method === "GET" && path.endsWith("/evidence")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ev_e2e_1",
              title: "E2E Evidence",
              status: "captured",
              projectId: "proj_e2e",
              workspaceId: "ws_e2e",
              classification: "screenshot",
              sourceKind: "manual_upload",
              ownerId: "workbench-user",
              sealed: false,
              legalHold: false,
              updatedAt: "2026-08-07T00:00:00.000Z",
            },
          ],
          page: { total: 1, limit: 25, offset: 0 },
        }),
      });
      return;
    }

    await fulfillJson(route, {});
  });
}

export async function mockQualityFlowApi(page: Page) {
  const instance = {
    instanceId: "qfi_e2e_1",
    qualityFlowId: "qf_e2e_1",
    flowDefinitionId: "qf_continuous_cert",
    definitionVersion: "1.0.0",
    currentState: "awaiting_approval",
    paused: false,
    tenantId: "tenant_e2e",
    correlationId: "corr_e2e",
    createdAt: "2026-08-07T00:00:00.000Z",
    nextAction: "Complete required approvals",
    blockedRelease: true,
    outstandingApprovalCount: 1,
    outstandingEvidenceCount: 0,
  };

  await page.route("**/api/v1/qep/quality-flows**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();

    if (method === "GET" && path.endsWith("/quality-flows")) {
      await fulfillJson(route, {
        summary: {
          activeCount: 1,
          waitingCount: 1,
          exceptionCount: 0,
          blockedReleaseCount: 1,
          decisionCount: 0,
          definitionCount: 1,
        },
        active: [instance],
        waiting: [
          {
            instanceId: "qfi_e2e_1",
            qualityFlowId: "qf_e2e_1",
            currentState: "awaiting_approval",
            paused: false,
            nextAction: "Complete required approvals",
          },
        ],
        exceptions: [],
        recentChanges: [],
        decisions: [],
      });
      return;
    }

    if (method === "GET" && path.includes("/instances/")) {
      await fulfillJson(route, {
        instance,
        timeline: [],
        allowedTransitions: ["recommendation_ready"],
        nextAction: "Complete required approvals",
        decisions: [],
        approvals: [],
        outstandingApprovals: [],
        evidencePackages: [],
        outstandingEvidence: [],
        failedGates: [],
        blockedRelease: true,
        waiting: true,
        exception: false,
        definition: {
          name: "Continuous Certification",
          version: "1.0.0",
          description: "E2E fixture",
        },
      });
      return;
    }

    await fulfillJson(route, {});
  });
}

/** Install mocks for all H2 primary V1.1 surfaces. */
export async function mockAllV11Surfaces(page: Page) {
  await mockQualityFlowApi(page);
  await mockAutomationApi(page);
  await mockScmApi(page);
  await mockQiApi(page);
  await mockDashboardsApi(page);
  await mockEvidenceApi(page);
}

export const V11_PRIMARY_SURFACES = [
  { path: "/workspace/qep/quality-flows", heading: "Quality Flow Workspace" },
  { path: "/workspace/qep/automation", heading: "Enterprise Automation" },
  { path: "/workspace/qep/scm", heading: "Enterprise Source Control" },
  {
    path: "/workspace/qep/quality-intelligence",
    heading: "Enterprise Quality Intelligence",
  },
  {
    path: "/workspace/qep/dashboards",
    heading: "Enterprise Dashboard & Quality Experience",
  },
  { path: "/workspace/qep/evidence", heading: "Evidence" },
] as const;
