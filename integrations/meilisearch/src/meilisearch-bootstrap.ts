import type {
  AdapterBootstrapConfiguration,
  IntegrationCapabilityId,
} from "@apzhub/integration-sdk";
import {
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  type SearchIntegrationCapabilityId,
} from "@apzhub/integration-search-sdk";

import {
  normalizeMeilisearchConfiguration,
  type MeilisearchConfiguration,
  type MeilisearchConfigurationInput,
} from "./meilisearch-config";
import { MEILISEARCH_ADAPTER_VERSION, MEILISEARCH_INTEGRATION_ID } from "./version";

export const MEILISEARCH_SDK_CAPABILITIES = [
  "search",
  "health",
  "diagnostics",
  "authentication",
] as const satisfies readonly IntegrationCapabilityId[];

export interface CreateMeilisearchBootstrapInput {
  readonly meilisearch: MeilisearchConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly adapterId?: string;
  readonly name?: string;
  readonly version?: string;
  readonly declaredSearchCapabilities?: readonly SearchIntegrationCapabilityId[];
}

export interface MeilisearchBootstrapConfiguration extends AdapterBootstrapConfiguration {
  readonly meilisearch: MeilisearchConfiguration;
  readonly declaredSearchCapabilities: readonly SearchIntegrationCapabilityId[];
}

export function createMeilisearchBootstrapConfiguration(
  input: CreateMeilisearchBootstrapInput,
): MeilisearchBootstrapConfiguration {
  const meilisearch = normalizeMeilisearchConfiguration(input.meilisearch);
  const declaredSearchCapabilities =
    input.declaredSearchCapabilities ?? DEFAULT_DECLARED_SEARCH_CAPABILITIES;

  return {
    meilisearch,
    declaredSearchCapabilities,
    manifest: {
      integrationId: MEILISEARCH_INTEGRATION_ID,
      adapterId: input.adapterId ?? "meilisearch-search-adapter",
      name: input.name ?? "Meilisearch Reference Search Adapter",
      version: input.version ?? MEILISEARCH_ADAPTER_VERSION,
      capabilityId: "search.meilisearch",
      declaredCapabilities: [...MEILISEARCH_SDK_CAPABILITIES],
      owner: "@apzhub/integration-meilisearch",
      description:
        "Meilisearch CE reference search adapter (APZSEARCH-005) — keyword plane only",
    },
    connection: {
      connectionId: input.connectionId ?? "meilisearch-default-connection",
      tenantId: input.tenantId,
      baseUrl: meilisearch.baseUrl,
      authenticationMode: "api_token",
      credentialRef: meilisearch.apiKeyRef ?? "",
      metadata: {
        providerKind: "meilisearch",
        timeoutMs: String(meilisearch.timeoutMs),
        defaultIndexUid: meilisearch.defaultIndexUid ?? "",
        declaredSearchCapabilities: declaredSearchCapabilities.join(","),
      },
    },
  };
}
