import type { FetchFn } from "../internal/kimai-fetch-client";
import type { KimaiConfigurationInput } from "../kimai-config";

export const TEST_TENANT_ID = "tenant_kimai_test";
export const TEST_CORRELATION_ID = "corr_kimai_test";

export const DEFAULT_TEST_KIMAI_CONFIG: KimaiConfigurationInput = {
  baseUrl: "https://kimai.example.test",
  apiBaseUrl: "https://kimai.example.test/api",
  authMode: "bearer",
  apiTokenRef: "secret://kimai/api-token",
};

export const MOCK_KIMAI_VERSION = {
  version: "2.24.0",
  kimai: "Kimai 2",
  name: "Kimai",
};

export interface MockKimaiApiOptions {
  readonly failAuth?: boolean;
  readonly failPing?: boolean;
  readonly failVersion?: boolean;
  readonly version?: string;
  readonly requireBearer?: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emptyResponse(status = 200): Response {
  return new Response(null, { status });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== "string") return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pathAfterApi(url: string): string {
  const marker = "/api";
  const index = url.indexOf(marker);
  if (index < 0) return url;
  return url.slice(index + marker.length).split("?")[0] ?? "";
}

/**
 * In-memory Kimai CE mock — foundation + domain CRUD for adapter tests.
 */
export function createMockKimaiFetch(options: MockKimaiApiOptions = {}): FetchFn {
  let nextId = 100;
  const customers = new Map<number, Record<string, unknown>>([
    [1, { id: 1, name: "Acme", number: "C-1", visible: true }],
  ]);
  const projects = new Map<number, Record<string, unknown>>([
    [1, { id: 1, name: "Portal", customer: 1, visible: true }],
  ]);
  const activities = new Map<number, Record<string, unknown>>([
    [1, { id: 1, name: "Development", comment: null, project: 1, visible: true }],
  ]);
  const tags = new Map<number, Record<string, unknown>>([
    [1, { id: 1, name: "billable", color: "#112233" }],
  ]);
  const timesheets = new Map<number, Record<string, unknown>>();

  return async (input: string, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const authorization = headers.get("Authorization");
    const legacyUser = headers.get("X-AUTH-USER");
    const legacyToken = headers.get("X-AUTH-TOKEN");

    const hasBearer =
      typeof authorization === "string" &&
      authorization.startsWith("Bearer ") &&
      authorization.slice("Bearer ".length).trim().length > 0;
    const hasLegacy = Boolean(legacyUser && legacyToken);

    if (options.failAuth || (!hasBearer && !hasLegacy)) {
      return jsonResponse(
        {
          code: 401,
          message: "Full authentication is required to access this resource.",
        },
        401,
      );
    }

    if (options.requireBearer && !hasBearer) {
      return jsonResponse({ code: 401, message: "Unauthorized" }, 401);
    }

    const path = pathAfterApi(url);

    if (path === "/ping") {
      if (options.failPing) {
        return jsonResponse({ code: 500, message: "ping failed" }, 500);
      }
      return emptyResponse(200);
    }

    if (path === "/version") {
      if (options.failVersion) {
        return jsonResponse({ code: 404, message: "Not Found" }, 404);
      }
      return jsonResponse({
        ...MOCK_KIMAI_VERSION,
        version: options.version ?? MOCK_KIMAI_VERSION.version,
      });
    }

    // Customers
    if (path === "/customers" && method === "GET") {
      return jsonResponse([...customers.values()]);
    }
    if (path === "/customers" && method === "POST") {
      const body = parseBody(init);
      const id = nextId++;
      const record = {
        id,
        name: String(body.name ?? "Customer"),
        number: body.number ?? null,
        visible: body.visible !== false,
      };
      customers.set(id, record);
      return jsonResponse(record, 201);
    }
    const customerMatch = /^\/customers\/(\d+)$/.exec(path);
    if (customerMatch) {
      const id = Number(customerMatch[1]);
      const current = customers.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      if (method === "GET") return jsonResponse(current);
      if (method === "PATCH") {
        const body = parseBody(init);
        const next = { ...current, ...body, id };
        customers.set(id, next);
        return jsonResponse(next);
      }
    }

    // Projects
    if (path === "/projects" && method === "GET") {
      return jsonResponse([...projects.values()]);
    }
    if (path === "/projects" && method === "POST") {
      const body = parseBody(init);
      const id = nextId++;
      const record = {
        id,
        name: String(body.name ?? "Project"),
        customer: body.customer ?? null,
        visible: body.visible !== false,
      };
      projects.set(id, record);
      return jsonResponse(record, 201);
    }
    const projectMatch = /^\/projects\/(\d+)$/.exec(path);
    if (projectMatch) {
      const id = Number(projectMatch[1]);
      const current = projects.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      if (method === "GET") return jsonResponse(current);
      if (method === "PATCH") {
        const body = parseBody(init);
        const next = { ...current, ...body, id };
        projects.set(id, next);
        return jsonResponse(next);
      }
    }

    // Activities
    if (path === "/activities" && method === "GET") {
      return jsonResponse([...activities.values()]);
    }
    if (path === "/activities" && method === "POST") {
      const body = parseBody(init);
      const id = nextId++;
      const record = {
        id,
        name: String(body.name ?? "Activity"),
        comment: body.comment ?? null,
        project: body.project ?? null,
        visible: body.visible !== false,
      };
      activities.set(id, record);
      return jsonResponse(record, 201);
    }
    const activityMatch = /^\/activities\/(\d+)$/.exec(path);
    if (activityMatch) {
      const id = Number(activityMatch[1]);
      const current = activities.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      if (method === "GET") return jsonResponse(current);
      if (method === "PATCH") {
        const body = parseBody(init);
        const next = { ...current, ...body, id };
        activities.set(id, next);
        return jsonResponse(next);
      }
    }

    // Tags
    if (path === "/tags" && method === "GET") {
      return jsonResponse([...tags.values()]);
    }
    if (path === "/tags" && method === "POST") {
      const body = parseBody(init);
      const id = nextId++;
      const record = {
        id,
        name: String(body.name ?? "tag"),
        color: body.color ?? null,
      };
      tags.set(id, record);
      return jsonResponse(record, 201);
    }
    const tagMatch = /^\/tags\/(\d+)$/.exec(path);
    if (tagMatch) {
      const id = Number(tagMatch[1]);
      const current = tags.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      if (method === "GET") return jsonResponse(current);
      if (method === "PATCH") {
        const body = parseBody(init);
        const next = { ...current, ...body, id };
        tags.set(id, next);
        return jsonResponse(next);
      }
      if (method === "DELETE") {
        tags.delete(id);
        return emptyResponse(204);
      }
    }

    // Timesheets
    if (path === "/timesheets" && method === "GET") {
      return jsonResponse([...timesheets.values()]);
    }
    if (path === "/timesheets" && method === "POST") {
      const body = parseBody(init);
      const id = nextId++;
      const begin = String(body.begin ?? "2026-07-19T10:00:00");
      const record = {
        id,
        begin,
        end: body.end ?? null,
        duration: 0,
        description: body.description ?? null,
        activity: body.activity ?? null,
        project: body.project ?? null,
        customer: body.customer ?? null,
        user: 1,
        tags: body.tags ?? [],
        billable: body.billable !== false,
      };
      timesheets.set(id, record);
      return jsonResponse(record, 201);
    }
    const stopMatch = /^\/timesheets\/(\d+)\/stop$/.exec(path);
    if (stopMatch && method === "PATCH") {
      const id = Number(stopMatch[1]);
      const current = timesheets.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      const end = "2026-07-19T11:00:00";
      const next = {
        ...current,
        end,
        duration: 3600,
      };
      timesheets.set(id, next);
      return jsonResponse(next);
    }
    const timesheetMatch = /^\/timesheets\/(\d+)$/.exec(path);
    if (timesheetMatch) {
      const id = Number(timesheetMatch[1]);
      const current = timesheets.get(id);
      if (!current) return jsonResponse({ code: 404, message: "Not Found" }, 404);
      if (method === "GET") return jsonResponse(current);
      if (method === "PATCH") {
        const body = parseBody(init);
        const next = { ...current, ...body, id };
        timesheets.set(id, next);
        return jsonResponse(next);
      }
      if (method === "DELETE") {
        timesheets.delete(id);
        return emptyResponse(204);
      }
    }

    return jsonResponse({ code: 404, message: "Not Found" }, 404);
  };
}
