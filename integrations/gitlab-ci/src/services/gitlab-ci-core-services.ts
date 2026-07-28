import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  ArtifactReference,
  PipelineApproval,
  PipelineJob,
  PipelineLogReference,
  PipelineStep,
  PipelineSummary,
} from "@apzhub/testing-contracts";

import type { GitLabCiRestClient } from "../internal/gitlab-ci-rest-client";
import { mapGitLabCiStatus } from "../mappers/status-mapper";
import type {
  PipelineRunMetadata,
  RepositoryMetadata,
  WorkflowMetadata,
} from "../models/canonical";
import { GITLAB_CI_API_VERSION } from "../gitlab-ci-config";

export interface ProjectRef {
  readonly owner?: string;
  readonly repo?: string;
  readonly projectPath?: string;
  readonly projectId?: string;
}

export interface ListRunsQuery {
  readonly perPage?: number;
  readonly page?: number;
  readonly status?: string;
  readonly branch?: string;
}

export interface GitLabCiServiceDeps {
  readonly client: GitLabCiRestClient;
  readonly tenantId: string;
  readonly defaultProjectPath?: string;
  readonly defaultProjectId?: string;
}

function resolveProject(deps: GitLabCiServiceDeps, ref?: ProjectRef): string {
  const path =
    ref?.projectPath ??
    (ref?.owner && ref?.repo ? `${ref.owner}/${ref.repo}` : undefined) ??
    deps.defaultProjectPath ??
    deps.defaultProjectId ??
    ref?.projectId;
  if (!path?.trim()) {
    throw Object.assign(new Error("project path or id is required"), {
      statusCode: 400,
      vendorCode: "VALIDATION_FAILED",
    });
  }
  return path;
}

function mapProject(record: Record<string, unknown>): RepositoryMetadata {
  const path =
    typeof record.path_with_namespace === "string"
      ? record.path_with_namespace
      : String(record.name ?? "unknown");
  const parts = path.split("/");
  return {
    id: String(record.id ?? path),
    name: String(record.name ?? parts[parts.length - 1] ?? "project"),
    fullName: path,
    private: record.visibility === "private" || record.visibility === "internal",
    htmlUrl: String(record.web_url ?? ""),
    description:
      typeof record.description === "string" ? record.description : undefined,
    defaultBranch:
      typeof record.default_branch === "string" ? record.default_branch : undefined,
    ownerLogin: parts.length > 1 ? parts[0] : undefined,
  };
}

function mapPipelineAsWorkflow(record: Record<string, unknown>): WorkflowMetadata {
  return {
    id: String(record.id ?? "ci"),
    name: String(record.name ?? record.source ?? ".gitlab-ci.yml"),
    path: ".gitlab-ci.yml",
    state: String(record.status ?? "active"),
    createdAt: typeof record.created_at === "string" ? record.created_at : undefined,
    updatedAt: typeof record.updated_at === "string" ? record.updated_at : undefined,
    htmlUrl: typeof record.web_url === "string" ? record.web_url : undefined,
  };
}

function mapPipelineRun(record: Record<string, unknown>): PipelineRunMetadata {
  return {
    id: String(record.id),
    name: typeof record.name === "string" ? record.name : undefined,
    status: mapGitLabCiStatus(
      typeof record.status === "string" ? record.status : undefined,
    ),
    workflowId: String(record.project_id ?? record.id),
    runNumber: typeof record.iid === "number" ? record.iid : undefined,
    event: typeof record.source === "string" ? record.source : undefined,
    htmlUrl: typeof record.web_url === "string" ? record.web_url : undefined,
    startedAt: typeof record.created_at === "string" ? record.created_at : undefined,
    completedAt: typeof record.updated_at === "string" ? record.updated_at : undefined,
    durationMs:
      typeof record.duration === "number" ? record.duration * 1000 : undefined,
    branch: typeof record.ref === "string" ? record.ref : undefined,
    commit: typeof record.sha === "string" ? record.sha : undefined,
    actorRef:
      typeof record.user === "object" && record.user
        ? String(
            (record.user as Record<string, unknown>).username ??
              (record.user as Record<string, unknown>).name ??
              "",
          ) || undefined
        : undefined,
    environment: {
      branch: typeof record.ref === "string" ? record.ref : undefined,
      commit: typeof record.sha === "string" ? record.sha : undefined,
    },
  };
}

