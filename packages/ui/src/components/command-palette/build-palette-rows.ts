import type { CommandPaletteItem } from "./types";

export interface CommandPaletteSectionRow {
  readonly type: "section";
  readonly id: string;
  readonly label: string;
}

export interface CommandPaletteItemRow {
  readonly type: "item";
  readonly item: CommandPaletteItem;
  /** Index among selectable (non-disabled) items for keyboard navigation. */
  readonly selectableIndex: number;
}

export type CommandPaletteRow = CommandPaletteSectionRow | CommandPaletteItemRow;

export interface CommandPaletteRowLayout {
  readonly rows: readonly CommandPaletteRow[];
  readonly selectableItems: readonly CommandPaletteItem[];
}

const DEFAULT_GROUP_KEY = "__ungrouped__";

function groupKey(item: CommandPaletteItem): string {
  return item.group?.trim() ? item.group : DEFAULT_GROUP_KEY;
}

function appendItems(
  rows: CommandPaletteRow[],
  selectableItems: CommandPaletteItem[],
  items: readonly CommandPaletteItem[],
): void {
  let selectableIndex = selectableItems.length;

  for (const item of items) {
    if (!item.disabled) {
      selectableItems.push(item);
      rows.push({ type: "item", item, selectableIndex });
      selectableIndex += 1;
      continue;
    }

    rows.push({ type: "item", item, selectableIndex: -1 });
  }
}

/** Builds grouped palette rows with optional pinned and group sections. */
export function buildCommandPaletteRows(
  commands: readonly CommandPaletteItem[],
): CommandPaletteRowLayout {
  const rows: CommandPaletteRow[] = [];
  const selectableItems: CommandPaletteItem[] = [];

  const pinned = commands.filter((command) => command.pinned);
  const regular = commands.filter((command) => !command.pinned);

  if (pinned.length > 0) {
    rows.push({
      type: "section",
      id: "command-palette-section-pinned",
      label: "Pinned",
    });
    appendItems(rows, selectableItems, pinned);
  }

  const grouped = new Map<string, CommandPaletteItem[]>();
  const groupOrder: string[] = [];

  for (const item of regular) {
    const key = groupKey(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
      groupOrder.push(key);
    }
    grouped.get(key)!.push(item);
  }

  for (const key of groupOrder) {
    const items = grouped.get(key) ?? [];
    if (items.length === 0) {
      continue;
    }

    if (key !== DEFAULT_GROUP_KEY) {
      rows.push({
        type: "section",
        id: `command-palette-section-${key}`,
        label: key,
      });
    }

    appendItems(rows, selectableItems, items);
  }

  return { rows, selectableItems };
}
