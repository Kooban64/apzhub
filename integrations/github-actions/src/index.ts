export {
  GitHubActionsAdapter,
  GITHUB_ACTIONS_ADAPTER_VERSION,
} from "./github-actions-adapter";
export type {
  GitHubActionsDiagnosticsExtension,
  GitHubActionsAdapterOptions,
} from "./github-actions-adapter";

export type {
  GitHubActionsConfiguration,
  GitHubActionsConfigurationInput,
  GitHubActionsRetryConfiguration,
  GitHubActionsSslOptions,
  GitHubActionsOAuthConfigurationPlaceholder,
  GitHubActionsAppConfigurationPlaceholder,
  GitHubActionsAuthMode,
  GitHubActionsConfigurationValidationResult,
} from "./github-actions-config";
export {
  GITHUB_ACTIONS_API_VERSION,
  DEFAULT_GITHUB_ACTIONS_API_BASE_URL,
  DEFAULT_GITHUB_ACTIONS_BASE_URL,
  DEFAULT_GITHUB_ACTIONS_RETRY,
  DEFAULT_GITHUB_ACTIONS_SSL,
  DEFAULT_GITHUB_ACTIONS_OAUTH_PLACEHOLDER,
  DEFAULT_GITHUB_ACTIONS_APP_PLACEHOLDER,
  normalizeGitHubActionsConfiguration,
  validateGitHubActionsConfiguration,
} from "./github-actions-config";

export type {
  GitHubActionsBootstrapConfiguration,
  CreateGitHubActionsBootstrapInput,
  GitHubActionsExtendedCapabilityId,
} from "./github-actions-bootstrap";
export {
  createGitHubActionsBootstrapConfiguration,
  GITHUB_ACTIONS_SDK_CAPABILITIES,
  GITHUB_ACTIONS_EXTENDED_CAPABILITIES,
  getGitHubActionsExtendedCapabilities,
} from "./github-actions-bootstrap";

export {
  createGitHubActionsVendorErrorMapper,
  GitHubActionsVendorErrorMapper,
  mapGitHubActionsUnknownError,
  GITHUB_ACTIONS_INTEGRATION_ID,
} from "./github-actions-error-mapper";

export type {
  CreateGitHubActionsAdapterInput,
  CreateGitHubActionsAdapterResult,
} from "./github-actions-factory";
export {
  createGitHubActionsAdapter,
  disposeGitHubActionsAdapter,
} from "./github-actions-factory";

export {
  GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS,
  discoverGitHubActionsCoreServiceCapabilities,
  getGitHubActionsCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  GitHubActionsServiceCapability,
  GitHubActionsCoreServiceId,
  GitHubActionsServiceOperation,
} from "./capabilities/service-capabilities";

export {
  createGitHubActionsCapabilityRegistration,
  listGitHubActionsRegisteredCapabilityIds,
  isGitHubActionsServiceImplemented,
} from "./capabilities/capability-registration";
export type { GitHubActionsCapabilityRegistration } from "./capabilities/capability-registration";

export type { GitHubActionsCoreServices } from "./services/github-actions-core-services";
export { createGitHubActionsCoreServices } from "./services/github-actions-core-services";
export type { GitHubActionsOperationRunner } from "./services/github-actions-operation-runner";
export { GitHubActionsOperationRunner as GitHubActionsOperationRunnerClass } from "./services/github-actions-operation-runner";

export type {
  GitHubActionsOperationalHealthLevel,
  GitHubActionsCapabilityAvailability,
  GitHubActionsCapabilityCertification,
  GitHubActionsCompatibilityMatrix,
  GitHubActionsFeatureDetectionResult,
  GitHubActionsRuntimeDiagnosticsSnapshot,
} from "./operations";
export {
  classifyGitHubActionsOperationalHealth,
  mapOperationalHealthToSdkStatus,
  buildGitHubActionsCompatibilityMatrix,
  GITHUB_ACTIONS_SUPPORTED_API_VERSION,
  GITHUB_ACTIONS_OPTIONAL_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_FEATURES,
  detectGitHubActionsFeatures,
  GitHubActionsOperationsService,
  createGitHubActionsOperationsService,
  GITHUB_ACTIONS_OPERATIONS_ADAPTER_VERSION,
} from "./operations";

export {
  createMockGitHubActionsFetch,
  DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_REPOSITORY,
  MOCK_WORKFLOW,
  MOCK_RUN,
  MOCK_JOB,
  MOCK_ARTIFACT,
} from "./testing/mock-github-actions-api";
export type { MockGitHubActionsApiOptions } from "./testing/mock-github-actions-api";

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

export {
  createGitHubActionsMappingProvider,
  createGitHubActionsMappingRegistry,
  createGitHubActionsMappingPipeline,
  GITHUB_ACTIONS_MAPPING_PROVIDER_ID,
} from "./mappers/github-actions-mapping-registry";

export { mapGitHubActionsStatus } from "./mappers/status-mapper";

export { createGitHubActionsPipelineResultAdapter } from "./pipeline-result-adapter";

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
