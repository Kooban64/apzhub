import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../catalogue/platform-knowledge-source-catalogue";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";

export function sampleKnowledgeSourceRegistryDto(
  overrides: Partial<KnowledgeSourceRegistryDto> = {},
): KnowledgeSourceRegistryDto {
  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "0.5.0",
    sources: PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.map((source) => ({
      id: source.id,
      label: source.label,
      kind: source.kind,
      tier: source.tier,
      priority: source.priority,
      status: source.status,
      provides: source.provides,
      version: source.version,
      origin: source.origin,
    })),
    ...overrides,
  };
}
