import { describe, expect, it } from "vitest";

import { mapActionsToPaletteItems } from "./map-palette-items";

describe("mapActionsToPaletteItems", () => {
  it("maps descriptor presentation fields to palette rows", () => {
    const items = mapActionsToPaletteItems([
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        group: "appearance",
        icon: "T",
        description: "Switch between light and dark themes",
        shortcut: "Ctrl+Shift+T",
        disabled: true,
      },
    ]);

    expect(items).toEqual([
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        group: "appearance",
        icon: "T",
        description: "Switch between light and dark themes",
        shortcut: "Ctrl+Shift+T",
        disabled: true,
        pinned: undefined,
      },
    ]);
  });

  it("marks pinned actions when pinnedActionIds is provided", () => {
    const items = mapActionsToPaletteItems(
      [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      { pinnedActionIds: ["b"] },
    );

    expect(items.find((item) => item.id === "b")?.pinned).toBe(true);
    expect(items.find((item) => item.id === "a")?.pinned).toBeUndefined();
  });
});
