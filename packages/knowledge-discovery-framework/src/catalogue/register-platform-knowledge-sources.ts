import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeBatchRegistrationResult } from "../registry/knowledge-batch-registration";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "./platform-knowledge-source-catalogue";

export interface RegisterPlatformKnowledgeSourcesOptions {
  readonly frameworkVersion?: string;
}

export interface RegisterPlatformKnowledgeSourcesResult extends KnowledgeBatchRegistrationResult {
  readonly catalogueCount: number;
}

/**
 * Register built-in T0 knowledge sources that reference existing platform registries.
 * Does not duplicate Action, Navigation, or Capability manifest definitions.
 */
export function registerPlatformKnowledgeSourceCatalogue(
  registry: KnowledgeRegistry,
  options: RegisterPlatformKnowledgeSourcesOptions = {},
): RegisterPlatformKnowledgeSourcesResult {
  const registration = registry.registerManySourcesAtomic([
    ...PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE,
  ]);

  if (registration.ok && options.frameworkVersion) {
    registry.recordFrameworkVersion(options.frameworkVersion);
  }

  return {
    ...registration,
    catalogueCount: PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.length,
  };
}
