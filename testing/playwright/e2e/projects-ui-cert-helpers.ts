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

  await page.route("**/api/v1/projects**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    if (method === "GET" && url.pathname.endsWith("/projects")) {
      await json(route, {
        data: [mutableProject],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && url.pathname.endsWith("/projects")) {
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

    if (method === "PATCH" && url.pathname.includes(`/projects/${PROJECT_ID}`)) {
      const body = request.postDataJSON() as Record<string, unknown>;
      mutableProject = {
        ...mutableProject,
        ...body,
        updatedAt: "2026-01-03T00:00:00.000Z",
      };
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    if (method === "DELETE" && url.pathname.includes(`/projects/${PROJECT_ID}`)) {
      mutableProject = { ...mutableProject, status: "archived" };
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    if (method === "GET" && url.pathname.includes(`/projects/${PROJECT_ID}`)) {
      await json(route, { data: mutableProject, meta: meta() });
      return;
    }

    if (method === "GET" && url.pathname.includes(`/projects/${CREATED_PROJECT_ID}`)) {
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
