import { type Page, type Route } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

export { DEV_EMAIL, DEV_PASSWORD };

export const PROJECT_ID = "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const WORKSPACE_ID = "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const TASK_ID = "task_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const TASK_ID_B = "task_dddddddddddddddddddddddddddddddd";
export const CREATED_PROJECT_ID = "proj_cccccccccccccccccccccccccccccccc";
export const STATUS_OPEN = "status_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const STATUS_IN_PROGRESS = "status_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const ASSIGNEE_ID = "user_cccccccccccccccccccccccccccccccc";

export function meta() {
  return { requestId: "req_e2e", correlationId: "corr_e2e" };
}

export function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

export function project(overrides: Record<string, unknown> = {}) {
  return {
    id: PROJECT_ID,
    tenantId: "tenant_e2e",
    workspaceId: WORKSPACE_ID,
    name: "Delivery Alpha",
    identifier: "ALPHA",
    description: "Phase 1 Projects Workbench sample",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

export function task(overrides: Record<string, unknown> = {}) {
  return {
    id: TASK_ID,
    projectId: PROJECT_ID,
    title: "Ship Workbench UI",
    status: "open",
    statusId: STATUS_OPEN,
    priority: "high",
    labelIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

let mutableProject = project();
let mutableTasks = [
  task(),
  task({
    id: TASK_ID_B,
    title: "Backlog item",
    sprintId: undefined,
    status: "in_progress",
    statusId: STATUS_IN_PROGRESS,
    priority: "medium",
  }),
];

export function resetProjectsApiFixtures() {
  mutableProject = project();
  mutableTasks = [
    task(),
    task({
      id: TASK_ID_B,
      title: "Backlog item",
      sprintId: undefined,
      status: "in_progress",
      statusId: STATUS_IN_PROGRESS,
      priority: "medium",
    }),
  ];
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function signIn(page: Page) {
  await signInDevUser(page);
}

export async function mockProjectsApi(page: Page) {
  resetProjectsApiFixtures();

  // Specific /projects/* routes MUST register before the catch-all **/projects** handler.
  await page.route("**/api/v1/projects/initiate**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await json(
      route,
      {
        data: {
          project: project({
            id: CREATED_PROJECT_ID,
            name: "Printer Ops",
            identifier: "PRINT",
          }),
          lifecycle: {
            projectId: CREATED_PROJECT_ID,
            stage: "draft",
            wizardStep: 2,
          },
        },
        meta: meta(),
      },
      201,
    );
  });

  await page.route(
    `**/api/v1/projects/${CREATED_PROJECT_ID}/lifecycle**`,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.includes("/baselines")) {
        await json(route, { data: { items: [] }, meta: meta() });
        return;
      }
      if (path.includes("readiness")) {
        await json(route, {
          data: { ready: true, gaps: [], blockers: [], warnings: [] },
          meta: meta(),
        });
        return;
      }
      await json(route, {
        data: {
          projectId: CREATED_PROJECT_ID,
          stage: "draft",
          wizardStep: 2,
        },
        meta: meta(),
      });
    },
  );

  await page.route(`**/api/v1/projects/${PROJECT_ID}/lifecycle**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes("/baselines")) {
      await json(route, { data: { items: [] }, meta: meta() });
      return;
    }
    if (path.includes("readiness")) {
      await json(route, {
        data: { ready: true, gaps: [], blockers: [], warnings: [] },
        meta: meta(),
      });
      return;
    }
    if (path.includes("/transitions")) {
      await json(route, { data: { items: [] }, meta: meta() });
      return;
    }
    await json(route, {
      data: {
        projectId: PROJECT_ID,
        stage: "active",
        wizardStep: 8,
      },
      meta: meta(),
    });
  });

  await page.route("**/api/v1/projects/workspace/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/overview")) {
      await json(route, {
        data: {
          asOf: "2026-01-02T00:00:00.000Z",
          pressureStatement: "Operational pressure is within expected bounds.",
          health: { healthy: 1, watch: 0, critical: 0 },
          confidence: { mean: 80, lowCount: 0 },
          attention: { decision: 0, attention: 0, waiting: 0 },
          delivery: { commitmentsDue7d: 0, milestonesDue7d: 0 },
          control: { criticalRisks: 0, watchRisks: 0, openDecisions: 0 },
          trend: {
            slippedMilestonesDelta: 0,
            agedWaitsDelta: 0,
            confidenceDelta: 0,
          },
        },
        meta: meta(),
      });
      return;
    }
    if (path.endsWith("/queue")) {
      await json(route, {
        data: {
          decision: [],
          attention: [],
          waitingOnOthers: [],
          approvalsUnavailable: false,
        },
        meta: meta(),
      });
      return;
    }
    if (path.includes("/portfolio")) {
      await json(route, {
        data: { items: [], sort: "attention" },
        meta: meta(),
      });
      return;
    }
    if (path.endsWith("/changes")) {
      await json(route, {
        data: { items: [] },
        meta: meta(),
      });
      return;
    }
    await json(route, { data: {}, meta: meta() });
  });

  await page.route("**/api/v1/projects**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    // Defensive: never swallow specialised Projects surfaces.
    if (
      path.includes("/projects/workspace") ||
      path.includes("/projects/initiate") ||
      path.includes("/lifecycle")
    ) {
      await route.fallback();
      return;
    }

    if (method === "GET" && /\/projects\/?$/.test(path)) {
      await json(route, {
        data: [mutableProject],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/projects")) {
      await json(
        route,
        {
          data: project({
            id: CREATED_PROJECT_ID,
            name: "Printer Ops",
            identifier: "PRINT",
          }),
          meta: meta(),
        },
        201,
      );
      return;
    }

    if (method === "PATCH" && path.includes(`/projects/${PROJECT_ID}`)) {
      const body = request.postDataJSON() as Record<string, unknown>;
      mutableProject = {
        ...mutableProject,
        ...body,
        updatedAt: "2026-01-03T00:00:00.000Z",
      };
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    if (method === "DELETE" && path.includes(`/projects/${PROJECT_ID}`)) {
      mutableProject = { ...mutableProject, status: "archived" };
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    const projectSubResource =
      path.includes(`/projects/${PROJECT_ID}/`) ||
      path.includes(`/projects/${CREATED_PROJECT_ID}/`);

    if (projectSubResource) {
      if (path.includes("/operational-health")) {
        await json(route, {
          data: {
            projectId: PROJECT_ID,
            health: "Healthy",
            summary: "Stable",
            factors: [],
          },
          meta: meta(),
        });
        return;
      }
      if (
        path.includes("/delivery-health") ||
        path.includes("/delivery-confidence") ||
        path.includes("/operational-health")
      ) {
        await json(route, {
          data: {
            projectId: PROJECT_ID,
            score: 80,
            band: "High",
            label: "Healthy",
            factors: [],
          },
          meta: meta(),
        });
        return;
      }
      if (path.includes("/pulse")) {
        await json(route, {
          data: {
            projectId: PROJECT_ID,
            statement: "On track",
            updatedAt: mutableProject.updatedAt,
          },
          meta: meta(),
        });
        return;
      }
      if (path.includes("/forecast")) {
        await json(route, {
          data: { projectId: PROJECT_ID, horizonDays: 14, points: [] },
          meta: meta(),
        });
        return;
      }
      if (
        path.includes("/commitments") ||
        path.includes("/waiting") ||
        path.includes("/milestones") ||
        path.includes("/risks") ||
        path.includes("/decisions") ||
        path.includes("/approvals") ||
        path.includes("/changes")
      ) {
        await json(route, {
          data: { items: [] },
          page: pageEnvelope(),
          meta: meta(),
        });
        return;
      }
      // Unknown project sub-resource — empty collection (do not return Project shell).
      await json(route, {
        data: { items: [] },
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith(`/projects/${PROJECT_ID}`)) {
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    if (method === "GET" && path.endsWith(`/projects/${CREATED_PROJECT_ID}`)) {
      await json(route, {
        data: project({
          id: CREATED_PROJECT_ID,
          name: "Printer Ops",
          identifier: "PRINT",
        }),
        meta: meta(),
      });
      return;
    }

    await json(route, { data: mutableProject, meta: meta() });
  });

  await page.route("**/api/v1/tasks**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === "GET" && path.endsWith("/tasks")) {
      await json(route, {
        data: mutableTasks,
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/tasks")) {
      const created = task({
        id: "task_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        title: "New task",
      });
      mutableTasks = [...mutableTasks, created];
      await json(route, { data: created, meta: meta() }, 201);
      return;
    }

    const taskMatch = path.match(/\/tasks\/(task_[a-z0-9]+)/i);
    const taskId = taskMatch?.[1];
    const current = mutableTasks.find((entry) => entry.id === taskId);

    if (method === "GET" && taskId && path.endsWith(`/tasks/${taskId}`)) {
      await json(route, { data: current ?? task({ id: taskId }), meta: meta() });
      return;
    }

    if (method === "PATCH" && taskId && path.endsWith(`/tasks/${taskId}`)) {
      const body = request.postDataJSON() as Record<string, unknown>;
      mutableTasks = mutableTasks.map((entry) =>
        entry.id === taskId ? { ...entry, ...body } : entry,
      );
      await json(route, {
        data: mutableTasks.find((entry) => entry.id === taskId),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && taskId && path.endsWith(`/tasks/${taskId}/transition`)) {
      const body = request.postDataJSON() as { statusId?: string };
      const nextStatus = body.statusId === STATUS_IN_PROGRESS ? "in_progress" : "open";
      mutableTasks = mutableTasks.map((entry) =>
        entry.id === taskId
          ? { ...entry, statusId: body.statusId ?? entry.statusId, status: nextStatus }
          : entry,
      );
      await json(route, {
        data: mutableTasks.find((entry) => entry.id === taskId),
        meta: meta(),
      });
      return;
    }

    if (
      method === "POST" &&
      taskId &&
      (path.endsWith(`/tasks/${taskId}/assignees`) ||
        path.includes(`/tasks/${taskId}/assignees`))
    ) {
      let body: { assigneeId?: string } = {};
      try {
        body = (request.postDataJSON() as { assigneeId?: string }) ?? {};
      } catch {
        const raw = request.postData();
        body = raw ? (JSON.parse(raw) as { assigneeId?: string }) : {};
      }
      mutableTasks = mutableTasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              assigneeId: body.assigneeId,
              assigneeIds: body.assigneeId ? [body.assigneeId] : [],
            }
          : entry,
      );
      await json(route, {
        data: mutableTasks.find((entry) => entry.id === taskId),
        meta: meta(),
      });
      return;
    }

    if (method === "DELETE" && taskId && path.includes(`/tasks/${taskId}/assignees/`)) {
      mutableTasks = mutableTasks.map((entry) =>
        entry.id === taskId
          ? { ...entry, assigneeId: undefined, assigneeIds: [] }
          : entry,
      );
      await json(route, {
        data: mutableTasks.find((entry) => entry.id === taskId),
        meta: meta(),
      });
      return;
    }

    await json(route, { data: [], page: pageEnvelope(), meta: meta() });
  });

  await page.route("**/api/v1/workspaces**", async (route) => {
    await json(route, {
      data: [{ id: WORKSPACE_ID, name: "Primary", slug: "primary" }],
      page: pageEnvelope(),
      meta: meta(),
    });
  });

  await page.route("**/api/v1/identity/users**", async (route) => {
    await json(route, {
      data: [
        {
          id: ASSIGNEE_ID,
          displayName: "Cert Assignee",
          email: "assignee@apzhub.local",
        },
      ],
      meta: meta(),
    });
  });

  await page.route("**/api/v1/health**", async (route) => {
    await json(route, {
      data: {
        status: "ok",
        version: "v1",
        checks: {
          process: "up",
          gateway: "ready",
          mappingStore: "ready",
          providers: "ready",
          configuration: "valid",
        },
      },
      meta: meta(),
    });
  });

  await page.route("**/api/v1/search/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/query") || url.pathname.includes("/query")) {
      const hit = {
        id: "hit_1",
        title: "Delivery Alpha",
        score: 1,
        metadata: {
          title: "Delivery Alpha",
          entityType: "project",
          entityId: PROJECT_ID,
          productId: "projects",
        },
        highlights: [],
      };
      await json(route, {
        data: {
          hits: [hit],
          pageSize: 30,
          hasMore: false,
          suggestions: [],
        },
        meta: meta(),
      });
      return;
    }
    if (url.pathname.includes("diagnostics")) {
      await json(route, {
        data: {
          health: { status: "ok", checkedAt: "2026-01-01T00:00:00.000Z" },
          capabilities: {},
          statistics: {},
        },
        meta: meta(),
      });
      return;
    }
    if (url.pathname.includes("audit")) {
      await json(route, {
        data: [
          {
            id: "saudit_1",
            action: "search.query",
            actorUserId: "user_e2e",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }
    if (url.pathname.includes("health")) {
      await json(route, {
        data: { status: "ok", checkedAt: "2026-01-01T00:00:00.000Z" },
        meta: meta(),
      });
      return;
    }
    await json(route, { data: {}, meta: meta() });
  });
}
