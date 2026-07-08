import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { KnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";

/**
 * Permission-filter knowledge source DTO before client hydration (ADR-0023 pattern).
 *
 * The Knowledge Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Sources without a `permission` key remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterKnowledgeSourceRegistryDto(
  dto: KnowledgeSourceRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): KnowledgeSourceRegistryDto {
  const sources = permissionAdapter.filter([...dto.sources]);

  return {
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    sources,
  };
}