function mapJob(record: Record<string, unknown>): PipelineJob {
  return {
    key: String(record.id ?? record.name),
    name: String(record.name ?? "job"),
    status: mapGitLabCiStatus(
      typeof record.status === "string" ? record.status : undefined,
    ),
    durationMs:
      typeof record.duration === "number" ? record.duration * 1000 : undefined,
    startedAt: typeof record.started_at === "string" ? record.started_at : undefined,
    completedAt:
      typeof record.finished_at === "string" ? record.finished_at : undefined,
    runnerLabel:
      typeof record.tag_list === "object" && Array.isArray(record.tag_list)
        ? record.tag_list.map(String).join(",")
        : undefined,
  };
}

export interface GitLabCiCoreServices {
  readonly repositories: {
    getRepository(
      context: IntegrationRequestContext,
      ref?: ProjectRef,
    ): Promise<RepositoryMetadata>;
  };
  readonly workflows: {
    listWorkflows(
      context: IntegrationRequestContext,
      ref?: ProjectRef,
    ): Promise<readonly WorkflowMetadata[]>;
    getWorkflow(
      context: IntegrationRequestContext,
      workflowId: string | number,
      ref?: ProjectRef,
    ): Promise<WorkflowMetadata>;
  };
  readonly pipelineRuns: {
    listRuns(
      context: IntegrationRequestContext,
      query?: ListRunsQuery,
      ref?: ProjectRef,
    ): Promise<readonly PipelineRunMetadata[]>;
    getRun(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ): Promise<PipelineRunMetadata>;
  };
  readonly runs: GitLabCiCoreServices["pipelineRuns"];
  readonly jobs: {
    listJobs(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ): Promise<readonly PipelineJob[]>;
    getJob(
      context: IntegrationRequestContext,
      runId: string | number,
      jobId: string | number,
      ref?: ProjectRef,
    ): Promise<PipelineJob>;
  };
  readonly steps: {
    listSteps(
      context: IntegrationRequestContext,
      runId: string | number,
      jobId: string | number,
      ref?: ProjectRef,
    ): Promise<readonly PipelineStep[]>;
  };
  readonly artifacts: {
    listArtifacts(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ): Promise<readonly ArtifactReference[]>;
  };
  readonly logs: {
    listLogsMetadata(
      context: IntegrationRequestContext,
      runId: string | number,
      jobId: string | number,
      ref?: ProjectRef,
    ): Promise<readonly PipelineLogReference[]>;
  };
  readonly approvals: {
    listApprovals(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ): Promise<readonly PipelineApproval[]>;
  };
  readonly summary: {
    retrieveSummary(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ): Promise<PipelineSummary>;
  };
  readonly version: { getApiVersion(): string };
}

