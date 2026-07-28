import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineJobProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_JOB_PROVIDER_ID = "gitlab-ci-pipeline-job";

export const GITLAB_CI_PIPELINE_JOB_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_JOB_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_job" as const,
  priority: 100,
};

export function createGitLabCiPipelineJobProvider(
  core: GitLabCiCoreServices,
): PipelineJobProvider {
  return {
    listJobs(ctx, owner, repo, runId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.jobs.listJobs(toIntegrationContext(ctx), runId, { owner, repo }),
      );
    },
    getJob(ctx, owner, repo, runId, jobId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.jobs.getJob(toIntegrationContext(ctx), runId, jobId, {
          owner,
          repo,
        }),
      );
    },
  };
}
