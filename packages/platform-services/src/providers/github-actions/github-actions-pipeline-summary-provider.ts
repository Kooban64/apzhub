import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineSummaryProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_ID =
  "github-actions-pipeline-summary";

export const GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_summary" as const,
  priority: 100,
};

export function createGitHubActionsPipelineSummaryProvider(
  core: GitHubActionsCoreServices,
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
