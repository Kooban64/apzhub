import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { ActivityRegistryDto } from "./map-activity-registry-dto";
import { filterPermissionKeyedItems } from "./permission-filter";

/**
 * Permission-filter activity DTO before client hydration (ADR-0023 pattern).
 *
 * The Activity Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Types without `permissionKeys` remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterActivityRegistryDto(
  dto: ActivityRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): ActivityRegistryDto {
  const types = filterPermissionKeyedItems([...dto.types], permissionAdapter);

  return Object.freeze({
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    types: Object.freeze([...types]),
  });
}
