import type { FetchFn } from "../internal/n8n-fetch-client";
import type { N8nConfigurationInput } from "../n8n-config";

export const TEST_TENANT_ID = "tenant_n8n_test";
export const TEST_CORRELATION_ID = "corr_n8n_test";

export const DEFAULT_TEST_N8N_CONFIG: N8nConfigurationInput = {
  baseUrl: "https://n8n.example.test",
  apiBaseUrl: "https://n8n.example.test/api/v1",
  authMode: "api_key",
  apiKeyRef: "secret://n8n/api-key",
};

export const MOCK_WORKFLOW = {
  id: "1",
  name: "Onboarding Notify",
  active: false,
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T11:00:00.000Z",
  tags: [{ id: "t1", name: "ops" }],
  nodes: [
    { id: "n1", name: "Start", type: "n8n-nodes-base.manualTrigger" },
    { id: "n2", name: "Notify", type: "n8n-nodes-base.noOp" },
  ],
  connections: {
    Start: { main: [[{ node: "Notify", type: "main", index: 0 }]] },
  },
  versionId: "v1",
};

export const MOCK_TAG = {
  id: "t1",
  name: "ops",
  createdAt: "2026-07-15T09:00:00.000Z",
  updatedAt: "2026-07-15T09:00:00.000Z",
};

export const MOCK_CREDENTIAL = {
  id: "c1",
  name: "SMTP meta",
  type: "smtp",
  createdAt: "2026-07-15T09:00:00.000Z",
  updatedAt: "2026-07-15T09:00:00.000Z",
};

export const MOCK_EXECUTION = {
  id: "e1",
  finished: true,
  mode: "manual",
  startedAt: "2026-07-15T12:00:00.000Z",
  stoppedAt: "2026-07-15T12:00:01.000Z",
  workflowId: "1",
  status: "success",
};

export const MOCK_VARIABLE = {
  id: "var1",
  key: "ENV_LABEL",
  type: "string",
};

export const MOCK_USER = {
  id: "u1",
  email: "ops@example.test",
  firstName: "Ops",
  lastName: "User",
  role: "owner",
};

export const MOCK_PROJECT = {
  id: "p1",
  name: "Default",
  type: "personal",
};

export interface MockN8nApiOptions {
  readonly failAuth?: boolean;
  readonly missUsers?: boolean;
  readonly missProjects?: boolean;
  readonly missVariables?: boolean;
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "x-n8n-version": "1.45.0",
      ...extraHeaders,
    },
  });
}

export function createMockN8nFetch(options: MockN8nApiOptions = {}): FetchFn {
  return async (input: string, init?: RequestInit) => {
    const url = input;
    const parsed = new URL(url, "https://n8n.example.test");
    const pathname = parsed.pathname;

    if (pathname === "/healthz") {
      return jsonResponse({ version: "1.45.0" }, 200);
    }

    const headers = new Headers(init?.headers);
    const apiKey = headers.get("X-N8N-API-KEY");
    const auth = headers.get("Authorization");

    if (options.failAuth || (!apiKey && !auth)) {
      return jsonResponse({ message: "Unauthorized" }, 401);
    }

    const path = pathname.replace(/^\/api\/v1/, "");

    if (path === "/workflows" || path.startsWith("/workflows?")) {
      return jsonResponse({ data: [MOCK_WORKFLOW], nextCursor: null });
    }
    if (path.startsWith("/workflows/")) {
      return jsonResponse(MOCK_WORKFLOW);
    }
    if (path === "/tags" || path.startsWith("/tags/")) {
      return path === "/tags"
        ? jsonResponse({ data: [MOCK_TAG] })
        : jsonResponse(MOCK_TAG);
    }
    if (path === "/credentials" || path.startsWith("/credentials/")) {
      return path === "/credentials"
        ? jsonResponse({ data: [MOCK_CREDENTIAL] })
        : jsonResponse(MOCK_CREDENTIAL);
    }
    if (path === "/executions" || path.startsWith("/executions/")) {
      return path === "/executions"
        ? jsonResponse({ data: [MOCK_EXECUTION], nextCursor: null })
        : jsonResponse(MOCK_EXECUTION);
    }
    if (path === "/variables" || path.startsWith("/variables/")) {
      if (options.missVariables) return jsonResponse({ message: "Not Found" }, 404);
      return path === "/variables"
        ? jsonResponse({ data: [MOCK_VARIABLE] })
        : jsonResponse(MOCK_VARIABLE);
    }
    if (path === "/users" || path.startsWith("/users/")) {
      if (options.missUsers) return jsonResponse({ message: "Not Found" }, 404);
      return path === "/users"
        ? jsonResponse({ data: [MOCK_USER] })
        : jsonResponse(MOCK_USER);
    }
    if (path === "/projects" || path.startsWith("/projects/")) {
      if (options.missProjects) return jsonResponse({ message: "Not Found" }, 404);
      return path === "/projects"
        ? jsonResponse({ data: [MOCK_PROJECT] })
        : jsonResponse(MOCK_PROJECT);
    }

    return jsonResponse({ message: `Unhandled mock path ${path}` }, 404);
  };
}
