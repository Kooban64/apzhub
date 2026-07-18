import { describe, expect, it } from "vitest";

import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  ArtifactReference,
  PipelineJob,
  PipelineSummary,
} from "@apzhub/testing-contracts";

import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { AllowAllAuthorizationProvider } from "../../authorization/authorization-provider";
import { RequestPipeline } from "../../execution/request-pipeline";
import { ProviderRegistry } from "../../providers/registry/provider-registry";
import { ProviderResolver } from "../../providers/registry/provider-resolver";
import { registerGitHubActionsProviders } from "../../providers/github-actions";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

function ctx(
  permissions: string[] = ["pipeline.*", "testing.admin"],
): ServiceRequestContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    userId: "user-1",
    correlationId: "corr-pipeline-live",
    permissions,
    locale: "en",
    timezone: "UTC",
  };
}

function createMockCore(): GitHubActionsCoreServices {
  const jobs: readonly PipelineJob[] = [{ key: "1", name: "unit", status: "passed" }];
  const artifacts: readonly ArtifactReference[] = [{ name: "junit.xml" }];
  const summary: PipelineSummary = {
    headline: "CI",
    overallStatus: "passed",
  };
  const pipelineRuns = {
    listRuns: async () => [
      {
        id: "99",
        name: "CI",
        status: "passed" as const,
        workflowId: "7",
        runNumber: 99,
      },
    ],
    getRun: async (_c: unknown, runId: string | number) => ({
      id: String(runId),
      name: "CI",
      status: "passed" as const,
      workflowId: "7",
      runNumber: Number(runId),
    }),
  };
  return {
    repositories: {
      getRepository: async () => ({
        id: "1",
        name: "app",
        fullName: "acme/app",
        private: false,
        htmlUrl: "https://github.com/acme/app",
      }),
    },
    workflows: {
      listWorkflows: async () => [
        { id: "7", name: "CI", path: ".github/workflows/ci.yml", state: "active" },
      ],
      getWorkflow: async () => ({
        id: "7",
        name: "CI",
        path: ".github/workflows/ci.yml",
        state: "active",
      }),
    },
    pipelineRuns,
    runs: pipelineRuns,
    jobs: {
      listJobs: async () => jobs,
      getJob: async () => jobs[0]!,
    },
    steps: { listSteps: async () => [] },
    artifacts: { listArtifacts: async () => artifacts },
    logs: { listLogsMetadata: async () => [] },
    approvals: { listApprovals: async () => [] },
    summary: { retrieveSummary: async () => summary },
    version: { getApiVersion: () => "2022-11-28" },
    environments: { listEnvironments: async () => [] },
  };
}

describe("testing pipeline live gateway facets", () => {
  it("exposes live facets via ProviderResolver and RequestPipeline", async () => {
    const registry = new ProviderRegistry();
    registerGitHubActionsProviders({
      registry,
      githubActionsCore: createMockCore(),
    });
    const resolver = new ProviderResolver({ registry });
    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
      providerResolver: resolver,
    });

    const pipeline = new RequestPipeline({
      authorization: new AllowAllAuthorizationProvider(),
    });
    const gateway = testing.wrapWithPipeline(pipeline);
    const request = ctx();

    const repo = await gateway.pipelineRepositories.getRepository(
      request,
      "acme",
      "app",
    );
    expect(repo.fullName).toBe("acme/app");

    const workflows = await gateway.pipelineWorkflows.listWorkflows(
      request,
      "acme",
      "app",
    );
    expect(workflows).toHaveLength(1);

    const runs = await gateway.pipelineRuns.listRuns(request, "acme", "app");
    expect(runs[0]?.id).toBe("99");

    const artifacts = await gateway.pipelineArtifacts.listArtifacts(
      request,
      "acme",
      "app",
      "99",
    );
    expect(artifacts[0]?.name).toBe("junit.xml");

    const jobs = await gateway.pipelineJobs.listJobs(request, "acme", "app", "99");
    expect(jobs[0]?.name).toBe("unit");

    const job = await gateway.pipelineJobs.getJob(request, "acme", "app", "99", "1");
    expect(job.name).toBe("unit");

    const workflow = await gateway.pipelineWorkflows.getWorkflow(
      request,
      "acme",
      "app",
      "7",
    );
    expect(workflow.path).toContain("ci.yml");

    const run = await gateway.pipelineRuns.getRun(request, "acme", "app", "99");
    expect(run.id).toBe("99");

    const steps = await gateway.pipelineSteps.listSteps(
      request,
      "acme",
      "app",
      "99",
      "1",
    );
    expect(steps).toEqual([]);

    const summary = await gateway.pipelineSummaries.retrieveSummary(
      request,
      "acme",
      "app",
      "99",
    );
    expect(summary.overallStatus).toBe("passed");
  });

  it("registers live pipeline authz operations", () => {
    expect(
      resolveOperationAuthorization("testingPipelineRepositories", "getRepository")
        ?.requiredPermission,
    ).toBe("pipeline.read");
    expect(
      resolveOperationAuthorization("testingPipelineRuns", "listRuns")
        ?.requiredPermission,
    ).toBe("pipeline.read");
    expect(
      resolveOperationAuthorization("testingPipelineSummaries", "retrieveSummary")
        ?.requiredPermission,
    ).toBe("pipeline.read");
    expect(
      resolveOperationAuthorization("testingPipelines", "importFromProvider")
        ?.requiredPermission,
    ).toBe("pipeline.import");
  });

  it("imports a live run into SoR via importFromProvider", async () => {
    const registry = new ProviderRegistry();
    registerGitHubActionsProviders({
      registry,
      githubActionsCore: createMockCore(),
    });
    const resolver = new ProviderResolver({ registry });
    const { createGitHubActionsPipelineResultAdapter } =
      await import("@apzhub/integration-github-actions");
    const { createGenericCiAdapter } = await import("@apzhub/testing-services");

    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
      providerResolver: resolver,
      pipelineAdapters: [
        createGenericCiAdapter(),
        createGitHubActionsPipelineResultAdapter(),
      ],
    });

    const pipeline = new RequestPipeline({
      authorization: new AllowAllAuthorizationProvider(),
    });
    const gateway = testing.wrapWithPipeline(pipeline);
    const request = ctx();

    await gateway.pipelines.registerPipeline(request, {
      key: "7",
      name: "CI",
      providerKind: "github_actions",
    });

    const outcome = await gateway.pipelines.importFromProvider(request, {
      owner: "acme",
      repo: "app",
      runId: 99,
      pipelineKey: "7",
    });
    expect(outcome.run?.providerKind).toBe("github_actions");
    expect(outcome.run?.externalRunRef).toBe("99");
  });

  it("throws clearly when live facets have no provider", async () => {
    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const request = ctx();
    const surface = testing.gatewaySurface;

    await expect(
      surface.pipelineRepositories.getRepository(request, "a", "b"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineWorkflows.listWorkflows(request, "a", "b"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineWorkflows.getWorkflow(request, "a", "b", "1"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineRuns.listRuns(request, "a", "b"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineRuns.getRun(request, "a", "b", "1"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineArtifacts.listArtifacts(request, "a", "b", "1"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineJobs.listJobs(request, "a", "b", "1"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineJobs.getJob(request, "a", "b", "1", "2"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineSteps.listSteps(request, "a", "b", "1", "2"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    await expect(
      surface.pipelineSummaries.retrieveSummary(request, "a", "b", "1"),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });

    await expect(
      surface.pipelines.importFromProvider(request, {
        owner: "a",
        repo: "b",
        runId: 1,
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
  });
});
