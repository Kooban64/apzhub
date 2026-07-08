import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

/** Items gated by manifest permission keys — adapter evaluates grants. */
export interface PermissionKeyedDto {
  readonly permissionKeys?: readonly string[];
}

/**
 * Delegates permission evaluation to {@link WorkbenchPermissionAdapter}.
 * Empty `permissionKeys` remain visible per adapter rules for ungated items.
 */
export function filterPermissionKeyedItems<T extends PermissionKeyedDto>(
  items: readonly T[],
  permissionAdapter: WorkbenchPermissionAdapter,
): readonly T[] {
  return items.filter((item) => {
    if (!item.permissionKeys || item.permissionKeys.length === 0) {
      return permissionAdapter.can(undefined);
    }

    return item.permissionKeys.some((key) => permissionAdapter.can(key));
  });
}
