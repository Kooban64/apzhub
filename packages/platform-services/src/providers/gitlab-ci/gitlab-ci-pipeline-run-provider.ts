import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineRunProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_RUN_PROVIDER_ID = "gitlab-ci-pipeline-run";

export const GITLAB_CI_PIPELINE_RUN_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_RUN_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_run" as const,
  priority: 100,
};

export function createGitLabCiPipelineRunProvider(
  core: GitLabCiCoreServices,
): PipelineRunProvider {
  return {
    listRuns(ctx, owner, repo, query) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.pipelineRuns.listRuns(
          toIntegrationContext(ctx),
          {
            perPage: query?.perPage,
            page: query?.page,
            status: query?.status,
            branch: query?.branch,
          },
          { owner, repo },
        ),
      );
    },
    getRun(ctx, owner, repo, runId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.pipelineRuns.getRun(toIntegrationContext(ctx), runId, {
          owner,
          repo,
        }),
      );
    },
  };
}
