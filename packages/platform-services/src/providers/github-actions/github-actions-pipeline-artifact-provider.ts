import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineArtifactProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_ID =
  "github-actions-pipeline-artifact";

export const GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_artifact" as const,
  priority: 100,
};

export function createGitHubActionsPipelineArtifactProvider(
  core: GitHubActionsCoreServices,
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
