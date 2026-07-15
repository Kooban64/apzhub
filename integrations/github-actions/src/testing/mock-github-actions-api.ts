import type { FetchFn } from "../internal/github-actions-fetch-client";
import type { GitHubActionsConfigurationInput } from "../github-actions-config";
import type {
  GitHubArtifactRecord,
  GitHubJobRecord,
  GitHubRepositoryRecord,
  GitHubWorkflowRecord,
  GitHubWorkflowRunRecord,
} from "../internal/github-actions-api-types";

export const TEST_TENANT_ID = "tenant-gha-1";
export const TEST_CORRELATION_ID = "corr-gha-001";

export const DEFAULT_TEST_GITHUB_ACTIONS_CONFIG: GitHubActionsConfigurationInput = {
  authMode: "personal_access_token",
  personalAccessTokenRef: "github/pat",
  owner: "acme",
  repo: "portal",
  apiBaseUrl: "https://api.github.com",
  baseUrl: "https://github.com",
};

export const MOCK_REPOSITORY: GitHubRepositoryRecord = {
  id: 101,
  name: "portal",
  full_name: "acme/portal",
  private: true,
  html_url: "https://github.com/acme/portal",
  description: "APZHUB portal",
  default_branch: "main",
  owner: { login: "acme", id: 1 },
};

export const MOCK_WORKFLOW: GitHubWorkflowRecord = {
  id: 55,
  name: "CI",
  path: ".github/workflows/ci.yml",
  state: "active",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-07-01T00:00:00Z",
  html_url: "https://github.com/acme/portal/actions/workflows/ci.yml",
};

export const MOCK_RUN: GitHubWorkflowRunRecord = {
  id: 9001,
  name: "CI",
  display_title: "feat: add adapter",
  head_branch: "main",
  head_sha: "abc123def456",
  path: ".github/workflows/ci.yml",
  run_number: 42,
  event: "push",
  status: "completed",
  conclusion: "success",
  workflow_id: 55,
  html_url: "https://github.com/acme/portal/actions/runs/9001",
  created_at: "2026-07-12T10:00:00Z",
  updated_at: "2026-07-12T10:05:00Z",
  run_started_at: "2026-07-12T10:00:30Z",
  actor: { login: "octocat", id: 7 },
  repository: { full_name: "acme/portal", name: "portal", owner: { login: "acme" } },
  head_commit: { id: "abc123def456", message: "feat: add adapter", timestamp: "2026-07-12T09:59:00Z" },
};

export const MOCK_JOB: GitHubJobRecord = {
  id: 7001,
  run_id: 9001,
  name: "build",
  status: "completed",
  conclusion: "success",
  started_at: "2026-07-12T10:00:35Z",
  completed_at: "2026-07-12T10:04:00Z",
  runner_name: "ubuntu-latest",
  html_url: "https://github.com/acme/portal/actions/runs/9001/job/7001",
  steps: [
    {
      name: "Checkout",
      status: "completed",
      conclusion: "success",
      number: 1,
      started_at: "2026-07-12T10:00:36Z",
      completed_at: "2026-07-12T10:00:45Z",
    },
    {
      name: "Test",
      status: "completed",
      conclusion: "success",
      number: 2,
      started_at: "2026-07-12T10:00:46Z",
      completed_at: "2026-07-12T10:03:50Z",
    },
  ],
};

export const MOCK_ARTIFACT: GitHubArtifactRecord = {
  id: 3001,
  name: "coverage-report",
  size_in_bytes: 12_345,
  url: "https://api.github.com/repos/acme/portal/actions/artifacts/3001",
  archive_download_url:
    "https://api.github.com/repos/acme/portal/actions/artifacts/3001/zip",
  expired: false,
  created_at: "2026-07-12T10:04:30Z",
  expires_at: "2026-08-12T10:04:30Z",
  digest: "sha256:deadbeef",
};

