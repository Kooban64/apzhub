import type { FetchFn } from "@apzhub/integration-sdk/client";
import type { GitLabCiConfigurationInput } from "../gitlab-ci-config";

export const TEST_TENANT_ID = "tenant-gitlab-ci-1";
export const TEST_CORRELATION_ID = "corr-gitlab-ci-001";

export const DEFAULT_TEST_GITLAB_CI_CONFIG: GitLabCiConfigurationInput = {
  authMode: "personal_access_token",
  personalAccessTokenRef: "gitlab-ci/pat",
  projectPath: "acme/portal",
  apiBaseUrl: "https://gitlab.com/api/v4",
  baseUrl: "https://gitlab.com",
};

export const MOCK_USER = {
  id: 42,
  username: "gitlab-user",
  name: "GitLab User",
};

export const MOCK_PROJECT = {
  id: 101,
  name: "portal",
  path_with_namespace: "acme/portal",
  visibility: "private",
  web_url: "https://gitlab.com/acme/portal",
  description: "APZHUB portal",
  default_branch: "main",
};

export const MOCK_PIPELINE = {
  id: 9001,
  iid: 42,
  project_id: 101,
  status: "success",
  ref: "main",
  sha: "abc123def456",
  source: "push",
  web_url: "https://gitlab.com/acme/portal/-/pipelines/9001",
  created_at: "2026-07-12T10:00:00Z",
  updated_at: "2026-07-12T10:05:00Z",
  duration: 300,
  user: { username: "gitlab-user", id: 42 },
};

export const MOCK_JOB = {
  id: 7001,
  name: "build",
  status: "success",
  stage: "test",
  started_at: "2026-07-12T10:00:35Z",
  finished_at: "2026-07-12T10:04:00Z",
  duration: 205,
  tag_list: ["docker"],
  web_url: "https://gitlab.com/acme/portal/-/jobs/7001",
  artifacts: [
    {
      filename: "coverage-report.xml",
      file_type: "archive",
      size: 12_345,
    },
  ],
};

export interface MockGitLabCiApiOptions {
  readonly username?: string;
  readonly userId?: number;
  readonly failAuth?: boolean;
  readonly authStatus?: number;
  readonly requireToken?: boolean;
  readonly failProject?: boolean;
  readonly failPipelines?: boolean;
  readonly failJobs?: boolean;
  readonly rateLimitRemaining?: number;
  readonly rateLimitLimit?: number;
  readonly rateLimitReset?: number;
  readonly seedPipelines?: readonly Record<string, unknown>[];
  readonly seedJobs?: readonly Record<string, unknown>[];
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function hasToken(headers: Record<string, string>): boolean {
  const authorization = headers.authorization ?? headers.Authorization;
  const privateToken = headers["private-token"] ?? headers["PRIVATE-TOKEN"];
  if (privateToken?.trim()) return true;
  return Boolean(authorization?.match(/^Bearer\s+.+/i));
}

/** Mock GitLab REST API v4 — read-only pipeline endpoints for tests. */
export function createMockGitLabCiFetch(options: MockGitLabCiApiOptions = {}): FetchFn {
  const {
    username = MOCK_USER.username,
    userId = MOCK_USER.id,
    failAuth = false,
    authStatus = failAuth ? 401 : 200,
    requireToken = true,
    failProject = false,
    failPipelines = false,
    failJobs = false,
    rateLimitRemaining = 1_900,
    rateLimitLimit = 2_000,
    rateLimitReset = 1_720_000_000,
  } = options;

  const pipelines = [...(options.seedPipelines ?? [MOCK_PIPELINE])];
  const jobs = [...(options.seedJobs ?? [MOCK_JOB])];

  const rateHeaders = {
    "ratelimit-remaining": String(rateLimitRemaining),
    "ratelimit-limit": String(rateLimitLimit),
    "ratelimit-reset": String(rateLimitReset),
  };

  return async (input: URL | RequestInfo, init?: RequestInit) => {
    const requestUrl =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers = normalizeHeaders(init?.headers);

    if (requireToken && !hasToken(headers)) {
      return jsonResponse({ message: "401 Unauthorized" }, 401, rateHeaders);
    }

    const url = new URL(requestUrl);
    const path = url.pathname.replace(/\/+$/, "");
    const method = (init?.method ?? "GET").toUpperCase();

    if (method !== "GET") {
      return jsonResponse({ message: "Method not allowed" }, 405, rateHeaders);
    }

    if (path.endsWith("/user")) {
      if (authStatus >= 400) {
        return jsonResponse(
          { message: authStatus === 401 ? "401 Unauthorized" : "Unavailable" },
          authStatus,
          rateHeaders,
        );
      }
      return jsonResponse({ ...MOCK_USER, username, id: userId }, 200, rateHeaders);
    }

    const projectMatch = path.match(/\/projects\/([^/]+)$/);
    if (projectMatch) {
      if (failProject) {
        return jsonResponse({ message: "404 Project Not Found" }, 404, rateHeaders);
      }
      const encoded = projectMatch[1] ?? "";
      const decoded = decodeURIComponent(encoded);
      const name = decoded.includes("/") ? decoded.split("/").pop() : decoded;
      return jsonResponse(
        {
          ...MOCK_PROJECT,
          name: name ?? MOCK_PROJECT.name,
          path_with_namespace: decoded.includes("/")
            ? decoded
            : MOCK_PROJECT.path_with_namespace,
        },
        200,
        rateHeaders,
      );
    }

    const pipelinesMatch = path.match(/\/projects\/([^/]+)\/pipelines$/);
    if (pipelinesMatch) {
      if (failPipelines) {
        return jsonResponse({ message: "503 Service Unavailable" }, 503, rateHeaders);
      }
      let filtered = [...pipelines];
      const status = url.searchParams.get("status");
      const ref = url.searchParams.get("ref");
      if (status) {
        filtered = filtered.filter((p) => p.status === status);
      }
      if (ref) {
        filtered = filtered.filter((p) => p.ref === ref);
      }
      return jsonResponse(filtered, 200, rateHeaders);
    }

    const pipelineJobsMatch = path.match(
      /\/projects\/([^/]+)\/pipelines\/([^/]+)\/jobs$/,
    );
    if (pipelineJobsMatch) {
      if (failJobs) {
        return jsonResponse({ message: "503 Service Unavailable" }, 503, rateHeaders);
      }
      return jsonResponse(jobs, 200, rateHeaders);
    }

    const pipelineMatch = path.match(/\/projects\/([^/]+)\/pipelines\/([^/]+)$/);
    if (pipelineMatch) {
      const pipelineId = pipelineMatch[2];
      const pipeline = pipelines.find((p) => String(p.id) === pipelineId);
      if (!pipeline) {
        return jsonResponse({ message: "404 Not Found" }, 404, rateHeaders);
      }
      return jsonResponse(pipeline, 200, rateHeaders);
    }

    const jobMatch = path.match(/\/projects\/([^/]+)\/jobs\/([^/]+)$/);
    if (jobMatch) {
      const jobId = jobMatch[2];
      const job = jobs.find((j) => String(j.id) === jobId);
      if (!job) {
        return jsonResponse({ message: "404 Not Found" }, 404, rateHeaders);
      }
      return jsonResponse(job, 200, rateHeaders);
    }

    return jsonResponse({ message: "404 Not Found" }, 404, rateHeaders);
  };
}
