export { GitLabCiAdapter, GITLAB_CI_ADAPTER_VERSION } from "./gitlab-ci-adapter";
export type {
  GitLabCiDiagnosticsExtension,
  GitLabCiAdapterOptions,
} from "./gitlab-ci-adapter";

export type {
  GitLabCiConfiguration,
  GitLabCiConfigurationInput,
  GitLabCiRetryConfiguration,
  GitLabCiSslOptions,
  GitLabCiOAuthConfigurationPlaceholder,
  GitLabCiAuthMode,
  GitLabCiConfigurationValidationResult,
} from "./gitlab-ci-config";
export {
  GITLAB_CI_API_VERSION,
  DEFAULT_GITLAB_CI_API_BASE_URL,
  DEFAULT_GITLAB_CI_BASE_URL,
  DEFAULT_GITLAB_CI_RETRY,
  DEFAULT_GITLAB_CI_SSL,
  DEFAULT_GITLAB_CI_OAUTH_PLACEHOLDER,
  normalizeGitLabCiConfiguration,
  validateGitLabCiConfiguration,
} from "./gitlab-ci-config";

export type {
  GitLabCiBootstrapConfiguration,
  CreateGitLabCiBootstrapInput,
  GitLabCiExtendedCapabilityId,
} from "./gitlab-ci-bootstrap";
export {
  createGitLabCiBootstrapConfiguration,
  GITLAB_CI_SDK_CAPABILITIES,
  GITLAB_CI_EXTENDED_CAPABILITIES,
  getGitLabCiExtendedCapabilities,
} from "./gitlab-ci-bootstrap";

export {
  createGitLabCiVendorErrorMapper,
  GitLabCiVendorErrorMapper,
  mapGitLabCiUnknownError,
  GITLAB_CI_INTEGRATION_ID,
} from "./gitlab-ci-error-mapper";

export type {
  CreateGitLabCiAdapterInput,
  CreateGitLabCiAdapterResult,
} from "./gitlab-ci-factory";
export { createGitLabCiAdapter, disposeGitLabCiAdapter } from "./gitlab-ci-factory";

export {
  GITLAB_CI_CORE_SERVICE_CAPABILITIES,
  GITLAB_CI_UNSUPPORTED_OPERATIONS,
  discoverGitLabCiCoreServiceCapabilities,
  getGitLabCiCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  GitLabCiServiceCapability,
  GitLabCiCoreServiceId,
  GitLabCiServiceOperation,
} from "./capabilities/service-capabilities";

export type { GitLabCiCoreServices } from "./services/gitlab-ci-core-services";
export { createGitLabCiCoreServices } from "./services/gitlab-ci-core-services";

export {
  createMockGitLabCiFetch,
  DEFAULT_TEST_GITLAB_CI_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_PROJECT,
  MOCK_PIPELINE,
  MOCK_JOB,
  MOCK_USER,
} from "./testing/mock-gitlab-ci-api";
export type { MockGitLabCiApiOptions } from "./testing/mock-gitlab-ci-api";

export type {
  RepositoryMetadata,
  WorkflowMetadata,
  PipelineRunMetadata,
  ArtifactReference,
  PipelineApproval,
  PipelineEnvironment,
  PipelineJob,
  PipelineLogReference,
  PipelineRunStatus,
  PipelineStep,
  PipelineSummary,
} from "./models/canonical";

export { mapGitLabCiStatus } from "./mappers/status-mapper";

export { createGitLabCiPipelineResultAdapter } from "./pipeline-result-adapter";

export type {
  CanonicalPipelineResult,
  PipelineResult,
  PipelineResultAdapter,
  PipelineProviderKind,
} from "@apzhub/testing-contracts";

export {
  PIPELINE_PROVIDER_KINDS,
  PIPELINE_RUN_STATUSES,
  isPipelineProviderKind,
  isPipelineRunStatus,
} from "@apzhub/testing-contracts";
