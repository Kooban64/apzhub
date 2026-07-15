import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineJobProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_ID =
  "github-actions-pipeline-job";

export const GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_job" as const,
  priority: 100,
};

export function createGitHubActionsPipelineJobProvider(
  core: GitHubActionsCoreServices,
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
