import { describe, expect, it } from "vitest";

import { createGitHubActionsAdapter } from "./github-actions-factory";
import {
  createMockGitHubActionsFetch,
  DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-github-actions-api";
import {
  createGitHubActionsCapabilityRegistration,
  listGitHubActionsRegisteredCapabilityIds,
} from "./capabilities/capability-registration";
import { discoverGitHubActionsCoreServiceCapabilities } from "./capabilities/service-capabilities";
import {
  classifyGitHubActionsOperationalHealth,
  mapOperationalHealthToSdkStatus,
  buildGitHubActionsCompatibilityMatrix,
} from "./operations";
import {
  createGitHubActionsVendorErrorMapper,
  mapGitHubActionsUnknownError,
} from "./github-actions-error-mapper";
import { mapGitHubActionsStatus } from "./mappers/status-mapper";
import {
  createGitHubActionsMappingProvider,
  createGitHubActionsMappingRegistry,
} from "./mappers/github-actions-mapping-registry";
import { createGitHubActionsPipelineResultAdapter } from "./pipeline-result-adapter";
import { MOCK_RUN, MOCK_JOB } from "./testing/mock-github-actions-api";

const fixedClock = {
  now: () => "2026-07-12T14:00:00.000Z",
  nowMs: () => 1_720_788_000_000,
};

const ctx = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
};

async function createReadyAdapter(
  fetchOptions?: Parameters<typeof createMockGitHubActionsFetch>[0],
) {
  const fetchFn = createMockGitHubActionsFetch(fetchOptions);
  const { adapter } = await createGitHubActionsAdapter({
    githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
    tenantId: TEST_TENANT_ID,
    personalAccessToken: "ghp_test_token",
    clock: fixedClock,
    adapterOptions: { fetchFn },
  });
  await adapter.testConnection(ctx);
  return adapter;
}

describe("GitHub Actions core services", () => {
  it("lists and gets workflows, runs, jobs, steps, artifacts", async () => {
    const adapter = await createReadyAdapter();

    const repo = await adapter.core.repositories.getRepository(ctx);
    expect(repo.fullName).toBe("acme/portal");

    const workflows = await adapter.core.workflows.listWorkflows(ctx);
    expect(workflows).toHaveLength(1);
    expect(workflows[0]?.name).toBe("CI");

    const workflow = await adapter.core.workflows.getWorkflow(ctx, 55);
    expect(workflow.id).toBe("55");

    const runs = await adapter.core.pipelineRuns.listRuns(ctx, {
      branch: "main",
    });
    expect(runs[0]?.status).toBe("passed");
    expect(adapter.core.runs).toBe(adapter.core.pipelineRuns);

    const run = await adapter.core.pipelineRuns.getRun(ctx, 9001);
    expect(run.id).toBe("9001");

    const jobs = await adapter.core.jobs.listJobs(ctx, 9001);
    expect(jobs[0]?.name).toBe("build");
    expect(jobs[0]?.steps?.length).toBe(2);

    const job = await adapter.core.jobs.getJob(ctx, 9001, 7001);
    expect(job.key).toBe("7001");

    const steps = await adapter.core.steps.listSteps(ctx, 9001, 7001);
    expect(steps.map((s) => s.name)).toEqual(["Checkout", "Test"]);

    const artifacts = await adapter.core.artifacts.listArtifacts(ctx, 9001);
    expect(artifacts[0]?.name).toBe("coverage-report");
    expect(artifacts[0]?.storageProvider).toBe("github_actions");

    const logs = await adapter.core.logs.listLogsMetadata(ctx, 9001, 7001);
    expect(logs.length).toBeGreaterThan(0);

    const approvals = await adapter.core.approvals.listApprovals(ctx, 9001);
    expect(approvals).toEqual([]);

    const summary = await adapter.core.summary.retrieveSummary(ctx, 9001);
    expect(summary.overallStatus).toBe("passed");
    expect(summary.passed).toBe(1);

    const envs = await adapter.core.environments.listEnvironments(ctx);
    expect(envs[0]?.name).toBe("production");
  });

  it("returns approvals when endpoint is available", async () => {
    const adapter = await createReadyAdapter({
      approvalsStatus: 200,
      seedApprovals: [
        {
          state: "approved",
          user: { login: "reviewer" },
          comment: "LGTM",
          created_at: "2026-07-12T10:01:00Z",
        },
      ],
    });

    const approvals = await adapter.core.approvals.listApprovals(ctx, 9001);
    expect(approvals).toHaveLength(1);
    expect(approvals[0]?.status).toBe("approved");
    expect(approvals[0]?.kind).toBe("operations");
  });

  it("requires owner/repo when defaults missing", async () => {
    const fetchFn = createMockGitHubActionsFetch();
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: {
        authMode: "personal_access_token",
        personalAccessTokenRef: "github/pat",
      },
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_test_token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    await adapter.testConnection(ctx);

    await expect(adapter.core.repositories.getRepository(ctx)).rejects.toMatchObject({
      category: "validation",
    });

    const withOverride = await adapter.core.repositories.getRepository(ctx, {
      owner: "acme",
      repo: "portal",
    });
    expect(withOverride.name).toBe("portal");
  });
});

