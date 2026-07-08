import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeSource } from "../types/knowledge-source";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";

/** Client-safe knowledge source descriptor — read-only projection (DF-005). */
export interface KnowledgeSourceDescriptorDto {
  readonly id: string;
  readonly label: string;
  readonly kind: KnowledgeSource["kind"];
  readonly tier: KnowledgeSource["tier"];
  readonly priority: number;
  readonly permission?: string;
  readonly status: KnowledgeSource["status"];
  readonly provides: readonly KnowledgeSource["provides"][number][];
  readonly version?: string;
  readonly capabilityId?: string;
  readonly origin?: KnowledgeSource["origin"];
}

/** Server-authoritative, versioned Knowledge Registry projection (DF-005). */
export interface KnowledgeSourceRegistryDto {
  readonly schemaVersion: typeof KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly sources: readonly KnowledgeSourceDescriptorDto[];
}

export function createEmptyKnowledgeSourceRegistryDto(): KnowledgeSourceRegistryDto {
  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    sources: [],
  };
}

export function mapKnowledgeSourceToDescriptorDto(
  source: KnowledgeSource,
): KnowledgeSourceDescriptorDto {
  return {
    id: source.id,
    label: source.label,
    kind: source.kind,
    tier: source.tier,
    priority: source.priority,
    permission: source.permission,
    status: source.status,
    provides: source.provides,
    version: source.version,
    capabilityId: source.capabilityId,
    origin: source.origin,
  };
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapKnowledgeSourceRegistryDto(
  registry: KnowledgeRegistry,
): KnowledgeSourceRegistryDto {
  const metadata = registry.getRegistryMetadata();

  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: metadata.frameworkVersion,
    sources: Object.freeze(
      registry
        .listSources()
        .map(mapKnowledgeSourceToDescriptorDto)
        .sort(
          (left, right) =>
            left.priority - right.priority || left.id.localeCompare(right.id),
        ),
    ),
  };
}
