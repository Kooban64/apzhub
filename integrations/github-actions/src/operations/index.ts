export type {
  GitHubActionsOperationalHealthLevel,
  GitHubActionsCapabilityAvailability,
  GitHubActionsCapabilityCertification,
  GitHubActionsCompatibilityMatrix,
  GitHubActionsFeatureDetectionResult,
  GitHubActionsRuntimeDiagnosticsSnapshot,
} from "./types";

export {
  classifyGitHubActionsOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";

export {
  buildGitHubActionsCompatibilityMatrix,
  GITHUB_ACTIONS_SUPPORTED_API_VERSION,
  GITHUB_ACTIONS_OPTIONAL_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_FEATURES,
} from "./compatibility-matrix";

export { detectGitHubActionsFeatures } from "./feature-detection";

export {
  GitHubActionsOperationsService,
  createGitHubActionsOperationsService,
  GITHUB_ACTIONS_OPERATIONS_ADAPTER_VERSION,
} from "./github-actions-operations";
