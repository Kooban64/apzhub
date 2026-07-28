import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";
import type { PipelineWorkflowProvider } from "../capability-providers";
import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-pipeline-repository-provider";

export const GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_ID = "gitlab-ci-pipeline-workflow";

export const GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION = {
  providerId: GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_ID,
  integrationId: GITLAB_CI_INTEGRATION_ID,
  capability: "pipeline_workflow" as const,
  priority: 100,
};

export function createGitLabCiPipelineWorkflowProvider(
  core: GitLabCiCoreServices,
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
