import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineRepositoryProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";

export const GITHUB_ACTIONS_INTEGRATION_ID = "github-actions";
export const GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_ID =
  "github-actions-pipeline-repository";

export const GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_repository" as const,
  priority: 100,
};

export function createGitHubActionsPipelineRepositoryProvider(
  core: GitHubActionsCoreServices,
): PipelineRepositoryProvider {
  return {
    getRepository(ctx, owner, repo) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.repositories.getRepository(toIntegrationContext(ctx), { owner, repo }),
      );
    },
  };
}
