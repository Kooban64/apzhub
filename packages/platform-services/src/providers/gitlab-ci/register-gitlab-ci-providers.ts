import type { GitLabCiCoreServices } from "@apzhub/integration-gitlab-ci";

import type { ProviderRegistry } from "../registry/provider-registry";
import {
  createGitLabCiPipelineArtifactProvider,
  GITLAB_CI_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-artifact-provider";
import {
  createGitLabCiPipelineJobProvider,
  GITLAB_CI_PIPELINE_JOB_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-job-provider";
import {
  createGitLabCiPipelineRepositoryProvider,
  GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-repository-provider";
import {
  createGitLabCiPipelineRunProvider,
  GITLAB_CI_PIPELINE_RUN_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-run-provider";
import {
  createGitLabCiPipelineStepProvider,
  GITLAB_CI_PIPELINE_STEP_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-step-provider";
import {
  createGitLabCiPipelineSummaryProvider,
  GITLAB_CI_PIPELINE_SUMMARY_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-summary-provider";
import {
  createGitLabCiPipelineWorkflowProvider,
  GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION,
} from "./gitlab-ci-pipeline-workflow-provider";

export interface RegisterGitLabCiProvidersInput {
  readonly registry: ProviderRegistry;
  readonly gitlabCiCore: GitLabCiCoreServices;
}

/** Registers all GitLab CI–backed pipeline capability providers (R12-TCMS-01). */
export function registerGitLabCiProviders(input: RegisterGitLabCiProvidersInput): void {
  const { registry, gitlabCiCore } = input;

  registry.register({
    ...GITLAB_CI_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineRepositoryProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineWorkflowProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_RUN_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineRunProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineArtifactProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_JOB_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineJobProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_STEP_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineStepProvider(gitlabCiCore),
  });

  registry.register({
    ...GITLAB_CI_PIPELINE_SUMMARY_PROVIDER_REGISTRATION,
    provider: createGitLabCiPipelineSummaryProvider(gitlabCiCore),
  });
}
