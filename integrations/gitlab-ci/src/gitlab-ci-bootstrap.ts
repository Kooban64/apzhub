import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";
import type {
  GitLabCiConfiguration,
  GitLabCiConfigurationInput,
} from "./gitlab-ci-config";
import { normalizeGitLabCiConfiguration } from "./gitlab-ci-config";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-error-mapper";

export const GITLAB_CI_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "workflow",
] as const satisfies readonly IntegrationCapabilityId[];

export const GITLAB_CI_EXTENDED_CAPABILITIES = [
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

export type GitLabCiExtendedCapabilityId =
  (typeof GITLAB_CI_EXTENDED_CAPABILITIES)[number];

export interface GitLabCiBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly gitlabCi: GitLabCiConfiguration;
}

export interface CreateGitLabCiBootstrapInput {
  readonly gitlabCi: GitLabCiConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createGitLabCiBootstrapConfiguration(
  input: CreateGitLabCiBootstrapInput,
): GitLabCiBootstrapConfiguration {
  const gitlabCi = normalizeGitLabCiConfiguration(input.gitlabCi);

  const authenticationMode =
    gitlabCi.authMode === "personal_access_token" ? "api_token" : "oauth2";

  const credentialRef =
    gitlabCi.authMode === "personal_access_token"
      ? (gitlabCi.personalAccessTokenRef ?? "")
      : "";

  return {
    gitlabCi,
    manifest: {
      integrationId: GITLAB_CI_INTEGRATION_ID,
      adapterId: "gitlab-ci-adapter",
      name: "GitLab CI Engine Integration",
      version: "0.1.0",
      capabilityId: "integration.gitlab-ci",
      declaredCapabilities: [...GITLAB_CI_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Read-only GitLab CI reference adapter for APZ TCMS CI/CD pipeline metadata",
    },
    connection: {
      connectionId: input.connectionId ?? "gitlab-ci-default-connection",
      tenantId: input.tenantId,
      baseUrl: gitlabCi.baseUrl,
      authenticationMode,
      credentialRef,
      metadata: {
        apiBaseUrl: gitlabCi.apiBaseUrl,
        apiVersion: gitlabCi.apiVersion,
        authMode: gitlabCi.authMode,
        oauthEnabled: String(gitlabCi.oauth.enabled),
        projectPath: gitlabCi.projectPath ?? "",
        projectId: gitlabCi.projectId ?? "",
        extendedCapabilities: GITLAB_CI_EXTENDED_CAPABILITIES.join(","),
      },
    },
  };
}

export function getGitLabCiExtendedCapabilities(
  configuration: GitLabCiBootstrapConfiguration,
): readonly GitLabCiExtendedCapabilityId[] {
  const raw = configuration.connection?.metadata?.extendedCapabilities;
  if (!raw) {
    return GITLAB_CI_EXTENDED_CAPABILITIES;
  }
  return raw.split(",").filter(Boolean) as GitLabCiExtendedCapabilityId[];
}
