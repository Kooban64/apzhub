import type { IntegrationCapabilityId } from "@apzhub/integration-sdk/adapter";
import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";

import type { N8nConfiguration, N8nConfigurationInput } from "./n8n-config";
import { normalizeN8nConfiguration } from "./n8n-config";
import { N8N_ADAPTER_ID, N8N_ADAPTER_VERSION, N8N_INTEGRATION_ID } from "./version";

export const N8N_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "workflow",
] as const satisfies readonly IntegrationCapabilityId[];

export const N8N_EXTENDED_CAPABILITIES = [
  "workflows",
  "workflowTemplates",
  "credentialsMetadata",
  "variablesMetadata",
  "executionsMetadata",
  "tags",
  "users",
  "projects",
  "version",
  "compatibility",
] as const;

export type N8nExtendedCapabilityId = (typeof N8N_EXTENDED_CAPABILITIES)[number];

export interface N8nBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly n8n: N8nConfiguration;
}

export interface CreateN8nBootstrapInput {
  readonly n8n: N8nConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createN8nBootstrapConfiguration(
  input: CreateN8nBootstrapInput,
): N8nBootstrapConfiguration {
  const n8n = normalizeN8nConfiguration(input.n8n);

  const authenticationMode =
    n8n.authMode === "basic"
      ? "basic"
      : n8n.authMode === "oauth"
        ? "oauth2"
        : "api_token";

  const credentialRef =
    n8n.authMode === "basic"
      ? (n8n.basicPasswordRef ?? "")
      : (n8n.apiKeyRef ?? n8n.personalAccessTokenRef ?? "");

  return {
    n8n,
    manifest: {
      integrationId: N8N_INTEGRATION_ID,
      adapterId: N8N_ADAPTER_ID,
      name: "n8n Workflow Engine Integration",
      version: N8N_ADAPTER_VERSION,
      capabilityId: "integration.n8n",
      declaredCapabilities: [...N8N_SDK_CAPABILITIES],
      owner: "APZHUB",
      description:
        "Read-only n8n Workflow Engine Reference Adapter — metadata discovery only (APZWORKFLOW-006)",
    },
    connection: {
      connectionId: input.connectionId ?? "n8n-default-connection",
      tenantId: input.tenantId,
      baseUrl: n8n.baseUrl,
      authenticationMode,
      credentialRef,
      usernameRef: n8n.authMode === "basic" ? n8n.basicUsernameRef : undefined,
      metadata: {
        apiBaseUrl: n8n.apiBaseUrl,
        authMode: n8n.authMode,
        oauthEnabled: String(n8n.oauth.enabled),
        extendedCapabilities: N8N_EXTENDED_CAPABILITIES.join(","),
      },
    },
  };
}

export function getN8nExtendedCapabilities(
  _configuration: N8nBootstrapConfiguration,
): readonly N8nExtendedCapabilityId[] {
  return N8N_EXTENDED_CAPABILITIES;
}
