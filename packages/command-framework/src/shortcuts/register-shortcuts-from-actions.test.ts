import { describe, expect, it } from "vitest";

import type { ActionDescriptor } from "../types";
import { createDefaultShortcutRegistry } from "./default-shortcut-registry";
import { registerShortcutsFromActions } from "./register-shortcuts-from-actions";

function action(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id" | "label">,
): ActionDescriptor {
  return {
    handler: "workbench-bridge:workbench.view.open",
    handlerKind: "workbench-bridge",
    source: "manifest",
    ...overrides,
  };
}

describe("registerShortcutsFromActions", () => {
  it("registers manifest shortcut fields from action descriptors", () => {
    const registry = createDefaultShortcutRegistry();

    const result = registerShortcutsFromActions(registry, [
      action({
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        shortcut: "Ctrl+Shift+T",
      }),
      action({
        id: "workbench.view.open",
        label: "Open View",
      }),
    ]);

    expect(result.registeredCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(registry.lookup("Ctrl+Shift+T")).toBe("platform.theme.toggle");
  });

  it("reports conflicts when manifest actions share a chord", () => {
    const registry = createDefaultShortcutRegistry();

    registerShortcutsFromActions(registry, [
      action({
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        shortcut: "Ctrl+Shift+T",
      }),
      action({
        id: "workbench.view.open",
        label: "Open View",
        shortcut: "ctrl+shift+t",
      }),
    ]);

    expect(registry.getConflicts()).toHaveLength(1);
  });
});
