import { describe, expect, it } from "vitest";

import { createGitHubActionsAdapter } from "./github-actions-factory";
import { createGitHubActionsMappingProvider } from "./mappers/github-actions-mapping-registry";
import { mapGitHubApproval } from "./mappers/approval-mapper";
import { mapGitHubActionsStatus } from "./mappers/status-mapper";
import {
  classifyGitHubActionsOperationalHealth,
  buildGitHubActionsCompatibilityMatrix,
  detectGitHubActionsFeatures,
} from "./operations";
import {
  createMockGitHubActionsFetch,
  DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
  MOCK_ARTIFACT,
  MOCK_JOB,
  MOCK_REPOSITORY,
  MOCK_RUN,
  MOCK_WORKFLOW,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-github-actions-api";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import { GitHubActionsRestClient } from "./internal/github-actions-rest-client";

const fixedClock = {
  now: () => "2026-07-12T16:00:00.000Z",
  nowMs: () => 1_720_795_200_000,
};

const ctx = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
};

const mappingCtx = { tenantId: TEST_TENANT_ID, correlationId: TEST_CORRELATION_ID };

describe("deep coverage gaps", () => {
  it("executes all mapping provider definitions", async () => {
    const provider = createGitHubActionsMappingProvider();
    for (const def of provider.listDefinitions()) {
      expect(def.map).toBeTypeOf("function");
    }

    await provider.getDefinition("repository", "default", "provider_to_canonical")!
      .map!(MOCK_REPOSITORY, mappingCtx);
    await provider.getDefinition("pipeline", "default", "provider_to_canonical")!.map!(
      MOCK_WORKFLOW,
      mappingCtx,
    );
    await provider.getDefinition("pipeline_run", "default", "provider_to_canonical")!
      .map!(MOCK_RUN, mappingCtx);
    await provider.getDefinition("pipeline_job", "default", "provider_to_canonical")!
      .map!(MOCK_JOB, mappingCtx);
    await provider.getDefinition("pipeline_step", "default", "provider_to_canonical")!
      .map!(MOCK_JOB.steps![0], mappingCtx);
    await provider.getDefinition(
      "artifact_reference",
      "default",
      "provider_to_canonical",
    )!.map!(MOCK_ARTIFACT, mappingCtx);
    await provider.getDefinition(
      "pipeline_environment",
      "default",
      "provider_to_canonical",
    )!.map!(
      {
        id: 1,
        name: "staging",
        html_url: "https://example.com",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      mappingCtx,
    );
    await provider.getDefinition(
      "pipeline_approval",
      "default",
      "provider_to_canonical",
    )!.map!({ state: "skipped", user: { login: "a" } }, mappingCtx);
    await provider.getDefinition(
      "pipeline_summary",
      "default",
      "provider_to_canonical",
    )!.map!({ run: MOCK_RUN, jobs: [MOCK_JOB] }, mappingCtx);
    await provider.getDefinition(
      "pipeline_environment",
      "from_run",
      "provider_to_canonical",
    )!.map!(MOCK_RUN, mappingCtx);
    await provider.getDefinition("pipeline_source", "default", "provider_to_canonical")!
      .map!(MOCK_RUN, mappingCtx);
    await provider.getDefinition(
      "pipeline_log_reference",
      "default",
      "provider_to_canonical",
    )!.map!(MOCK_JOB, mappingCtx);

    expect(mapGitHubApproval({ state: "denied" }).status).toBe("rejected");
    expect(mapGitHubApproval({ state: "skipped" }).status).toBe("skipped");
    expect(mapGitHubApproval({ state: "pending" }).status).toBe("pending");
    expect(mapGitHubActionsStatus("completed", "neutral")).toBe("passed");
    expect(mapGitHubActionsStatus("completed", "action_required")).toBe("queued");
    expect(mapGitHubActionsStatus("completed", null)).toBe("unknown");
    expect(mapGitHubActionsStatus("weird", "weird")).toBe("unknown");
  });

  it("covers health unavailable paths and rate limit probe", async () => {
    const fetchFn = createMockGitHubActionsFetch({ failAuth: true });
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_bad",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    await adapter.testConnection(ctx);
    const health = await adapter.health(ctx);
    expect(health.checks.find((c) => c.name === "github_actions_api")?.status).toBe(
      "fail",
    );
    expect(
      health.checks.find((c) => c.name === "github_actions_authentication")?.status,
    ).toBe("fail");

    const diagnostics = await adapter.collectDiagnostics(ctx);
    expect(diagnostics.warnings.some((w) => w.includes("reachable"))).toBe(true);

    const noRepo = await createGitHubActionsAdapter({
      githubActions: {
        authMode: "personal_access_token",
        personalAccessTokenRef: "github/pat",
      },
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_ok",
      clock: fixedClock,
      adapterOptions: { fetchFn: createMockGitHubActionsFetch() },
    });
    const features = await noRepo.adapter.operations.detectFeatures(ctx);
    expect(features.detections[0]?.note).toMatch(/owner\/repo/);
  });

  it("probes rate_limit and approvals feature failure path", async () => {
    const fetchFn = createMockGitHubActionsFetch({ approvalsStatus: 500 });
    const transport = createHttpIntegrationClient({
      apiBaseUrl: "https://api.github.com",
      timeoutMs: 5_000,
      fetchFn,
      errorLabel: "GitHub Actions",
    });
    const client = new GitHubActionsRestClient({
      client: transport,
      getAuth: async () => ({ token: "t" }),
    });

    const rate = await client.getRateLimit(ctx);
    expect(rate.rate.remaining).toBeGreaterThan(0);

    const features = await detectGitHubActionsFeatures(ctx, {
      client,
      owner: "acme",
      repo: "portal",
      sampleRunId: 9001,
      clockNow: () => fixedClock.now(),
    });
    expect(features.approvalsAvailable).toBe(false);

    const blocking = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: buildGitHubActionsCompatibilityMatrix({
        configuredApiVersion: "1999-01-01",
      }),
      capabilities: [],
    });
    expect(blocking.level).toBe("UNAVAILABLE");

    const warningCompat = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: {
        ...buildGitHubActionsCompatibilityMatrix(),
        compatibilityStatus: "warning",
        warnings: ["soft_warning"],
      },
      capabilities: [],
    });
    expect(warningCompat.level).toBe("DEGRADED");

    const unverified = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: {
        ...buildGitHubActionsCompatibilityMatrix(),
        compatibilityStatus: "unverified",
      },
      capabilities: [],
    });
    expect(unverified.level).toBe("DEGRADED");
  });

  it("covers mock filter branches and missing workflow", async () => {
    const fetchFn = createMockGitHubActionsFetch({
      failRepo: true,
      seedRuns: [
        {
          ...MOCK_RUN,
          id: 1,
          status: "in_progress",
          conclusion: null,
          head_branch: "develop",
        },
      ],
    });
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_ok",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    await adapter.testConnection(ctx);

    await expect(adapter.core.repositories.getRepository(ctx)).rejects.toBeTruthy();
    await expect(adapter.core.workflows.getWorkflow(ctx, 999)).rejects.toBeTruthy();
    await expect(adapter.core.pipelineRuns.getRun(ctx, 999)).rejects.toBeTruthy();

    const filtered = await adapter.core.pipelineRuns.listRuns(ctx, {
      status: "in_progress",
      branch: "develop",
      perPage: 10,
      page: 1,
    });
    expect(filtered).toHaveLength(1);
  });
});
