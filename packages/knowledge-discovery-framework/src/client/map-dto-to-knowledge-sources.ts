import { freezeKnowledgeSource } from "../registry/freeze";
import type { KnowledgeSource } from "../types/knowledge-source";
import type { KnowledgeSourceDescriptorDto } from "../server/map-knowledge-source-registry-dto";

/** Map a validated DTO descriptor to a frozen {@link KnowledgeSource}. */
export function mapDescriptorDtoToKnowledgeSource(
  descriptor: KnowledgeSourceDescriptorDto,
): KnowledgeSource {
  return freezeKnowledgeSource({
    id: descriptor.id,
    label: descriptor.label,
    kind: descriptor.kind,
    tier: descriptor.tier,
    priority: descriptor.priority,
    permission: descriptor.permission,
    status: descriptor.status,
    provides: descriptor.provides,
    version: descriptor.version,
    capabilityId: descriptor.capabilityId,
    origin: descriptor.origin,
  });
}

export function mapKnowledgeSourceRegistryDtoToSources(
  sources: readonly KnowledgeSourceDescriptorDto[],
): readonly KnowledgeSource[] {
  return Object.freeze(
    [...sources]
      .map(mapDescriptorDtoToKnowledgeSource)
      .sort(
        (left, right) =>
          left.priority - right.priority || left.id.localeCompare(right.id),
      ),
  );
}
