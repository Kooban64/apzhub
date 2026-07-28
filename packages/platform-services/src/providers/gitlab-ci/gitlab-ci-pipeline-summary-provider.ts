import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineSummaryProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_SUMMARY_PROVIDER_ID = "gitlab-ci-pipeline-summary";

export const GITLAB_CI_PIPELINE_SUMMARY_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_SUMMARY_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_summary" as const,
  priority: 100,
};

export function createGitLabCiPipelineSummaryProvider(
  core: GitLabCiCoreServices,
): PipelineSummaryProvider {
  return {
    retrieveSummary(ctx, owner, repo, runId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.summary.retrieveSummary(toIntegrationContext(ctx), runId, {
          owner,
          repo,
        }),
      );
    },
  };
}
