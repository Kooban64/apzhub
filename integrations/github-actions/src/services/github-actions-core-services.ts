import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  ArtifactReference,
  PipelineApproval,
  PipelineEnvironment,
  PipelineJob,
  PipelineLogReference,
  PipelineStep,
  PipelineSummary,
} from "@apzhub/testing-contracts";

import type {
  PipelineRunMetadata,
  RepositoryMetadata,
  WorkflowMetadata,
} from "../models/canonical";
import { mapGitHubApproval } from "../mappers/approval-mapper";
import { mapGitHubArtifact } from "../mappers/artifact-mapper";
import { mapGitHubEnvironment } from "../mappers/environment-mapper";
import { mapGitHubJob, mapGitHubStep } from "../mappers/job-mapper";
import { mapGitHubRepository } from "../mappers/repository-mapper";
import { mapGitHubWorkflowRun } from "../mappers/run-mapper";
import {
  mapGitHubJobLogsMetadata,
  mapGitHubRunSummary,
} from "../mappers/summary-mapper";
import { mapGitHubWorkflow } from "../mappers/workflow-mapper";
import { GITHUB_ACTIONS_API_VERSION } from "../github-actions-config";
import type { GitHubActionsServiceDeps } from "./github-actions-operation-runner";

export interface RepoRef {
  readonly owner?: string;
  readonly repo?: string;
}

export interface ListRunsQuery {
  readonly perPage?: number;
  readonly page?: number;
  readonly status?: string;
  readonly branch?: string;
}

function resolveRepo(
  deps: GitHubActionsServiceDeps,
  ref?: RepoRef,
): { owner: string; repo: string } {
  const owner = ref?.owner ?? deps.defaultOwner;
  const repo = ref?.repo ?? deps.defaultRepo;
  if (!owner?.trim() || !repo?.trim()) {
    throw Object.assign(new Error("owner and repo are required"), {
      statusCode: 400,
      vendorCode: "VALIDATION_FAILED",
      body: { message: "owner and repo are required" },
    });
  }
  return { owner, repo };
}

export interface GitHubActionsRepositoriesService {
  getRepository(
    context: IntegrationRequestContext,
    ref?: RepoRef,
  ): Promise<RepositoryMetadata>;
}

export interface GitHubActionsWorkflowsService {
  listWorkflows(
    context: IntegrationRequestContext,
    ref?: RepoRef,
  ): Promise<readonly WorkflowMetadata[]>;
  getWorkflow(
    context: IntegrationRequestContext,
    workflowId: string | number,
    ref?: RepoRef,
  ): Promise<WorkflowMetadata>;
}

export interface GitHubActionsPipelineRunsService {
  listRuns(
    context: IntegrationRequestContext,
    query?: ListRunsQuery,
    ref?: RepoRef,
  ): Promise<readonly PipelineRunMetadata[]>;
  getRun(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: RepoRef,
  ): Promise<PipelineRunMetadata>;
}

export interface GitHubActionsJobsService {
  listJobs(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: RepoRef,
  ): Promise<readonly PipelineJob[]>;
  getJob(
    context: IntegrationRequestContext,
    runId: string | number,
    jobId: string | number,
    ref?: RepoRef,
  ): Promise<PipelineJob>;
}

export interface GitHubActionsStepsService {
  listSteps(
    context: IntegrationRequestContext,
    runId: string | number,
    jobId: string | number,
    ref?: RepoRef,
  ): Promise<readonly PipelineStep[]>;
}

export interface GitHubActionsArtifactsService {
  listArtifacts(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: RepoRef,
  ): Promise<readonly ArtifactReference[]>;
}

export interface GitHubActionsLogsService {
  listLogsMetadata(
    context: IntegrationRequestContext,
    runId: string | number,
    jobId: string | number,
    ref?: RepoRef,
  ): Promise<readonly PipelineLogReference[]>;
}

export interface GitHubActionsApprovalsService {
  listApprovals(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: RepoRef,
  ): Promise<readonly PipelineApproval[]>;
}

export interface GitHubActionsSummaryService {
  retrieveSummary(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: RepoRef,
  ): Promise<PipelineSummary>;
}

export interface GitHubActionsVersionService {
  getApiVersion(): string;
}

export interface GitHubActionsEnvironmentsService {
  listEnvironments(
    context: IntegrationRequestContext,
    ref?: RepoRef,
  ): Promise<readonly PipelineEnvironment[]>;
}

export interface GitHubActionsCoreServices {
  readonly repositories: GitHubActionsRepositoriesService;
  readonly workflows: GitHubActionsWorkflowsService;
  readonly pipelineRuns: GitHubActionsPipelineRunsService;
  /** Alias for pipelineRuns. */
  readonly runs: GitHubActionsPipelineRunsService;
  readonly jobs: GitHubActionsJobsService;
  readonly steps: GitHubActionsStepsService;
  readonly artifacts: GitHubActionsArtifactsService;
  readonly logs: GitHubActionsLogsService;
  readonly approvals: GitHubActionsApprovalsService;
  readonly summary: GitHubActionsSummaryService;
  readonly version: GitHubActionsVersionService;
  readonly environments: GitHubActionsEnvironmentsService;
}

