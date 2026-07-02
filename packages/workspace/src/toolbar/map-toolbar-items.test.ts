import { describe, expect, it } from "vitest";

import { ClientActionRegistry } from "@apzhub/command-framework";

import { mapToolbarItems } from "./map-toolbar-items";

describe("mapToolbarItems", () => {
  it("merges DTO overrides with registry descriptors", () => {
    const registry = new ClientActionRegistry({
      actions: [
        {
          id: "platform.theme.toggle",
          label: "Toggle Theme",
          handler: "service:theme:toggle",
          handlerKind: "service",
          source: "manifest",
          icon: "T",
          description: "Switch theme",
        },
      ],
    });

    const items = mapToolbarItems(
      [{ commandId: "platform.theme.toggle", label: "Theme", icon: "☀", order: 10 }],
      registry,
    );

    expect(items).toEqual([
      {
        id: "platform.theme.toggle",
        label: "Theme",
        icon: "☀",
        description: "Switch theme",
        disabled: undefined,
      },
    ]);
  });

  it("skips items whose command is missing from the registry", () => {
    const registry = new ClientActionRegistry({ actions: [] });

    expect(mapToolbarItems([{ commandId: "missing.action" }], registry)).toEqual([]);
  });
});
