import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { ActionRegistryDto } from "./map-action-registry-dto";

/**
 * Permission-filter action DTO before client hydration (ADR-0023).
 *
 * The Action Framework does not evaluate permissions — it delegates to
 * {@link WorkbenchPermissionAdapter}. Items without a `permission` key remain
 * visible for authenticated contexts per adapter rules.
 */
export function filterActionRegistryDto(
  dto: ActionRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): ActionRegistryDto {
  const actions = permissionAdapter.filter([...dto.actions]);
  const allowedIds = new Set(actions.map((action) => action.id));

  const toolbar = dto.toolbar.map((region) => ({
    ...region,
    items: region.items.filter((item) => allowedIds.has(item.commandId)),
  }));

  return {
    actions,
    toolbar,
  };
}
