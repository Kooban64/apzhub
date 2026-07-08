import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { NotificationRegistryDto } from "./map-notification-registry-dto";

/**
 * Permission-filter notification DTO before client hydration (ADR-0023 pattern).
 *
 * The Notification Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Routes without a `permission` key remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterNotificationRegistryDto(
  dto: NotificationRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): NotificationRegistryDto {
  const routes = permissionAdapter.filter([...dto.routes]);

  return Object.freeze({
    schemaVersion: dto.schemaVersion,
    frameworkVersion: dto.frameworkVersion,
    routes: Object.freeze([...routes]),
  });
}
