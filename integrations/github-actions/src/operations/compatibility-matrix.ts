import { GITHUB_ACTIONS_API_VERSION } from "../github-actions-config";
import type { GitHubActionsCompatibilityMatrix } from "./types";

export const GITHUB_ACTIONS_SUPPORTED_API_VERSION = GITHUB_ACTIONS_API_VERSION;

export const GITHUB_ACTIONS_OPTIONAL_CAPABILITIES = [
  "approvals",
  "environments",
] as const;

export const GITHUB_ACTIONS_UNSUPPORTED_FEATURES = [
  "workflow_dispatch",
  "workflow_rerun",
  "workflow_cancel",
  "artifact_download",
  "log_body_download",
] as const;

export function buildGitHubActionsCompatibilityMatrix(input?: {
  readonly configuredApiVersion?: string;
  readonly checked?: boolean;
}): GitHubActionsCompatibilityMatrix {
  const configured =
    input?.configuredApiVersion ?? GITHUB_ACTIONS_SUPPORTED_API_VERSION;
  const checked = input?.checked ?? true;

  if (!checked) {
    return {
      configuredApiVersion: configured,
      supportedApiVersion: GITHUB_ACTIONS_SUPPORTED_API_VERSION,
      compatibilityStatus: "not_checked",
      warnings: [],
      blockingIncompatibilities: [],
      unsupportedFeatures: [...GITHUB_ACTIONS_UNSUPPORTED_FEATURES],
      optionalCapabilities: [...GITHUB_ACTIONS_OPTIONAL_CAPABILITIES],
      reasons: ["compatibility_not_checked"],
    };
  }

  if (configured !== GITHUB_ACTIONS_SUPPORTED_API_VERSION) {
    return {
      configuredApiVersion: configured,
      supportedApiVersion: GITHUB_ACTIONS_SUPPORTED_API_VERSION,
      compatibilityStatus: "incompatible",
      warnings: [],
      blockingIncompatibilities: [`unsupported_api_version:${configured}`],
      unsupportedFeatures: [...GITHUB_ACTIONS_UNSUPPORTED_FEATURES],
      optionalCapabilities: [...GITHUB_ACTIONS_OPTIONAL_CAPABILITIES],
      reasons: ["api_version_mismatch"],
    };
  }

  return {
    configuredApiVersion: configured,
    supportedApiVersion: GITHUB_ACTIONS_SUPPORTED_API_VERSION,
    compatibilityStatus: "compatible",
    warnings: [],
    blockingIncompatibilities: [],
    unsupportedFeatures: [...GITHUB_ACTIONS_UNSUPPORTED_FEATURES],
    optionalCapabilities: [...GITHUB_ACTIONS_OPTIONAL_CAPABILITIES],
    reasons: ["api_version_compatible"],
  };
}
