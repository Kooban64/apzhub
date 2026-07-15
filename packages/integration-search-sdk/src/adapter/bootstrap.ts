/**
 * Search integration bootstrap — produces AdapterBootstrapConfiguration with capability "search".
 */

import type {
  AdapterBootstrapConfiguration,
  AdapterConnectionDefaults,
  IntegrationCapabilityId,
} from "@apzhub/integration-sdk";
import { SEARCH_INTEGRATION_SDK_VERSION } from "../version";

export interface CreateSearchIntegrationBootstrapConfigurationInput {
  readonly adapterId: string;
  readonly name: string;
  readonly version?: string;
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly owner?: string;
  readonly description?: string;
  readonly additionalCapabilities?: readonly IntegrationCapabilityId[];
  readonly connection?: AdapterConnectionDefaults;
}

export function createSearchIntegrationBootstrapConfiguration(
  input: CreateSearchIntegrationBootstrapConfigurationInput,
): AdapterBootstrapConfiguration {
  const additional = input.additionalCapabilities ?? ["health", "diagnostics"];
  const declaredCapabilities: IntegrationCapabilityId[] = ["search"];
  for (const capability of additional) {
    if (!declaredCapabilities.includes(capability)) {
      declaredCapabilities.push(capability);
    }
  }

  return {
    manifest: {
      integrationId: input.integrationId,
      adapterId: input.adapterId,
      name: input.name,
      version: input.version ?? SEARCH_INTEGRATION_SDK_VERSION,
      capabilityId: input.capabilityId ?? "search.integration",
      declaredCapabilities,
      owner: input.owner ?? "@apzhub/integration-search-sdk",
      description:
        input.description ??
        "Search Integration SDK adapter (APZSEARCH-004 — no engine execution)",
    },
    connection: input.connection,
  };
}
