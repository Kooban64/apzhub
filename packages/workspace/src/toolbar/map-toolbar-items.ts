import type { ActionToolbarItemDto } from "@apzhub/command-framework/react";
import type { ReadOnlyActionRegistry } from "@apzhub/command-framework";
import type { ToolbarItem } from "@apzhub/ui";

/** Resolve toolbar DTO items against the read-only action registry. */
export function mapToolbarItems(
  items: readonly ActionToolbarItemDto[],
  registry: ReadOnlyActionRegistry,
): ToolbarItem[] {
  const mapped: ToolbarItem[] = [];

  for (const item of items) {
    const action = registry.get(item.commandId);

    if (!action) {
      continue;
    }

    mapped.push({
      id: item.commandId,
      label: item.label ?? action.label,
      icon: item.icon ?? action.icon,
      description: action.description,
      disabled: action.disabled,
    });
  }

  return mapped;
}
