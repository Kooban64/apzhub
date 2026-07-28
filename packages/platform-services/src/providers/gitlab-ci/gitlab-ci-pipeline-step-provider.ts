import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineStepProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_STEP_PROVIDER_ID = "gitlab-ci-pipeline-step";

export const GITLAB_CI_PIPELINE_STEP_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_STEP_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_step" as const,
  priority: 100,
};

export function createGitLabCiPipelineStepProvider(
  core: GitLabCiCoreServices,
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
