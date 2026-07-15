import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import type { PipelineWorkflowProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-pipeline-repository-provider";

export const GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_ID =
  "github-actions-pipeline-workflow";

export const GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION = {
  providerId: GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_ID,
  integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
  capability: "pipeline_workflow" as const,
  priority: 100,
};

export function createGitHubActionsPipelineWorkflowProvider(
  core: GitHubActionsCoreServices,
): PipelineWorkflowProvider {
  return {
    listWorkflows(ctx, owner, repo) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.workflows.listWorkflows(toIntegrationContext(ctx), { owner, repo }),
      );
    },
    getWorkflow(ctx, owner, repo, workflowId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.workflows.getWorkflow(toIntegrationContext(ctx), workflowId, {
          owner,
          repo,
        }),
      );
    },
  };
}
