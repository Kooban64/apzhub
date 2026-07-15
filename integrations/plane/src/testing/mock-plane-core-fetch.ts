import type { FetchFn } from "../internal/plane-fetch-client";
import {
  MOCK_ACTIVITY,
  MOCK_COMMENT,
  MOCK_CYCLE,
  MOCK_ISSUE,
  MOCK_LABEL,
  MOCK_MEMBER,
  MOCK_MODULE,
  MOCK_PROJECT,
  MOCK_STATE,
  MOCK_SUBSCRIBER,
  MOCK_WORKSPACE,
  paginate,
} from "./mock-plane-core-data";
import { createMockPlaneFetch, type MockPlaneApiOptions } from "./mock-plane-api";

interface MutableStore {
  projects: typeof MOCK_PROJECT[];
  states: typeof MOCK_STATE[];
  labels: typeof MOCK_LABEL[];
  cycles: typeof MOCK_CYCLE[];
  modules: typeof MOCK_MODULE[];
  members: typeof MOCK_MEMBER[];
  issues: typeof MOCK_ISSUE[];
  comments: typeof MOCK_COMMENT[];
  activities: typeof MOCK_ACTIVITY[];
  subscribers: typeof MOCK_SUBSCRIBER[];
  webhooks: Array<{
    id: string;
    url: string;
    is_active: boolean;
    secret_key: string | null;
    project: boolean;
    issue: boolean;
    cycle: boolean;
    module: boolean;
    issue_comment: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

function filterByUpdatedAt<T extends { updated_at?: string; created_at?: string }>(
  items: readonly T[],
  url: string,
): T[] {
  const parsed = new URL(url);
  let result = [...items];
  const updatedGte = parsed.searchParams.get("updated_at__gte");
  if (updatedGte) {
    result = result.filter((item) => (item.updated_at ?? item.created_at ?? "") >= updatedGte);
  }
  const updatedLte = parsed.searchParams.get("updated_at__lte");
  if (updatedLte) {
    result = result.filter((item) => (item.updated_at ?? item.created_at ?? "") <= updatedLte);
  }
  return result;
}


function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== "string") {
    return {};
  }
  return JSON.parse(init.body) as Record<string, unknown>;
}

function nextId(prefix: string, items: readonly { id: string }[]): string {
  return `${prefix}-${String(items.length + 1).padStart(3, "0")}`;
}

export function pathnameOf(input: string): string {
  return new URL(input).pathname;
}

function filterIssues(
  issues: typeof MOCK_ISSUE[],
  url: string,
): typeof MOCK_ISSUE[] {
  const parsed = new URL(url);
  let result = [...issues];

  const archived = parsed.searchParams.get("archived");
  if (archived === "true") {
    result = result.filter((item) => Boolean(item.archived_at));
  } else if (archived === "false") {
    result = result.filter((item) => !item.archived_at);
  }

  const state = parsed.searchParams.get("state");
  if (state) {
    result = result.filter((item) => {
      const stateId = typeof item.state === "string" ? item.state : item.state?.id;
      return stateId === state;
    });
  }

  const priority = parsed.searchParams.get("priority");
  if (priority) {
    result = result.filter((item) => item.priority === priority);
  }

  const assignees = parsed.searchParams.get("assignees");
  if (assignees) {
    result = result.filter((item) =>
      (item.assignees ?? []).some((entry) =>
        typeof entry === "string" ? entry === assignees : entry.id === assignees,
      ),
    );
  }

  const labels = parsed.searchParams.get("labels");
  if (labels) {
    result = result.filter((item) =>
      (item.labels ?? []).some((entry) =>
        typeof entry === "string" ? entry === labels : entry.id === labels,
      ),
    );
  }

  const cycle = parsed.searchParams.get("cycle");
  if (cycle) {
    result = result.filter((item) => item.cycle === cycle);
  }

  const moduleId = parsed.searchParams.get("module");
  if (moduleId) {
    result = result.filter((item) => item.module === moduleId);
  }

  const parent = parsed.searchParams.get("parent");
  if (parent) {
    result = result.filter((item) => item.parent === parent);
  }

  const search = parsed.searchParams.get("search");
  if (search) {
    const needle = search.toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(needle));
  }

  const createdGte = parsed.searchParams.get("created_at__gte");
  if (createdGte) {
    result = result.filter((item) => item.created_at >= createdGte);
  }
  const createdLte = parsed.searchParams.get("created_at__lte");
  if (createdLte) {
    result = result.filter((item) => item.created_at <= createdLte);
  }
  const updatedGte = parsed.searchParams.get("updated_at__gte");
  if (updatedGte) {
    result = result.filter((item) => item.updated_at >= updatedGte);
  }
  const updatedLte = parsed.searchParams.get("updated_at__lte");
  if (updatedLte) {
    result = result.filter((item) => item.updated_at <= updatedLte);
  }

  return result;
}

