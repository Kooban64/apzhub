import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineRepositoryProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";

export const GITLAB_CI_INTEGRATION_ID = "gitlab-ci";
export const GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_ID =
  "gitlab-ci-pipeline-repository";

export const GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_repository" as const,
  priority: 100,
};

export function createGitLabCiPipelineRepositoryProvider(
  core: GitLabCiCoreServices,
): PipelineRepositoryProvider {
  return {
    getRepository(ctx, owner, repo) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.repositories.getRepository(toIntegrationContext(ctx), {
          owner,
          repo,
        }),
      );
    },
  };
}
