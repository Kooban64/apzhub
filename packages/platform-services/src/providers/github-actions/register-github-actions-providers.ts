import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";

import type { ProviderRegistry } from "../registry/provider-registry";
import {
  createGitHubActionsPipelineArtifactProvider,
  GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-artifact-provider";
import {
  createGitHubActionsPipelineJobProvider,
  GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-job-provider";
import {
  createGitHubActionsPipelineRepositoryProvider,
  GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-repository-provider";
import {
  createGitHubActionsPipelineRunProvider,
  GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-run-provider";
import {
  createGitHubActionsPipelineStepProvider,
  GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-step-provider";
import {
  createGitHubActionsPipelineSummaryProvider,
  GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-summary-provider";
import {
  createGitHubActionsPipelineWorkflowProvider,
  GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION,
} from "./github-actions-pipeline-workflow-provider";

export interface RegisterGitHubActionsProvidersInput {
  readonly registry: ProviderRegistry;
  readonly githubActionsCore: GitHubActionsCoreServices;
}

/** Registers all GitHub Actions–backed pipeline capability providers. */
export function registerGitHubActionsProviders(
  input: RegisterGitHubActionsProvidersInput,
): void {
  const { registry, githubActionsCore } = input;

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineRepositoryProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineWorkflowProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineRunProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineArtifactProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineJobProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineStepProvider(githubActionsCore),
  });

  registry.register({
    ...GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_REGISTRATION,
    provider: createGitHubActionsPipelineSummaryProvider(githubActionsCore),
  });
}
