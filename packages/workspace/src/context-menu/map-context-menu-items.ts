import type { ContextMenuItem } from "@apzhub/ui";

export interface ContextMenuActionSource {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly description?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

/** Maps registry action descriptors to presentational context menu rows. */
export function mapActionsToContextMenuItems(
  actions: ReadonlyArray<ContextMenuActionSource>,
): ContextMenuItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    group: action.group,
    icon: action.icon,
    description: action.description,
    shortcut: action.shortcut,
    disabled: action.disabled,
  }));
}
