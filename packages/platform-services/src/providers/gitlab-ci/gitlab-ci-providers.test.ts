import { describe, expect, it } from "vitest";

import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  ArtifactReference,
  PipelineJob,
  PipelineStep,
  PipelineSummary,
} from "@apzhub/testing-contracts";

import { ProviderRegistry } from "../registry/provider-registry";
import { ProviderResolver } from "../registry/provider-resolver";
import {
  registerGitLabCiProviders,
  GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_ID,
  GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_ID,
  GITLAB_CI_PIPELINE_RUN_PROVIDER_ID,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant-gl",
    organisationId: "org-gl",
    userId: "user-1",
    correlationId: "corr-gitlab-ci-providers",
    permissions: ["pipeline.*"],
    locale: "en",
    timezone: "UTC",
  };
}

function createMockGitLabCiCore(): GitLabCiCoreServices {
  const jobs: readonly PipelineJob[] = [
    {
      key: "job-1",
      name: "build",
      status: "passed",
      steps: [
        { name: "checkout", status: "passed" },
        { name: "test", status: "passed" },
      ] satisfies PipelineStep[],
    },
  ];
  const artifacts: readonly ArtifactReference[] = [
    { name: "coverage.xml", type: "report", sizeBytes: 1200 },
  ];
  const summary: PipelineSummary = {
    headline: "CI #42",
    overallStatus: "passed",
    passed: 1,
    failed: 0,
  };

  const repositories = {
    getRepository: async () => ({
      id: "101",
      name: "portal",
      fullName: "acme/portal",
      private: true,
      htmlUrl: "https://gitlab.com/acme/portal",
      description: "APZHUB",
      defaultBranch: "main",
      ownerLogin: "acme",
    }),
  };

  const workflows = {
    listWorkflows: async () => [
      {
        id: "55",
        name: ".gitlab-ci.yml",
        path: ".gitlab-ci.yml",
        state: "active",
      },
    ],
    getWorkflow: async (_c: unknown, workflowId: string | number) => ({
      id: String(workflowId),
      name: ".gitlab-ci.yml",
      path: ".gitlab-ci.yml",
      state: "active",
    }),
  };

  const pipelineRuns = {
    listRuns: async () => [
      {
        id: "42",
        name: "CI",
        status: "passed" as const,
        workflowId: "55",
        runNumber: 42,
        branch: "main",
        commit: "abc123",
      },
    ],
    getRun: async (_c: unknown, runId: string | number) => ({
      id: String(runId),
      name: "CI",
      status: "passed" as const,
      workflowId: "55",
      runNumber: 42,
      branch: "main",
      commit: "abc123",
    }),
  };

  return {
    repositories,
    workflows,
    pipelineRuns,
    runs: pipelineRuns,
    jobs: {
      listJobs: async () => jobs,
      getJob: async (_c, _r, jobId) => {
        const found = jobs.find((j) => j.key === String(jobId));
        if (!found) throw new Error("not found");
        return found;
      },
    },
    steps: {
      listSteps: async () => jobs[0]!.steps ?? [],
    },
    artifacts: {
      listArtifacts: async () => artifacts,
    },
    logs: {
      listLogsMetadata: async () => [],
    },
    approvals: {
      listApprovals: async () => [],
    },
    summary: {
      retrieveSummary: async () => summary,
    },
    version: {
      getApiVersion: () => "v4",
    },
  };
}

describe("GitLab CI providers", () => {
  it("registers and resolves repository/workflow/run providers", async () => {
    const registry = new ProviderRegistry();
    registerGitLabCiProviders({
      registry,
      gitlabCiCore: createMockGitLabCiCore(),
    });

    expect(registry.list("pipeline_repository").map((r) => r.providerId)).toEqual([
      GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_ID,
    ]);
    expect(registry.list("pipeline_workflow").map((r) => r.providerId)).toEqual([
      GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_ID,
    ]);
    expect(registry.list("pipeline_run").map((r) => r.providerId)).toEqual([
      GITLAB_CI_PIPELINE_RUN_PROVIDER_ID,
    ]);
    expect(registry.list("pipeline_artifact").length).toBe(1);
    expect(registry.list("pipeline_job").length).toBe(1);
    expect(registry.list("pipeline_step").length).toBe(1);
    expect(registry.list("pipeline_summary").length).toBe(1);

    const resolver = new ProviderResolver({ registry });
    const request = ctx();

    const repo = await resolver
      .resolvePipelineRepositoryProvider(request)
      .getRepository(request, "acme", "portal");
    expect(repo.fullName).toBe("acme/portal");

    const workflows = await resolver
      .resolvePipelineWorkflowProvider(request)
      .listWorkflows(request, "acme", "portal");
    expect(workflows[0]?.name).toBe(".gitlab-ci.yml");

    const workflow = await resolver
      .resolvePipelineWorkflowProvider(request)
      .getWorkflow(request, "acme", "portal", "55");
    expect(workflow.id).toBe("55");

    const runs = await resolver
      .resolvePipelineRunProvider(request)
      .listRuns(request, "acme", "portal");
    expect(runs[0]?.id).toBe("42");

    const run = await resolver
      .resolvePipelineRunProvider(request)
      .getRun(request, "acme", "portal", "42");
    expect(run.workflowId).toBe("55");

    const jobs = await resolver
      .resolvePipelineJobProvider(request)
      .listJobs(request, "acme", "portal", "42");
    expect(jobs[0]?.name).toBe("build");

    const job = await resolver
      .resolvePipelineJobProvider(request)
      .getJob(request, "acme", "portal", "42", "job-1");
    expect(job.key).toBe("job-1");

    const steps = await resolver
      .resolvePipelineStepProvider(request)
      .listSteps(request, "acme", "portal", "42", "job-1");
    expect(steps).toHaveLength(2);

    const artifacts = await resolver
      .resolvePipelineArtifactProvider(request)
      .listArtifacts(request, "acme", "portal", "42");
    expect(artifacts[0]?.name).toBe("coverage.xml");

    const summary = await resolver
      .resolvePipelineSummaryProvider(request)
      .retrieveSummary(request, "acme", "portal", "42");
    expect(summary.overallStatus).toBe("passed");
  });
});
