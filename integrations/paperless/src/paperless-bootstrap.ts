import type {
  AdapterBootstrapConfiguration,
  IntegrationCapabilityId,
} from "@apzhub/integration-sdk/adapter";

import {
  normalizePaperlessConfiguration,
  type PaperlessConfiguration,
  type PaperlessConfigurationInput,
} from "./paperless-config";
import {
  PAPERLESS_ADAPTER_ID,
  PAPERLESS_ADAPTER_VERSION,
  PAPERLESS_INTEGRATION_ID,
} from "./version";

export const PAPERLESS_SDK_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
] as const satisfies readonly IntegrationCapabilityId[];

export interface PaperlessBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly paperless: PaperlessConfiguration;
}

export interface CreatePaperlessBootstrapInput {
  readonly paperless: PaperlessConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
}

export function createPaperlessBootstrapConfiguration(
  input: CreatePaperlessBootstrapInput,
): PaperlessBootstrapConfiguration {
  const paperless = normalizePaperlessConfiguration(input.paperless);
  return {
    paperless,
    manifest: {
      integrationId: PAPERLESS_INTEGRATION_ID,
      adapterId: PAPERLESS_ADAPTER_ID,
      name: "Documents DMS Engine Integration",
      version: PAPERLESS_ADAPTER_VERSION,
      capabilityId: "integration.paperless",
      declaredCapabilities: [...PAPERLESS_SDK_CAPABILITIES],
      owner: "APZHUB",
      description: "Read-only Documents DMS health and catalogue adapter",
    },
    connection: {
      connectionId: input.connectionId ?? "paperless-default-connection",
      tenantId: input.tenantId,
      baseUrl: paperless.baseUrl,
      authenticationMode: "api_token",
      credentialRef: paperless.apiTokenRef,
      metadata: { apiBaseUrl: paperless.apiBaseUrl },
    },
  };
}