describe("diagnostics, health, rate limits, capabilities", () => {
  it("collects secret-free diagnostics and health checks", async () => {
    const adapter = await createReadyAdapter({ rateLimitRemaining: 50 });
    const health = await adapter.health(ctx);
    expect(health.checks.some((c) => c.name === "github_actions_api")).toBe(true);

    const diagnostics = await adapter.diagnostics(ctx);
    expect(diagnostics.healthStatus).toMatch(/healthy|degraded/);
    expect(JSON.stringify(diagnostics)).not.toMatch(/ghp_/);
    expect(adapter.diagnosticsExtension.rateLimitRemaining).toBe(50);

    const snapshot = adapter.getRuntimeDiagnosticsSnapshot();
    expect(snapshot.apiVersion).toBe("2022-11-28");
    expect(snapshot.unsupportedOperations).toContain("dispatch");

    const features = await adapter.operations.detectFeatures(ctx, 9001);
    expect(features.environmentsAvailable).toBe(true);
  });

  it("classifies health levels and maps to SDK status", () => {
    const compatible = buildGitHubActionsCompatibilityMatrix();
    expect(compatible.compatibilityStatus).toBe("compatible");

    const incompatible = buildGitHubActionsCompatibilityMatrix({
      configuredApiVersion: "1999-01-01",
    });
    expect(incompatible.compatibilityStatus).toBe("incompatible");

    const healthy = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [
        {
          capabilityId: "workflows",
          serviceId: "workflows",
          implemented: true,
          available: true,
          optional: false,
          status: "available",
          supportedOperations: ["list"],
          unsupportedOperations: [],
          knownLimitations: [],
        },
      ],
    });
    expect(healthy.level).toBe("HEALTHY");
    expect(mapOperationalHealthToSdkStatus("LIMITED")).toBe("degraded");
    expect(mapOperationalHealthToSdkStatus("UNAVAILABLE")).toBe("unavailable");

    const unavailable = classifyGitHubActionsOperationalHealth({
      providerReachable: false,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [],
    });
    expect(unavailable.level).toBe("UNAVAILABLE");
  });

  it("discovers capabilities", () => {
    const caps = discoverGitHubActionsCoreServiceCapabilities();
    expect(caps.length).toBeGreaterThanOrEqual(8);
    expect(caps.every((c) => c.implemented)).toBe(true);

    const registration = createGitHubActionsCapabilityRegistration();
    expect(registration.unsupportedOperations).toContain("rerun");
    expect(listGitHubActionsRegisteredCapabilityIds()).toContain("pipelineRuns");
  });

  it("handles auth failure and maps errors", async () => {
    const fetchFn = createMockGitHubActionsFetch({ failAuth: true });
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_bad",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const result = await adapter.testConnection(ctx);
    expect(result.ok).toBe(false);

    const mapper = createGitHubActionsVendorErrorMapper();
    const mapped = mapper.map({
      statusCode: 403,
      body: { message: "API rate limit exceeded" },
      context: { correlationId: "c", integrationId: "github-actions" },
    });
    expect(mapped?.error.category).toBe("rate_limited");

    const unknown = mapGitHubActionsUnknownError(
      Object.assign(new Error("boom"), {
        statusCode: 404,
        body: { message: "Not Found" },
      }),
      { correlationId: "c", integrationId: "github-actions", operation: "runs.get" },
    );
    expect(unknown.error.category).toBe("not_found");
  });
});

describe("mapping and pipeline result adapter", () => {
  it("maps GitHub statuses", () => {
    expect(mapGitHubActionsStatus("in_progress", null)).toBe("running");
    expect(mapGitHubActionsStatus("completed", "success")).toBe("passed");
    expect(mapGitHubActionsStatus("completed", "failure")).toBe("failed");
    expect(mapGitHubActionsStatus("completed", "timed_out")).toBe("timed_out");
    expect(mapGitHubActionsStatus("queued", null)).toBe("queued");
  });

  it("registers mapping provider definitions", async () => {
    const provider = createGitHubActionsMappingProvider();
    expect(provider.id).toBe("github-actions.entity-mapping");
    expect(provider.listDefinitions().length).toBeGreaterThan(5);

    const registry = createGitHubActionsMappingRegistry();
    expect(registry.list().some((p) => p.id === provider.id)).toBe(true);

    const def = provider.getDefinition(
      "pipeline_run_status",
      "default",
      "provider_to_canonical",
    );
    expect(def?.map).toBeTypeOf("function");
    const mapped = await def!.map!(
      { status: "completed", conclusion: "success" },
      { tenantId: "t", correlationId: "c" },
    );
    expect(mapped).toBe("passed");
  });

  it("parses GitHub-shaped workflow run payloads without network", () => {
    const adapter = createGitHubActionsPipelineResultAdapter();
    expect(adapter.kind).toBe("github_actions");

    const payload = {
      ...MOCK_RUN,
      jobs: [MOCK_JOB],
    };

    expect(adapter.canParse(payload)).toBe(true);
    const result = adapter.parse(payload);
    expect(result.providerKind).toBe("github_actions");
    expect(result.externalRunRef).toBe("9001");
    expect(result.status).toBe("passed");
    expect(result.jobs[0]?.steps?.length).toBe(2);
    expect(result.summary.overallStatus).toBe("passed");

    expect(adapter.canParse({ providerKind: "generic_ci", status: "passed" })).toBe(
      false,
    );
    expect(() => adapter.parse({ foo: 1 })).toThrow();

    const nested = adapter.parse({
      workflow_run: MOCK_RUN,
      jobs: [MOCK_JOB],
      artifacts: [{ name: "a", sizeBytes: 1 }],
    });
    expect(nested.externalPipelineRef).toBe("55");
  });
});
