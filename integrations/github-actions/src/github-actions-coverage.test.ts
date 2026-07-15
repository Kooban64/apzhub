import { describe, expect, it } from "vitest";

import {
  createGitHubActionsAdapter,
  createGitHubActionsBootstrapConfiguration,
  createGitHubActionsMappingPipeline,
  createGitHubActionsPipelineResultAdapter,
  createGitHubActionsVendorErrorMapper,
  createMockGitHubActionsFetch,
  DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
  discoverGitHubActionsCoreServiceCapabilities,
  getGitHubActionsCoreServiceCapability,
  getGitHubActionsExtendedCapabilities,
  isGitHubActionsServiceImplemented,
  listGitHubActionsRegisteredCapabilityIds,
  GITHUB_ACTIONS_ADAPTER_VERSION,
  GITHUB_ACTIONS_INTEGRATION_ID,
  GITHUB_ACTIONS_MAPPING_PROVIDER_ID,
  mapGitHubActionsStatus,
  mapOperationalHealthToSdkStatus,
  classifyGitHubActionsOperationalHealth,
  buildGitHubActionsCompatibilityMatrix,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./index";
import { createGitHubActionsAdapter as createFromFactory } from "./github-actions-factory";

const fixedClock = {
  now: () => "2026-07-12T15:00:00.000Z",
  nowMs: () => 1_720_791_600_000,
};

const ctx = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
};

describe("public index exports smoke", () => {
  it("exposes factory, version, and capability helpers", () => {
    expect(GITHUB_ACTIONS_ADAPTER_VERSION).toBe("0.1.0");
    expect(GITHUB_ACTIONS_INTEGRATION_ID).toBe("github-actions");
    expect(GITHUB_ACTIONS_MAPPING_PROVIDER_ID).toContain("github-actions");
    expect(listGitHubActionsRegisteredCapabilityIds().length).toBeGreaterThan(5);
    expect(isGitHubActionsServiceImplemented("workflows")).toBe(true);
    expect(getGitHubActionsCoreServiceCapability("jobs")?.implemented).toBe(true);
    expect(discoverGitHubActionsCoreServiceCapabilities().length).toBeGreaterThan(5);
    expect(createGitHubActionsPipelineResultAdapter().kind).toBe("github_actions");
    expect(mapOperationalHealthToSdkStatus("HEALTHY")).toBe("healthy");
    expect(mapGitHubActionsStatus("completed", "cancelled")).toBe("cancelled");
  });
});

