import type { CommandPaletteItem } from "@apzhub/ui";

export interface PaletteActionSource {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly description?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

export interface MapActionsToPaletteItemsOptions {
  readonly pinnedActionIds?: readonly string[];
}

/** Maps registry action descriptors to presentational palette rows. */
export function mapActionsToPaletteItems(
  actions: ReadonlyArray<PaletteActionSource>,
  options: MapActionsToPaletteItemsOptions = {},
): CommandPaletteItem[] {
  const pinnedIds = new Set(options.pinnedActionIds ?? []);

  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    group: action.group,
    icon: action.icon,
    description: action.description,
    shortcut: action.shortcut,
    disabled: action.disabled,
    pinned: pinnedIds.has(action.id) ? true : undefined,
  }));
}
