import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineArtifactProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_ARTIFACT_PROVIDER_ID = "gitlab-ci-pipeline-artifact";

export const GITLAB_CI_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_ARTIFACT_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_artifact" as const,
  priority: 100,
};

export function createGitLabCiPipelineArtifactProvider(
  core: GitLabCiCoreServices,
): PipelineArtifactProvider {
  return {
    listArtifacts(ctx, owner, repo, runId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.artifacts.listArtifacts(toIntegrationContext(ctx), runId, {
          owner,
          repo,
        }),
      );
    },
  };
}