export function createGitHubActionsCoreServices(
  deps: GitHubActionsServiceDeps,
): GitHubActionsCoreServices {
  const { runner, client } = deps;

  const repositories: GitHubActionsRepositoriesService = {
    getRepository(context, ref) {
      return runner.run(context, "repositories.get", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const record = await client.getRepository(context, owner, repo);
        return mapGitHubRepository(record);
      });
    },
  };

  const workflows: GitHubActionsWorkflowsService = {
    listWorkflows(context, ref) {
      return runner.run(context, "workflows.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const response = await client.listWorkflows(context, owner, repo);
        return response.workflows.map(mapGitHubWorkflow);
      });
    },
    getWorkflow(context, workflowId, ref) {
      return runner.run(context, "workflows.get", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const record = await client.getWorkflow(context, owner, repo, workflowId);
        return mapGitHubWorkflow(record);
      });
    },
  };

  const pipelineRuns: GitHubActionsPipelineRunsService = {
    listRuns(context, query, ref) {
      return runner.run(context, "pipelineRuns.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const response = await client.listRuns(context, owner, repo, {
          per_page: query?.perPage,
          page: query?.page,
          status: query?.status,
          branch: query?.branch,
        });
        return response.workflow_runs.map(mapGitHubWorkflowRun);
      });
    },
    getRun(context, runId, ref) {
      return runner.run(context, "pipelineRuns.get", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const record = await client.getRun(context, owner, repo, runId);
        return mapGitHubWorkflowRun(record);
      });
    },
  };

  const jobs: GitHubActionsJobsService = {
    listJobs(context, runId, ref) {
      return runner.run(context, "jobs.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const response = await client.listJobs(context, owner, repo, runId);
        return response.jobs.map(mapGitHubJob);
      });
    },
    getJob(context, runId, jobId, ref) {
      return runner.run(context, "jobs.get", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const job = await client.getJobFromRun(context, owner, repo, runId, jobId);
        if (!job) {
          throw Object.assign(new Error("Job not found"), {
            statusCode: 404,
            vendorCode: "NOT_FOUND",
            body: { message: "Job not found" },
          });
        }
        return mapGitHubJob(job);
      });
    },
  };

  const steps: GitHubActionsStepsService = {
    listSteps(context, runId, jobId, ref) {
      return runner.run(context, "steps.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const job = await client.getJobFromRun(context, owner, repo, runId, jobId);
        if (!job) {
          throw Object.assign(new Error("Job not found"), {
            statusCode: 404,
            vendorCode: "NOT_FOUND",
            body: { message: "Job not found" },
          });
        }
        return (job.steps ?? []).map(mapGitHubStep);
      });
    },
  };

  const artifacts: GitHubActionsArtifactsService = {
    listArtifacts(context, runId, ref) {
      return runner.run(context, "artifacts.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const response = await client.listArtifacts(context, owner, repo, runId);
        return response.artifacts.map(mapGitHubArtifact);
      });
    },
  };

  const logs: GitHubActionsLogsService = {
    listLogsMetadata(context, runId, jobId, ref) {
      return runner.run(context, "logs.listMetadata", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const job = await client.getJobFromRun(context, owner, repo, runId, jobId);
        if (!job) {
          throw Object.assign(new Error("Job not found"), {
            statusCode: 404,
            vendorCode: "NOT_FOUND",
            body: { message: "Job not found" },
          });
        }
        return mapGitHubJobLogsMetadata(job);
      });
    },
  };

  const approvals: GitHubActionsApprovalsService = {
    listApprovals(context, runId, ref) {
      return runner.run(context, "approvals.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const records = await client.listApprovals(context, owner, repo, runId);
        return records.map(mapGitHubApproval);
      });
    },
  };

  const summary: GitHubActionsSummaryService = {
    retrieveSummary(context, runId, ref) {
      return runner.run(context, "summary.retrieve", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        const run = await client.getRun(context, owner, repo, runId);
        const jobsResponse = await client.listJobs(context, owner, repo, runId);
        return mapGitHubRunSummary(run, jobsResponse.jobs);
      });
    },
  };

  const version: GitHubActionsVersionService = {
    getApiVersion() {
      return GITHUB_ACTIONS_API_VERSION;
    },
  };

  const environments: GitHubActionsEnvironmentsService = {
    listEnvironments(context, ref) {
      return runner.run(context, "environments.list", async () => {
        const { owner, repo } = resolveRepo(deps, ref);
        try {
          const records = await client.listEnvironments(context, owner, repo);
          return records.map(mapGitHubEnvironment);
        } catch (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error &&
            Number((error as { statusCode?: number }).statusCode) === 404
          ) {
            return [];
          }
          throw error;
        }
      });
    },
  };

  return {
    repositories,
    workflows,
    pipelineRuns,
    runs: pipelineRuns,
    jobs,
    steps,
    artifacts,
    logs,
    approvals,
    summary,
    version,
    environments,
  };
}
