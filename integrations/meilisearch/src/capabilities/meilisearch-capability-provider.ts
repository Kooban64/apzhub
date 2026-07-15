import {
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  toSearchCapabilities,
  type SearchIntegrationCapabilityId,
} from "@apzhub/integration-search-sdk";
import type { SearchCapabilities } from "@apzhub/search-contracts";

import { MEILISEARCH_UNSUPPORTED_FEATURES } from "../results/unsupported";

export const MEILISEARCH_DECLARED_CAPABILITIES: readonly SearchIntegrationCapabilityId[] =
  DEFAULT_DECLARED_SEARCH_CAPABILITIES;

export class MeilisearchCapabilityProvider {
  constructor(
    private readonly declared: readonly SearchIntegrationCapabilityId[] = MEILISEARCH_DECLARED_CAPABILITIES,
  ) {}

  list(): readonly SearchIntegrationCapabilityId[] {
    return this.declared;
  }

  has(capability: SearchIntegrationCapabilityId): boolean {
    return this.declared.includes(capability);
  }

  toContractCapabilities(): SearchCapabilities {
    return toSearchCapabilities(this.declared);
  }

  unsupportedFeatures(): readonly string[] {
    return MEILISEARCH_UNSUPPORTED_FEATURES;
  }
}

export function createMeilisearchCapabilityProvider(
  declared?: readonly SearchIntegrationCapabilityId[],
): MeilisearchCapabilityProvider {
  return new MeilisearchCapabilityProvider(declared);
}