/** Full Plane core API mock for contract tests (includes issues/tasks). */
export function createMockPlaneCoreFetch(
  options: MockPlaneApiOptions = {},
): FetchFn {
  const baseFetch = createMockPlaneFetch(options);
  const store: MutableStore = {
    projects: [{ ...MOCK_PROJECT }],
    states: [{ ...MOCK_STATE }],
    labels: [{ ...MOCK_LABEL }],
    cycles: [{ ...MOCK_CYCLE }],
    modules: [{ ...MOCK_MODULE }],
    members: [{ ...MOCK_MEMBER }],
    issues: [{ ...MOCK_ISSUE }],
    comments: [{ ...MOCK_COMMENT }],
    activities: [{ ...MOCK_ACTIVITY }],
    subscribers: [{ ...MOCK_SUBSCRIBER }],
    webhooks: [
      {
        id: "webhook-001",
        url: "https://hooks.example.com/plane",
        is_active: true,
        secret_key: "secret-present",
        project: true,
        issue: true,
        cycle: false,
        module: false,
        issue_comment: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  };

  let projectListCalls = 0;

  return async (input: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const headers = init?.headers as Record<string, string> | undefined;
    const pathname = pathnameOf(input);

    if (!headers?.["X-Api-Key"] && options.requireApiKey !== false) {
      return jsonResponse({ error_code: "INVALID_TOKEN", message: "Missing API key" }, 401);
    }

    if (
      options.unsupportedEndpoints?.some((endpoint) => pathname.includes(endpoint))
    ) {
      return jsonResponse(
        { error_code: "NOT_FOUND", message: "Unsupported endpoint" },
        404,
      );
    }

    if (pathname.includes("/api/instances/")) {
      return baseFetch(input, init);
    }

    if (pathname.endsWith("/api/workspaces/") && method === "GET") {
      return jsonResponse(paginate([MOCK_WORKSPACE]));
    }

    if (pathname.match(/\/api\/workspaces\/[^/]+\/$/) && method === "GET") {
      return baseFetch(input, init);
    }

    // Webhooks
    if (pathname.includes("/webhooks/")) {
      if (options.rateLimitWebhooks) {
        return jsonResponse({ error_code: "RATE_LIMITED", message: "Too many requests" }, 429);
      }
      if (options.webhookStatus && options.webhookStatus >= 400) {
        return jsonResponse(
          {
            error_code: options.webhookStatus === 404 ? "WEBHOOK_NOT_FOUND" : "WEBHOOK_FAILED",
            message: "Webhook operation failed",
          },
          options.webhookStatus,
        );
      }

      if (pathname.endsWith("/webhooks/") && method === "GET") {
        return jsonResponse(paginate(store.webhooks));
      }

      if (pathname.endsWith("/webhooks/") && method === "POST") {
        const body = parseBody(init);
        const created = {
          id: nextId("webhook", store.webhooks),
          url: String(body.url ?? "https://hooks.example.com/plane"),
          is_active: body.is_active !== false,
          secret_key: "generated-secret",
          project: Boolean(body.project),
          issue: Boolean(body.issue),
          cycle: Boolean(body.cycle),
          module: Boolean(body.module),
          issue_comment: Boolean(body.issue_comment),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        store.webhooks.push(created);
        return jsonResponse(created, 201);
      }

      const webhookMatch = pathname.match(/\/webhooks\/([^/]+)\/$/);
      if (webhookMatch) {
        const webhookId = webhookMatch[1]!;
        const index = store.webhooks.findIndex((item) => item.id === webhookId);
        if (method === "GET") {
          return index >= 0
            ? jsonResponse(store.webhooks[index])
            : jsonResponse({ error_code: "WEBHOOK_NOT_FOUND" }, 404);
        }
        if (method === "PATCH" && index >= 0) {
          const body = parseBody(init);
          store.webhooks[index] = {
            ...store.webhooks[index]!,
            url: body.url !== undefined ? String(body.url) : store.webhooks[index]!.url,
            is_active:
              body.is_active !== undefined
                ? Boolean(body.is_active)
                : store.webhooks[index]!.is_active,
            project:
              body.project !== undefined
                ? Boolean(body.project)
                : store.webhooks[index]!.project,
            issue:
              body.issue !== undefined ? Boolean(body.issue) : store.webhooks[index]!.issue,
            cycle:
              body.cycle !== undefined ? Boolean(body.cycle) : store.webhooks[index]!.cycle,
            module:
              body.module !== undefined
                ? Boolean(body.module)
                : store.webhooks[index]!.module,
            issue_comment:
              body.issue_comment !== undefined
                ? Boolean(body.issue_comment)
                : store.webhooks[index]!.issue_comment,
            updated_at: new Date().toISOString(),
          };
          return jsonResponse(store.webhooks[index]);
        }
        if (method === "DELETE" && index >= 0) {
          store.webhooks.splice(index, 1);
          return jsonResponse({});
        }
        return jsonResponse({ error_code: "WEBHOOK_NOT_FOUND" }, 404);
      }
    }

    if (options.syncStatus && options.syncStatus >= 400) {
      if (pathname.endsWith("/projects/") || pathname.includes("/issues/")) {
        return jsonResponse(
          { error_code: "SYNC_FAILED", message: "Sync provider failure" },
          options.syncStatus,
        );
      }
    }

    if (pathname.endsWith("/projects/") && method === "GET") {
      projectListCalls += 1;
      if (
        options.syncInterruptAfterCalls !== undefined &&
        projectListCalls > options.syncInterruptAfterCalls
      ) {
        return jsonResponse(
          { error_code: "SYNC_FAILED", message: "Sync interrupted" },
          503,
        );
      }
      return jsonResponse(paginate(filterByUpdatedAt(store.projects, input)));
    }

    if (pathname.match(/\/projects\/[^/]+\/$/) && method === "GET") {
      const id = pathname.match(/\/projects\/([^/]+)\/$/)?.[1];
      const project = store.projects.find((item) => item.id === id);
      return project ? jsonResponse(project) : jsonResponse({ error_code: "PROJECT_NOT_FOUND" }, 404);
    }

    if (pathname.endsWith("/projects/") && method === "POST") {
      const body = parseBody(init);
      const created = {
        ...MOCK_PROJECT,
        id: nextId("proj", store.projects),
        name: String(body.name ?? "New Project"),
        identifier: String(body.identifier ?? "NEW"),
        description: body.description ? String(body.description) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.projects.push(created);
      return jsonResponse(created, 201);
    }

    if (pathname.match(/\/projects\/[^/]+\/$/) && method === "PATCH") {
      const id = pathname.match(/\/projects\/([^/]+)\/$/)?.[1];
      const index = store.projects.findIndex((item) => item.id === id);
      if (index < 0) return jsonResponse({ error_code: "PROJECT_NOT_FOUND" }, 404);
      const body = parseBody(init);
      store.projects[index] = {
        ...store.projects[index]!,
        ...body,
        name: body.name ? String(body.name) : store.projects[index]!.name,
        updated_at: new Date().toISOString(),
      } as typeof MOCK_PROJECT;
      return jsonResponse(store.projects[index]);
    }

    // Project stats
    if (pathname.endsWith("/project-stats/") && method === "GET") {
      if (options.analyticsStatus && options.analyticsStatus >= 400) {
        return jsonResponse(
          { error_code: "NOT_FOUND", message: "Analytics unavailable" },
          options.analyticsStatus,
        );
      }
      return jsonResponse([
        {
          id: MOCK_PROJECT.id,
          total_issues: store.issues.filter((item) => !item.archived_at).length,
          completed_issues: 0,
          total_members: store.members.length,
          total_cycles: store.cycles.length,
          total_modules: store.modules.length,
        },
      ]);
    }

    // Cycle progress / analytics
    const cycleProgressMatch = pathname.match(/\/cycles\/([^/]+)\/progress\/$/);
    if (cycleProgressMatch && method === "GET") {
      return jsonResponse({
        total_issues: 4,
        completed_issues: 1,
        cancelled_issues: 0,
        started_issues: 1,
        unstarted_issues: 1,
        backlog_issues: 1,
        distribution: { completed: 1, started: 1, unstarted: 1, backlog: 1 },
        completion_chart: [
          { date: "2026-04-01", completed: 0, total: 4, ideal: 4 },
          { date: "2026-04-07", completed: 1, total: 4, ideal: 2 },
          { date: "2026-04-14", completed: 1, total: 4, ideal: 0 },
        ],
      });
    }

    const cycleAnalyticsMatch = pathname.match(/\/cycles\/([^/]+)\/analytics\/$/);
    if (cycleAnalyticsMatch && method === "GET") {
      return jsonResponse({
        total_estimate_points: 10,
        completed_estimate_points: 3,
        issue_distribution: { completed: 1, started: 1, unstarted: 1, backlog: 1 },
        estimate_distribution: { completed: 3, remaining: 7 },
        completion_chart: [
          { date: "2026-04-01", completed: 0, total: 10 },
          { date: "2026-04-07", completed: 3, total: 10 },
        ],
      });
    }

    // Issues / tasks (+ nested collaboration)
    if (pathname.includes("/issues/")) {
      const commentsListMatch = pathname.match(/\/issues\/([^/]+)\/comments\/$/);
      if (commentsListMatch) {
        const issueId = commentsListMatch[1]!;
        if (method === "GET") {
          return jsonResponse(
            paginate(store.comments.filter((item) => item.issue === issueId)),
          );
        }
        if (method === "POST") {
          const body = parseBody(init);
          const created = {
            ...MOCK_COMMENT,
            id: nextId("comment", store.comments),
            issue: issueId,
            comment_html: body.comment_html ? String(body.comment_html) : "<p></p>",
            comment_stripped: body.comment_stripped
              ? String(body.comment_stripped)
              : "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          store.comments.push(created);
          return jsonResponse(created, 201);
        }
      }

      const commentItemMatch = pathname.match(/\/issues\/([^/]+)\/comments\/([^/]+)\/$/);
      if (commentItemMatch) {
        const commentId = commentItemMatch[2]!;
        const index = store.comments.findIndex((item) => item.id === commentId);
        if (method === "GET") {
          return index >= 0
            ? jsonResponse(store.comments[index])
            : jsonResponse({ error_code: "COMMENT_NOT_FOUND" }, 404);
        }
        if (method === "PATCH" && index >= 0) {
          const body = parseBody(init);
          store.comments[index] = {
            ...store.comments[index]!,
            comment_html:
              body.comment_html !== undefined
                ? String(body.comment_html)
                : store.comments[index]!.comment_html,
            comment_stripped:
              body.comment_stripped !== undefined
                ? String(body.comment_stripped)
                : store.comments[index]!.comment_stripped,
            updated_at: new Date().toISOString(),
          };
          return jsonResponse(store.comments[index]);
        }
        if (method === "DELETE" && index >= 0) {
          store.comments.splice(index, 1);
          return jsonResponse({});
        }
        if (index < 0) {
          return jsonResponse({ error_code: "COMMENT_NOT_FOUND" }, 404);
        }
      }

      const historyMatch = pathname.match(/\/issues\/([^/]+)\/history\/$/);
      if (historyMatch && method === "GET") {
        const issueId = historyMatch[1]!;
        return jsonResponse(store.activities.filter((item) => item.issue === issueId));
      }

      const subscribersListMatch = pathname.match(/\/issues\/([^/]+)\/issue-subscribers\/$/);
      if (subscribersListMatch) {
        const issueId = subscribersListMatch[1]!;
        if (method === "GET") {
          return jsonResponse(
            paginate(store.subscribers.filter((item) => item.issue === issueId)),
          );
        }
        if (method === "POST") {
          const body = parseBody(init);
          const created = {
            ...MOCK_SUBSCRIBER,
            id: nextId("sub", store.subscribers),
            issue: issueId,
            subscriber: String(body.subscriber ?? "user-002"),
            created_at: new Date().toISOString(),
          };
          store.subscribers.push(created);
          return jsonResponse(created, 201);
        }
      }

      const subscriberItemMatch = pathname.match(
        /\/issues\/([^/]+)\/issue-subscribers\/([^/]+)\/$/,
      );
      if (subscriberItemMatch && method === "DELETE") {
        const subscriberId = subscriberItemMatch[2]!;
        const index = store.subscribers.findIndex((item) => item.id === subscriberId);
        if (index < 0) {
          return jsonResponse({ error_code: "SUBSCRIBER_NOT_FOUND" }, 404);
        }
        store.subscribers.splice(index, 1);
        return jsonResponse({});
      }

      if (pathname.endsWith("/issues/") && method === "GET") {
        return jsonResponse(paginate(filterIssues(store.issues, input)));
      }

      if (pathname.endsWith("/issues/") && method === "POST") {
        const body = parseBody(init);
        const created = {
          ...MOCK_ISSUE,
          id: nextId("issue", store.issues),
          name: String(body.name ?? "New issue"),
          description_html: body.description_html ? String(body.description_html) : undefined,
          description_stripped: body.description_html
            ? String(body.description_html).replace(/<[^>]+>/g, "")
            : undefined,
          state: body.state ? String(body.state) : MOCK_ISSUE.state,
          priority: body.priority ? String(body.priority) : "none",
          assignees: Array.isArray(body.assignees)
            ? (body.assignees as string[])
            : [],
          labels: Array.isArray(body.labels) ? (body.labels as string[]) : [],
          cycle: body.cycle === undefined ? null : (body.cycle as string | null),
          module: body.module === undefined ? null : (body.module as string | null),
          parent: body.parent === undefined ? null : (body.parent as string | null),
          estimate_point:
            body.estimate_point === undefined || body.estimate_point === null
              ? null
              : Number(body.estimate_point),
          start_date: body.start_date === undefined ? null : (body.start_date as string | null),
          target_date:
            body.target_date === undefined ? null : (body.target_date as string | null),
          archived_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        store.issues.push(created);
        return jsonResponse(created, 201);
      }

      const issueMatch = pathname.match(/\/issues\/([^/]+)\/$/);
      if (issueMatch) {
        const issueId = issueMatch[1]!;
        const index = store.issues.findIndex((item) => item.id === issueId);

        if (method === "GET") {
          return index >= 0
            ? jsonResponse(store.issues[index])
            : jsonResponse({ error_code: "ISSUE_NOT_FOUND", message: "Issue not found" }, 404);
        }

        if (method === "PATCH" && index >= 0) {
          const body = parseBody(init);
          const current = store.issues[index]!;
          store.issues[index] = {
            ...current,
            name: body.name !== undefined ? String(body.name) : current.name,
            description_html:
              body.description_html !== undefined
                ? String(body.description_html)
                : current.description_html,
            state: body.state !== undefined ? (body.state as string) : current.state,
            priority:
              body.priority !== undefined ? String(body.priority) : current.priority,
            assignees:
              body.assignees !== undefined
                ? (body.assignees as string[])
                : current.assignees,
            labels:
              body.labels !== undefined ? (body.labels as string[]) : current.labels,
            cycle: body.cycle !== undefined ? (body.cycle as string | null) : current.cycle,
            module:
              body.module !== undefined ? (body.module as string | null) : current.module,
            parent:
              body.parent !== undefined ? (body.parent as string | null) : current.parent,
            estimate_point:
              body.estimate_point !== undefined
                ? (body.estimate_point as number | null)
                : current.estimate_point,
            start_date:
              body.start_date !== undefined
                ? (body.start_date as string | null)
                : current.start_date,
            target_date:
              body.target_date !== undefined
                ? (body.target_date as string | null)
                : current.target_date,
            archived_at:
              body.archived_at !== undefined
                ? (body.archived_at as string | null)
                : current.archived_at,
            updated_at: new Date().toISOString(),
          };
          return jsonResponse(store.issues[index]);
        }

        if (method === "PATCH" && index < 0) {
          return jsonResponse({ error_code: "ISSUE_NOT_FOUND" }, 404);
        }
      }
    }

    const resourceHandlers: Array<{
      segment: string;
      collection: keyof MutableStore;
      factory: (body: Record<string, unknown>, id: string) => unknown;
    }> = [
      {
        segment: "states",
        collection: "states",
        factory: (body, id) => ({
          ...MOCK_STATE,
          id,
          name: String(body.name ?? "State"),
          group: String(body.group ?? "backlog"),
        }),
      },
      {
        segment: "labels",
        collection: "labels",
        factory: (body, id) => ({
          ...MOCK_LABEL,
          id,
          name: String(body.name ?? "Label"),
          color: body.color ? String(body.color) : undefined,
        }),
      },
      {
        segment: "cycles",
        collection: "cycles",
        factory: (body, id) => ({
          ...MOCK_CYCLE,
          id,
          name: String(body.name ?? "Cycle"),
          description: body.description ? String(body.description) : undefined,
        }),
      },
      {
        segment: "modules",
        collection: "modules",
        factory: (body, id) => ({
          ...MOCK_MODULE,
          id,
          name: String(body.name ?? "Module"),
          description: body.description ? String(body.description) : undefined,
        }),
      },
      {
        segment: "members",
        collection: "members",
        factory: (body, id) => ({
          ...MOCK_MEMBER,
          id,
          member: String(body.member ?? "user-002"),
          role: Number(body.role ?? 15),
        }),
      },
    ];

    for (const handler of resourceHandlers) {
      if (pathname.endsWith(`/${handler.segment}/`) && method === "GET") {
        return jsonResponse(paginate(store[handler.collection] as unknown[]));
      }

      if (pathname.endsWith(`/${handler.segment}/`) && method === "POST") {
        const body = parseBody(init);
        const id = nextId(handler.segment.slice(0, 4), store[handler.collection] as { id: string }[]);
        const created = handler.factory(body, id);
        (store[handler.collection] as unknown[]).push(created);
        return jsonResponse(created, 201);
      }

      const itemMatch = pathname.match(new RegExp(`/${handler.segment}/([^/]+)/$`));
      if (itemMatch) {
        const resourceId = itemMatch[1];
        const items = store[handler.collection] as Array<{ id: string }>;
        const index = items.findIndex((item) => item.id === resourceId);

        if (method === "GET") {
          return index >= 0
            ? jsonResponse(items[index])
            : jsonResponse({ error_code: "NOT_FOUND" }, 404);
        }

        if (method === "PATCH" && index >= 0) {
          const body = parseBody(init);
          const updated = { ...items[index], ...body, id: resourceId };
          items[index] = updated as (typeof items)[number];
          return jsonResponse(updated);
        }

        if (method === "DELETE" && index >= 0) {
          items.splice(index, 1);
          return jsonResponse({});
        }
      }
    }

    return baseFetch(input, init);
  };
}
