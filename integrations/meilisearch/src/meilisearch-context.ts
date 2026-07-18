/**
 * Meilisearch adapter context — SearchAdapterContext + Meilisearch providers.
 */

import {
  buildSearchAdapterContext,
  type BuildSearchAdapterContextInput,
  type SearchAdapterContext,
} from "@apzhub/integration-search-sdk";

import {
  createMeilisearchCapabilityProvider,
  type MeilisearchCapabilityProvider,
} from "./capabilities/meilisearch-capability-provider";
import {
  createMeilisearchCompatibilityProvider,
  type MeilisearchCompatibilityProvider,
} from "./capabilities/meilisearch-compatibility-provider";
import {
  createMeilisearchConfigurationValidator,
  type MeilisearchConfigurationValidator,
} from "./lifecycle/meilisearch-configuration-validator";
import {
  createMeilisearchLogger,
  createMeilisearchMetrics,
  type MeilisearchLogger,
  type MeilisearchMetrics,
} from "./observability/meilisearch-observability";

export interface MeilisearchAdapterContext extends SearchAdapterContext {
  readonly meilisearchCapabilities: MeilisearchCapabilityProvider;
  readonly meilisearchCompatibility: MeilisearchCompatibilityProvider;
  readonly meilisearchConfigurationValidator: MeilisearchConfigurationValidator;
  readonly meilisearchMetrics: MeilisearchMetrics;
  readonly meilisearchLogger: MeilisearchLogger;
}

export interface BuildMeilisearchAdapterContextInput extends BuildSearchAdapterContextInput {
  readonly meilisearchCapabilities?: MeilisearchCapabilityProvider;
  readonly meilisearchConfigurationValidator?: MeilisearchConfigurationValidator;
}

export function buildMeilisearchAdapterContext(
  input: BuildMeilisearchAdapterContextInput,
): MeilisearchAdapterContext {
  const base = buildSearchAdapterContext(input);
  const meilisearchCapabilities =
    input.meilisearchCapabilities ??
    createMeilisearchCapabilityProvider(input.declaredSearchCapabilities);
  const meilisearchConfigurationValidator =
    input.meilisearchConfigurationValidator ??
    createMeilisearchConfigurationValidator();

  return {
    ...base,
    meilisearchCapabilities,
    meilisearchCompatibility: createMeilisearchCompatibilityProvider(
      meilisearchCapabilities,
      base.clock,
    ),
    meilisearchConfigurationValidator,
    meilisearchMetrics: createMeilisearchMetrics(base.metrics),
    meilisearchLogger: createMeilisearchLogger(base.logger),
  };
}

export class MeilisearchAdapterContextBuilder {
  build(input: BuildMeilisearchAdapterContextInput): MeilisearchAdapterContext {
    return buildMeilisearchAdapterContext(input);
  }
}

export function createMeilisearchAdapterContextBuilder(): MeilisearchAdapterContextBuilder {
  return new MeilisearchAdapterContextBuilder();
}

/** Type alias matching milestone vocabulary. */
export type { MeilisearchAdapterContext as MeilisearchAdapterContextType };
