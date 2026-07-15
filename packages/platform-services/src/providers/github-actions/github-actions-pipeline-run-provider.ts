import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineRunProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_ID =
  "github-actions-pipeline-run";

export const GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_run" as const,
  priority: 100,
};

export function createGitHubActionsPipelineRunProvider(
  core: GitHubActionsCoreServices,
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
