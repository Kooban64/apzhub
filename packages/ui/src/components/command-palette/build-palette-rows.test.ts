import { describe, expect, it } from "vitest";

import { buildCommandPaletteRows } from "./build-palette-rows";
import type { CommandPaletteItem } from "./types";

describe("buildCommandPaletteRows", () => {
  it("groups commands by group label with section headers", () => {
    const commands: CommandPaletteItem[] = [
      { id: "a", label: "Alpha", group: "View" },
      { id: "b", label: "Beta", group: "Panel" },
      { id: "c", label: "Gamma", group: "View" },
    ];

    const { rows } = buildCommandPaletteRows(commands);

    expect(
      rows.filter((row) => row.type === "section").map((row) => row.label),
    ).toEqual(["View", "Panel"]);
  });

  it("renders pinned section before grouped items", () => {
    const commands: CommandPaletteItem[] = [
      { id: "regular", label: "Regular", group: "View" },
      { id: "pinned", label: "Pinned", group: "View", pinned: true },
    ];

    const { rows } = buildCommandPaletteRows(commands);

    expect(rows[0]).toMatchObject({ type: "section", label: "Pinned" });
    expect(rows[1]).toMatchObject({ type: "item", item: { id: "pinned" } });
  });

  it("excludes disabled items from selectable navigation", () => {
    const commands: CommandPaletteItem[] = [
      { id: "enabled", label: "Enabled" },
      { id: "disabled", label: "Disabled", disabled: true },
    ];

    const { selectableItems } = buildCommandPaletteRows(commands);

    expect(selectableItems).toHaveLength(1);
    expect(selectableItems[0]?.id).toBe("enabled");
  });
});