export interface MockGitHubActionsApiOptions {
  readonly login?: string;
  readonly userId?: number;
  readonly failAuth?: boolean;
  readonly authStatus?: number;
  readonly requireToken?: boolean;
  readonly failRepo?: boolean;
  readonly failWorkflows?: boolean;
  readonly failRuns?: boolean;
  readonly failJobs?: boolean;
  readonly failArtifacts?: boolean;
  readonly approvalsStatus?: number;
  readonly environmentsStatus?: number;
  readonly rateLimitRemaining?: number;
  readonly rateLimitLimit?: number;
  readonly rateLimitReset?: number;
  readonly seedWorkflows?: readonly GitHubWorkflowRecord[];
  readonly seedRuns?: readonly GitHubWorkflowRunRecord[];
  readonly seedJobs?: readonly GitHubJobRecord[];
  readonly seedArtifacts?: readonly GitHubArtifactRecord[];
  readonly seedApprovals?: readonly {
    readonly state?: string;
    readonly user?: { readonly login?: string };
    readonly comment?: string;
    readonly created_at?: string;
  }[];
}

function normalizeHeaders(
  headers?: HeadersInit,
): Record<string, string> {
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

/** Mock GitHub REST API — read-only Actions endpoints for tests. */
export function createMockGitHubActionsFetch(
  options: MockGitHubActionsApiOptions = {},
): FetchFn {
  const {
    login = "octocat",
    userId = 7,
    failAuth = false,
    authStatus = failAuth ? 401 : 200,
    requireToken = true,
    failRepo = false,
    failWorkflows = false,
    failRuns = false,
    failJobs = false,
    failArtifacts = false,
    approvalsStatus = 404,
    environmentsStatus = 200,
    rateLimitRemaining = 4_900,
    rateLimitLimit = 5_000,
    rateLimitReset = 1_720_000_000,
  } = options;

  const workflows = [...(options.seedWorkflows ?? [MOCK_WORKFLOW])];
  const runs = [...(options.seedRuns ?? [MOCK_RUN])];
  const jobs = [...(options.seedJobs ?? [MOCK_JOB])];
  const artifacts = [...(options.seedArtifacts ?? [MOCK_ARTIFACT])];
  const approvals = [...(options.seedApprovals ?? [])];

  const rateHeaders = {
    "x-ratelimit-remaining": String(rateLimitRemaining),
    "x-ratelimit-limit": String(rateLimitLimit),
    "x-ratelimit-reset": String(rateLimitReset),
  };

  return async (input: string, init?: RequestInit) => {
    const headers = normalizeHeaders(init?.headers);
    const authorization = headers.authorization ?? headers.Authorization;
    const bearer = authorization?.match(/^Bearer\s+(.+)$/i);

    if (requireToken && !bearer?.[1]) {
      return jsonResponse(
        { message: "Requires authentication" },
        401,
        rateHeaders,
      );
    }

    const url = new URL(input);
    const path = url.pathname.replace(/\/+$/, "");
    const method = (init?.method ?? "GET").toUpperCase();

    if (method !== "GET") {
      return jsonResponse({ message: "Method not allowed" }, 405, rateHeaders);
    }

    if (path === "/user" || path.endsWith("/user")) {
      if (authStatus >= 400) {
        return jsonResponse(
          { message: authStatus === 401 ? "Bad credentials" : "Unavailable" },
          authStatus,
          rateHeaders,
        );
      }
      return jsonResponse(
        { login, id: userId, type: "User" },
        200,
        rateHeaders,
      );
    }

    if (path === "/rate_limit" || path.endsWith("/rate_limit")) {
      return jsonResponse(
        {
          resources: {
            core: {
              limit: rateLimitLimit,
              remaining: rateLimitRemaining,
              reset: rateLimitReset,
              used: rateLimitLimit - rateLimitRemaining,
            },
          },
          rate: {
            limit: rateLimitLimit,
            remaining: rateLimitRemaining,
            reset: rateLimitReset,
          },
        },
        200,
        rateHeaders,
      );
    }

    const repoMatch = path.match(/^\/repos\/([^/]+)\/([^/]+)$/);
    if (repoMatch) {
      if (failRepo) {
        return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
      }
      return jsonResponse(
        {
          ...MOCK_REPOSITORY,
          name: repoMatch[2],
          full_name: `${repoMatch[1]}/${repoMatch[2]}`,
          owner: { login: repoMatch[1], id: 1 },
        },
        200,
        rateHeaders,
      );
    }

    const workflowsMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/workflows$/,
    );
    if (workflowsMatch) {
      if (failWorkflows) {
        return jsonResponse({ message: "Unavailable" }, 503, rateHeaders);
      }
      return jsonResponse(
        { total_count: workflows.length, workflows },
        200,
        rateHeaders,
      );
    }

    const workflowMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/workflows\/([^/]+)$/,
    );
    if (workflowMatch) {
      const workflow = workflows.find((w) => String(w.id) === workflowMatch[3]);
      if (!workflow) {
        return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
      }
      return jsonResponse(workflow, 200, rateHeaders);
    }

    const runsMatch = path.match(/^\/repos\/([^/]+)\/([^/]+)\/actions\/runs$/);
    if (runsMatch) {
      if (failRuns) {
        return jsonResponse({ message: "Unavailable" }, 503, rateHeaders);
      }
      let filtered = [...runs];
      const status = url.searchParams.get("status");
      const branch = url.searchParams.get("branch");
      if (status) {
        filtered = filtered.filter((r) => r.status === status || r.conclusion === status);
      }
      if (branch) {
        filtered = filtered.filter((r) => r.head_branch === branch);
      }
      return jsonResponse(
        { total_count: filtered.length, workflow_runs: filtered },
        200,
        rateHeaders,
      );
    }

    const runApprovalsMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/runs\/([^/]+)\/approvals$/,
    );
    if (runApprovalsMatch) {
      if (approvalsStatus === 404) {
        return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
      }
      if (approvalsStatus >= 400) {
        return jsonResponse({ message: "Error" }, approvalsStatus, rateHeaders);
      }
      return jsonResponse(approvals, 200, rateHeaders);
    }

    const runJobsMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/runs\/([^/]+)\/jobs$/,
    );
    if (runJobsMatch) {
      if (failJobs) {
        return jsonResponse({ message: "Unavailable" }, 503, rateHeaders);
      }
      const runJobs = jobs.filter((j) => String(j.run_id) === runJobsMatch[3]);
      return jsonResponse(
        { total_count: runJobs.length, jobs: runJobs },
        200,
        rateHeaders,
      );
    }

    const runArtifactsMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/runs\/([^/]+)\/artifacts$/,
    );
    if (runArtifactsMatch) {
      if (failArtifacts) {
        return jsonResponse({ message: "Unavailable" }, 503, rateHeaders);
      }
      return jsonResponse(
        { total_count: artifacts.length, artifacts },
        200,
        rateHeaders,
      );
    }

    const runMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/actions\/runs\/([^/]+)$/,
    );
    if (runMatch) {
      const run = runs.find((r) => String(r.id) === runMatch[3]);
      if (!run) {
        return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
      }
      return jsonResponse(run, 200, rateHeaders);
    }

    const environmentsMatch = path.match(
      /^\/repos\/([^/]+)\/([^/]+)\/environments$/,
    );
    if (environmentsMatch) {
      if (environmentsStatus === 404) {
        return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
      }
      if (environmentsStatus >= 400) {
        return jsonResponse(
          { message: "Error" },
          environmentsStatus,
          rateHeaders,
        );
      }
      return jsonResponse(
        {
          total_count: 1,
          environments: [
            {
              id: 1,
              name: "production",
              html_url: "https://github.com/acme/portal/deployments/activity_log?environment=production",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-07-01T00:00:00Z",
            },
          ],
        },
        200,
        rateHeaders,
      );
    }

    return jsonResponse({ message: "Not Found" }, 404, rateHeaders);
  };
}
