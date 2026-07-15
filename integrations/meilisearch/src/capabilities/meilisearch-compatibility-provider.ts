import {
  evaluateSearchCompatibility,
  type SearchCompatibilityClassification,
  type SearchIntegrationCapabilityId,
} from "@apzhub/integration-search-sdk";
import type { SearchCapabilities, SearchProviderKind } from "@apzhub/search-contracts";

import { MEILISEARCH_PROVIDER_KIND, MEILISEARCH_ADAPTER_VERSION } from "../version";
import { MEILISEARCH_UNSUPPORTED_FEATURES } from "../results/unsupported";
import type { MeilisearchCapabilityProvider } from "./meilisearch-capability-provider";
import { SEARCH_INTEGRATION_SDK_VERSION } from "@apzhub/integration-search-sdk";

export type MeilisearchCompatibilityMatrix = {
  readonly sdkVersion: typeof SEARCH_INTEGRATION_SDK_VERSION;
  readonly adapterVersion: typeof MEILISEARCH_ADAPTER_VERSION;
  readonly providerKind: SearchProviderKind;
  readonly classification: SearchCompatibilityClassification;
  readonly declaredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly contractCapabilities: SearchCapabilities;
  readonly requiredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly missingCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly forbiddenFlags: readonly string[];
  readonly unsupportedFeatures: readonly string[];
  readonly engineBound: true;
  readonly referenceAdapter: true;
  /** Platform Search execution still gated; adapter can exercise engine via mock/live REST. */
  readonly executionEnabled: false;
  readonly message: string;
  readonly checkedAt: string;
};

export class MeilisearchCompatibilityProvider {
  constructor(
    private readonly capabilities: MeilisearchCapabilityProvider,
    private readonly clock: { now(): string } = { now: () => new Date().toISOString() },
  ) {}

  evaluate(
    declared?: readonly SearchIntegrationCapabilityId[],
  ): MeilisearchCompatibilityMatrix {
    const base = evaluateSearchCompatibility({
      declaredCapabilities: declared ?? this.capabilities.list(),
      providerKind: MEILISEARCH_PROVIDER_KIND,
      now: () => this.clock.now(),
    });

    const classification: SearchCompatibilityClassification =
      base.classification === "unknown" ? "supported" : base.classification;

    return {
      sdkVersion: base.sdkVersion,
      adapterVersion: MEILISEARCH_ADAPTER_VERSION,
      providerKind: MEILISEARCH_PROVIDER_KIND,
      classification,
      declaredCapabilities: base.declaredCapabilities,
      contractCapabilities: base.contractCapabilities,
      requiredCapabilities: base.requiredCapabilities,
      missingCapabilities: base.missingCapabilities,
      forbiddenFlags: base.forbiddenFlags,
      unsupportedFeatures: MEILISEARCH_UNSUPPORTED_FEATURES,
      engineBound: true,
      referenceAdapter: true,
      executionEnabled: false,
      message: `Meilisearch reference adapter compatibility: ${classification} (APZSEARCH-005)`,
      checkedAt: base.checkedAt,
    };
  }
}

export function createMeilisearchCompatibilityProvider(
  capabilities: MeilisearchCapabilityProvider,
  clock?: { now(): string },
): MeilisearchCompatibilityProvider {
  return new MeilisearchCompatibilityProvider(capabilities, clock);
}
