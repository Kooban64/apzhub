import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";
import type {
  GitHubActionsConfiguration,
  GitHubActionsConfigurationInput,
} from "./github-actions-config";
import { normalizeGitHubActionsConfiguration } from "./github-actions-config";
import { GITHUB_ACTIONS_INTEGRATION_ID } from "./github-actions-error-mapper";

/** Capabilities registered with the SDK CapabilityRegistration service. */
export const GITHUB_ACTIONS_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "workflow",
] as const satisfies readonly IntegrationCapabilityId[];

/**
 * Extended CI/CD capability identifiers (adapter-local; not all are SDK enum members).
 */
export const GITHUB_ACTIONS_EXTENDED_CAPABILITIES = [
  "repositories",
  "workflows",
  "pipelineRuns",
  "jobs",
  "steps",
  "artifacts",
  "logs",
  "approvals",
  "summary",
  "version",
] as const;

export type GitHubActionsExtendedCapabilityId =
  (typeof GITHUB_ACTIONS_EXTENDED_CAPABILITIES)[number];

export interface GitHubActionsBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly githubActions: GitHubActionsConfiguration;
}

export interface CreateGitHubActionsBootstrapInput {
  readonly githubActions: GitHubActionsConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createGitHubActionsBootstrapConfiguration(
  input: CreateGitHubActionsBootstrapInput,
): GitHubActionsBootstrapConfiguration {
  const githubActions = normalizeGitHubActionsConfiguration(input.githubActions);

  const authenticationMode =
    githubActions.authMode === "personal_access_token"
      ? "api_token"
      : githubActions.authMode === "github_app"
        ? "bearer"
        : "oauth2";

  const credentialRef =
    githubActions.authMode === "personal_access_token"
      ? (githubActions.personalAccessTokenRef ?? "")
      : githubActions.authMode === "github_app"
        ? (githubActions.githubApp.privateKeyRef ?? "")
        : "";

  return {
    githubActions,
    manifest: {
      integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
      adapterId: "github-actions-adapter",
      name: "GitHub Actions Engine Integration",
      version: "0.1.0",
      capabilityId: "integration.github-actions",
      declaredCapabilities: [...GITHUB_ACTIONS_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Read-only GitHub Actions reference adapter for APZ TCMS CI/CD pipeline metadata",
    },
    connection: {
      connectionId: input.connectionId ?? "github-actions-default-connection",
      tenantId: input.tenantId,
      baseUrl: githubActions.baseUrl,
      authenticationMode,
      credentialRef,
      metadata: {
        apiBaseUrl: githubActions.apiBaseUrl,
        apiVersion: githubActions.apiVersion,
        authMode: githubActions.authMode,
        oauthEnabled: String(githubActions.oauth.enabled),
        owner: githubActions.owner ?? "",
        repo: githubActions.repo ?? "",
        extendedCapabilities: GITHUB_ACTIONS_EXTENDED_CAPABILITIES.join(","),
      },
    },
  };
}

export function getGitHubActionsExtendedCapabilities(
  configuration: GitHubActionsBootstrapConfiguration,
): readonly GitHubActionsExtendedCapabilityId[] {
  const raw = configuration.connection?.metadata?.extendedCapabilities;
  if (!raw) {
    return GITHUB_ACTIONS_EXTENDED_CAPABILITIES;
  }
  return raw.split(",").filter(Boolean) as GitHubActionsExtendedCapabilityId[];
}
