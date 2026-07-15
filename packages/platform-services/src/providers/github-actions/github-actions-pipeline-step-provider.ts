import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineStepProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_ID =
  "github-actions-pipeline-step";

export const GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_step" as const,
  priority: 100,
};

export function createGitHubActionsPipelineStepProvider(
  core: GitHubActionsCoreServices,
): PipelineStepProvider {
  return {
    listSteps(ctx, owner, repo, runId, jobId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.steps.listSteps(toIntegrationContext(ctx), runId, jobId, {
          owner,
          repo,
        }),
      );
    },
  };
}
