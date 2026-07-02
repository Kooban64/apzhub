import { describe, expect, it } from "vitest";

import { mapActionsToContextMenuItems } from "./map-context-menu-items";

describe("mapActionsToContextMenuItems", () => {
  it("maps descriptor presentation fields to menu rows", () => {
    expect(
      mapActionsToContextMenuItems([
        {
          id: "record.edit",
          label: "Edit Record",
          description: "Edit the selected record",
          icon: "E",
          shortcut: "Ctrl+E",
          disabled: true,
        },
      ]),
    ).toEqual([
      {
        id: "record.edit",
        label: "Edit Record",
        description: "Edit the selected record",
        icon: "E",
        shortcut: "Ctrl+E",
        disabled: true,
        group: undefined,
      },
    ]);
  });
});
