import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { EventRegistryDto } from "./map-event-registry-dto";

/**
 * Permission-filter event DTO before client hydration (ADR-0023 pattern).
 *
 * The Event Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Events without a `permission` key remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterEventRegistryDto(
  dto: EventRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): EventRegistryDto {
  const events = permissionAdapter.filter([...dto.events]);

  return Object.freeze({
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    events: Object.freeze([...events]),
  });
}
