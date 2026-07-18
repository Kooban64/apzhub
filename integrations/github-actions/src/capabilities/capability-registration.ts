import {
  GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS,
  type GitHubActionsCoreServiceId,
  type GitHubActionsServiceCapability,
} from "./service-capabilities";
import {
  GITHUB_ACTIONS_EXTENDED_CAPABILITIES,
  GITHUB_ACTIONS_SDK_CAPABILITIES,
} from "../github-actions-bootstrap";

export interface GitHubActionsCapabilityRegistration {
  readonly sdkCapabilities: readonly string[];
  readonly extendedCapabilities: readonly string[];
  readonly services: readonly GitHubActionsServiceCapability[];
  readonly unsupportedOperations: readonly string[];
}

export function createGitHubActionsCapabilityRegistration(): GitHubActionsCapabilityRegistration {
  return {
    sdkCapabilities: [...GITHUB_ACTIONS_SDK_CAPABILITIES],
    extendedCapabilities: [...GITHUB_ACTIONS_EXTENDED_CAPABILITIES],
    services: GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES,
    unsupportedOperations: [...GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS],
  };
}

export function listGitHubActionsRegisteredCapabilityIds(): readonly string[] {
  return [...GITHUB_ACTIONS_SDK_CAPABILITIES, ...GITHUB_ACTIONS_EXTENDED_CAPABILITIES];
}

export function isGitHubActionsServiceImplemented(
  serviceId: GitHubActionsCoreServiceId,
): boolean {
  return GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.some(
    (c) => c.serviceId === serviceId && c.implemented,
  );
}
