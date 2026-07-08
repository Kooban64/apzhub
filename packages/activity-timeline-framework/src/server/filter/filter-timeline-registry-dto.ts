import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { TimelineRegistryDto } from "./map-timeline-registry-dto";
import { filterPermissionKeyedItems } from "./permission-filter";

/**
 * Permission-filter timeline DTO before client hydration (ADR-0023 pattern).
 *
 * The Activity Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Timelines without `permissionKeys` remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterTimelineRegistryDto(
  dto: TimelineRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): TimelineRegistryDto {
  const timelines = filterPermissionKeyedItems([...dto.timelines], permissionAdapter);

  return Object.freeze({
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    timelines: Object.freeze([...timelines]),
  });
}
