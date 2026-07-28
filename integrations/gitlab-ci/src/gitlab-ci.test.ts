import { describe, expect, it } from "vitest";

import {
  createGitLabCiAdapter,
  createGitLabCiPipelineResultAdapter,
  GITLAB_CI_ADAPTER_VERSION,
  GITLAB_CI_UNSUPPORTED_OPERATIONS,
  mapGitLabCiStatus,
} from "./index";
import {
  createMockGitLabCiFetch,
  DEFAULT_TEST_GITLAB_CI_CONFIG,
  MOCK_JOB,
  MOCK_PIPELINE,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-gitlab-ci-api";

const fixedClock = {
  now: () => "2026-07-12T14:00:00.000Z",
  nowMs: () => 1_720_788_000_000,
};

const ctx = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
};

describe("mapGitLabCiStatus", () => {
  it("maps GitLab pipeline statuses to canonical values", () => {
    expect(mapGitLabCiStatus("success")).toBe("passed");
    expect(mapGitLabCiStatus("failed")).toBe("failed");
    expect(mapGitLabCiStatus("running")).toBe("running");
    expect(mapGitLabCiStatus("pending")).toBe("queued");
    expect(mapGitLabCiStatus("canceled")).toBe("cancelled");
    expect(mapGitLabCiStatus("skipped")).toBe("skipped");
    expect(mapGitLabCiStatus("unknown_vendor")).toBe("unknown");
  });
});

describe("createGitLabCiPipelineResultAdapter", () => {
  const parser = createGitLabCiPipelineResultAdapter();

  it("canParse and parse gitlab_ci payload", () => {
    const payload = {
      kind: "gitlab_ci",
      pipeline: MOCK_PIPELINE,
      jobs: [MOCK_JOB],
    };

    expect(parser.canParse(payload)).toBe(true);
    const result = parser.parse(payload);
    expect(result.providerKind).toBe("gitlab_ci");
    expect(result.status).toBe("passed");
    expect(result.externalRunRef).toBe("9001");
    expect(result.jobs[0]?.name).toBe("build");
  });

  it("rejects github_actions shaped payload", () => {
    const payload = {
      provider: "github_actions",
      status: "completed",
      conclusion: "success",
      head_branch: "main",
    };

    expect(parser.canParse(payload)).toBe(false);
    expect(() => parser.parse(payload)).toThrow(/GitLab pipeline shaped payload/i);
  });

  it("reports adapter kind gitlab_ci and version 0.1.0", () => {
    expect(parser.kind).toBe("gitlab_ci");
    expect(parser.version).toBe("0.1.0");
  });
});

describe("createGitLabCiAdapter", () => {
  it("constructs adapter with mock fetch and resolves repository", async () => {
    const fetchFn = createMockGitLabCiFetch();
    const { adapter } = await createGitLabCiAdapter({
      gitlabCi: DEFAULT_TEST_GITLAB_CI_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "glpat-test-token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    expect(adapter.isInitialised).toBe(true);
    expect(GITLAB_CI_ADAPTER_VERSION).toBe("0.1.0");

    const connection = await adapter.testConnection(ctx);
    expect(connection.ok).toBe(true);

    const repo = await adapter.core.repositories.getRepository(ctx);
    expect(repo.fullName).toBe("acme/portal");
  });

  it("lists unsupported operations including dispatch/rerun/cancel/download", () => {
    expect(GITLAB_CI_UNSUPPORTED_OPERATIONS).toEqual([
      "dispatch",
      "rerun",
      "cancel",
      "download",
    ]);
  });
});