describe("adapter lifecycle coverage", () => {
  it("connects, collects diagnostics, detects features, and disposes", async () => {
    const fetchFn = createMockGitHubActionsFetch({
      approvalsStatus: 200,
      seedApprovals: [{ state: "rejected", user: { login: "sec" } }],
      rateLimitRemaining: 5_000,
    });
    const { adapter, factory } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_lifecycle",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    await adapter.connect(ctx);
    expect(adapter.diagnosticsExtension.apiStatus).toBe("reachable");

    const health = await adapter.health(ctx);
    expect(health.checks.some((c) => c.name === "github_actions_rate_limit")).toBe(
      true,
    );

    const diagnostics = await adapter.collectDiagnostics(ctx);
    expect(diagnostics.engineVersion).toBe("2022-11-28");
    expect(diagnostics.recommendations.join(" ")).toMatch(/dispatch|rerun/i);

    const caps = adapter.listCapabilityRegistration();
    expect(caps.services.length).toBeGreaterThan(5);

    const features = await adapter.operations.detectFeatures(ctx, 9001);
    expect(features.approvalsAvailable).toBe(true);

    const certs = adapter.operations.certifyCapabilities(true);
    expect(certs.some((c) => c.serviceId === "approvals" && c.optional)).toBe(true);

    await factory.dispose(adapter);
    expect(adapter.isDisposed).toBe(true);
  });

  it("marks health warn when API not tested and rate limit low", async () => {
    const fetchFn = createMockGitHubActionsFetch({ rateLimitRemaining: 10 });
    const { adapter } = await createFromFactory({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_x",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const before = await adapter.health(ctx);
    expect(
      before.checks.find((c) => c.name === "github_actions_api")?.status,
    ).toBe("warn");

    await adapter.testConnection(ctx);
    const after = await adapter.health(ctx);
    expect(
      after.checks.find((c) => c.name === "github_actions_rate_limit")?.status,
    ).toBe("warn");
  });

  it("rejects oauth live connect and fails auth without token", async () => {
    const fetchFn = createMockGitHubActionsFetch();
    const { adapter: oauthAdapter } = await createGitHubActionsAdapter({
      githubActions: {
        authMode: "oauth",
        oauth: { enabled: false },
        personalAccessTokenRef: "x",
      },
      tenantId: TEST_TENANT_ID,
      autoInitialise: false,
      adapterOptions: { fetchFn },
    });
    // oauth authMode fails validation — initialise should fail if auto
    const validation = await oauthAdapter.initialise();
    expect(validation.ok).toBe(false);

    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      // no personalAccessToken / secretProvider
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    const missing = await adapter.testConnection(ctx);
    expect(missing.ok).toBe(false);
  });
});

describe("bootstrap, errors, operations edges", () => {
  it("reads extended capabilities from metadata and builds pipeline", () => {
    const configuration = createGitHubActionsBootstrapConfiguration({
      githubActions: {
        ...DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
        authMode: "github_app",
        githubApp: {
          appIdRef: "a",
          installationIdRef: "i",
          privateKeyRef: "k",
        },
      },
      tenantId: TEST_TENANT_ID,
    });
    expect(configuration.connection?.authenticationMode).toBe("bearer");
    expect(getGitHubActionsExtendedCapabilities(configuration)).toContain(
      "workflows",
    );

    const pipeline = createGitHubActionsMappingPipeline();
    expect(pipeline).toBeDefined();
  });

  it("maps vendor errors across categories", () => {
    const mapper = createGitHubActionsVendorErrorMapper();
    expect(
      mapper.map({
        statusCode: 401,
        body: { message: "Bad credentials" },
        context: { correlationId: "c", integrationId: "github-actions" },
      })?.error.category,
    ).toBe("authentication");
    expect(
      mapper.map({
        statusCode: 403,
        body: { message: "Forbidden" },
        context: { correlationId: "c", integrationId: "github-actions" },
      })?.error.category,
    ).toBe("authorization");
    expect(
      mapper.map({
        statusCode: 422,
        body: { message: "Validation Failed", errors: [{ message: "x" }] },
        context: { correlationId: "c", integrationId: "github-actions" },
      })?.error.category,
    ).toBe("validation");
    expect(
      mapper.map({
        statusCode: 501,
        context: {
          correlationId: "c",
          integrationId: "github-actions",
          operation: "approvals.list",
        },
      })?.error.category,
    ).toBe("not_implemented");
    expect(
      mapper.map({
        timeout: true,
        context: { correlationId: "c", integrationId: "github-actions" },
      })?.error.category,
    ).toBe("timeout");
    expect(
      mapper.map({
        networkError: true,
        context: { correlationId: "c", integrationId: "github-actions" },
      })?.error.category,
    ).toBe("vendor_unavailable");
    expect(
      mapper.map({
        context: { correlationId: "c", integrationId: "github-actions" },
      }),
    ).toBeNull();
  });

  it("classifies LIMITED and DEGRADED health", () => {
    const compatible = buildGitHubActionsCompatibilityMatrix();
    const notChecked = buildGitHubActionsCompatibilityMatrix({ checked: false });
    expect(notChecked.compatibilityStatus).toBe("not_checked");

    const limited = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [
        {
          capabilityId: "workflows",
          serviceId: "workflows",
          implemented: true,
          available: false,
          optional: false,
          status: "unavailable",
          supportedOperations: [],
          unsupportedOperations: [],
          knownLimitations: [],
        },
      ],
    });
    expect(limited.level).toBe("LIMITED");

    const rateLimited = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [],
      rateLimitExhausted: true,
    });
    expect(rateLimited.level).toBe("LIMITED");

    const degraded = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [
        {
          capabilityId: "approvals",
          serviceId: "approvals",
          implemented: true,
          available: false,
          optional: true,
          status: "degraded",
          supportedOperations: ["list"],
          unsupportedOperations: [],
          knownLimitations: [],
        },
      ],
      featureDetection: {
        probedAt: fixedClock.now(),
        approvalsAvailable: false,
        environmentsAvailable: true,
        detections: [],
      },
    });
    expect(degraded.level).toBe("DEGRADED");

    const blocked = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: true,
      compatibility: compatible,
      capabilities: [],
    });
    expect(blocked.level).toBe("UNAVAILABLE");

    const invalid = classifyGitHubActionsOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: [],
      configurationInvalid: true,
    });
    expect(invalid.level).toBe("UNAVAILABLE");
  });

  it("handles service failures and job not found", async () => {
    const fetchFn = createMockGitHubActionsFetch({
      failJobs: true,
      failWorkflows: true,
      failRuns: true,
      failArtifacts: true,
      environmentsStatus: 404,
    });
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_fail",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    await adapter.testConnection(ctx);

    await expect(adapter.core.workflows.listWorkflows(ctx)).rejects.toBeTruthy();
    await expect(adapter.core.pipelineRuns.listRuns(ctx)).rejects.toBeTruthy();
    await expect(adapter.core.jobs.listJobs(ctx, 9001)).rejects.toBeTruthy();
    await expect(adapter.core.artifacts.listArtifacts(ctx, 9001)).rejects.toBeTruthy();

    const envs = await adapter.core.environments.listEnvironments(ctx);
    expect(envs).toEqual([]);

    const features = await adapter.operations.detectFeatures(ctx);
    expect(features.environmentsAvailable).toBe(false);
  });

  it("returns job not found for missing job id", async () => {
    const fetchFn = createMockGitHubActionsFetch();
    const { adapter } = await createGitHubActionsAdapter({
      githubActions: DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
      tenantId: TEST_TENANT_ID,
      personalAccessToken: "ghp_ok",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });
    await adapter.testConnection(ctx);

    await expect(adapter.core.jobs.getJob(ctx, 9001, 99999)).rejects.toMatchObject({
      category: "not_found",
    });
    await expect(adapter.core.steps.listSteps(ctx, 9001, 99999)).rejects.toMatchObject({
      category: "not_found",
    });
    await expect(
      adapter.core.logs.listLogsMetadata(ctx, 9001, 99999),
    ).rejects.toMatchObject({ category: "not_found" });
  });

  it("parses string payloads and nested workflow_runs for pipeline adapter", () => {
    const parser = createGitHubActionsPipelineResultAdapter();
    const asString = JSON.stringify({
      id: 1,
      workflow_id: 2,
      status: "completed",
      conclusion: "skipped",
      head_sha: "abc",
      event: "pull_request",
      actor: { login: "bot" },
      repository: { full_name: "acme/portal" },
    });
    expect(parser.canParse(asString)).toBe(true);
    expect(parser.parse(asString).status).toBe("skipped");

    const list = parser.parse({
      workflow_runs: [
        {
          id: 9,
          workflow_id: 3,
          status: "in_progress",
          head_sha: "def",
        },
      ],
    });
    expect(list.status).toBe("running");
  });
});