export function createGitLabCiCoreServices(
  deps: GitLabCiServiceDeps,
): GitLabCiCoreServices {
  const { client } = deps;

  const pipelineRuns = {
    async listRuns(
      context: IntegrationRequestContext,
      query?: ListRunsQuery,
      ref?: ProjectRef,
    ) {
      const project = resolveProject(deps, ref);
      const rows = await client.listPipelines(context, project, {
        per_page: query?.perPage,
        page: query?.page,
        status: query?.status,
        ref: query?.branch,
      });
      return rows.map(mapPipelineRun);
    },
    async getRun(
      context: IntegrationRequestContext,
      runId: string | number,
      ref?: ProjectRef,
    ) {
      const project = resolveProject(deps, ref);
      const row = await client.getPipeline(context, project, runId);
      return mapPipelineRun(row);
    },
  };

  async function listJobs(
    context: IntegrationRequestContext,
    runId: string | number,
    ref?: ProjectRef,
  ): Promise<readonly PipelineJob[]> {
    const project = resolveProject(deps, ref);
    const rows = await client.listPipelineJobs(context, project, runId);
    return rows.map(mapJob);
  }

  async function getJob(
    context: IntegrationRequestContext,
    runId: string | number,
    jobId: string | number,
    ref?: ProjectRef,
  ): Promise<PipelineJob> {
    const jobs = await listJobs(context, runId, ref);
    const found = jobs.find((j) => j.key === String(jobId));
    if (!found) {
      throw Object.assign(new Error("Job not found"), {
        statusCode: 404,
        vendorCode: "NOT_FOUND",
      });
    }
    return found;
  }

  return {
    repositories: {
      async getRepository(context, ref) {
        const project = resolveProject(deps, ref);
        const row = await client.getProject(context, project);
        return mapProject(row);
      },
    },
    workflows: {
      async listWorkflows(context, ref) {
        const runs = await pipelineRuns.listRuns(context, { perPage: 5 }, ref);
        if (runs.length === 0) {
          return [
            {
              id: "gitlab-ci",
              name: ".gitlab-ci.yml",
              path: ".gitlab-ci.yml",
              state: "active",
            },
          ];
        }
        return runs.map((r) => ({
          id: r.workflowId,
          name: r.name ?? ".gitlab-ci.yml",
          path: ".gitlab-ci.yml",
          state: r.status,
          htmlUrl: r.htmlUrl,
        }));
      },
      async getWorkflow(context, workflowId, ref) {
        const project = resolveProject(deps, ref);
        const row = await client.getProject(context, project);
        return mapPipelineAsWorkflow({
          id: workflowId,
          name: ".gitlab-ci.yml",
          status: "active",
          web_url: row.web_url,
        });
      },
    },
    pipelineRuns,
    runs: pipelineRuns,
    jobs: { listJobs, getJob },
    steps: {
      async listSteps(context, runId, jobId, ref) {
        const job = await getJob(context, runId, jobId, ref);
        return (job.steps ?? []) as readonly PipelineStep[];
      },
    },
    artifacts: {
      async listArtifacts(context, runId, ref) {
        const project = resolveProject(deps, ref);
        const jobRows = await client.listPipelineJobs(context, project, runId);
        const artifacts: ArtifactReference[] = [];
        for (const job of jobRows) {
          const jobId = job.id;
          if (jobId === undefined) continue;
          const rows = await client.listJobArtifacts(context, project, String(jobId));
          for (const row of rows) {
            artifacts.push({
              name: String(row.filename ?? row.file_type ?? "artifact"),
              sizeBytes: typeof row.size === "number" ? row.size : undefined,
              type: typeof row.file_type === "string" ? row.file_type : undefined,
            });
          }
        }
        return artifacts;
      },
    },
    logs: {
      async listLogsMetadata(context, runId, jobId, ref) {
        const project = resolveProject(deps, ref);
        const run = await client.getPipeline(context, project, runId);
        const webUrl = typeof run.web_url === "string" ? run.web_url : undefined;
        const logs: PipelineLogReference[] = [
          {
            name: `job-${jobId}-trace`,
            uriReference: webUrl ? `${webUrl}/jobs/${jobId}` : undefined,
            jobKey: String(jobId),
          },
        ];
        return logs;
      },
    },
    approvals: {
      async listApprovals() {
        return [] as readonly PipelineApproval[];
      },
    },
    summary: {
      async retrieveSummary(context, runId, ref) {
        const run = await pipelineRuns.getRun(context, runId, ref);
        const jobList = await listJobs(context, runId, ref);
        return {
          headline: run.name ?? `Pipeline ${run.id}`,
          overallStatus: run.status,
          passed: jobList.filter((j) => j.status === "passed").length,
          failed: jobList.filter((j) => j.status === "failed").length,
          skipped: jobList.filter((j) => j.status === "skipped").length,
          cancelled: jobList.filter((j) => j.status === "cancelled").length,
          notes: run.htmlUrl,
        } satisfies PipelineSummary;
      },
    },
    version: {
      getApiVersion() {
        return GITLAB_CI_API_VERSION;
      },
    },
  };
}
