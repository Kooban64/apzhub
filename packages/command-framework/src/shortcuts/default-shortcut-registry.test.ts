import { describe, expect, it } from "vitest";

import { createDefaultShortcutRegistry } from "./default-shortcut-registry";
import { ShortcutRegistryValidationError } from "./shortcut-registry-errors";

describe("DefaultShortcutRegistry", () => {
  it("registers and resolves a chord", () => {
    const registry = createDefaultShortcutRegistry();

    registry.register({
      commandId: "platform.theme.toggle",
      chord: "Ctrl+Shift+T",
      source: "manifest",
    });

    expect(registry.lookup("ctrl+shift+t")).toBe("platform.theme.toggle");
    expect(
      registry.resolve({
        key: "t",
        ctrlKey: true,
        shiftKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe("platform.theme.toggle");
  });

  it("returns null when no shortcut matches", () => {
    const registry = createDefaultShortcutRegistry();

    expect(
      registry.resolve({
        key: "z",
        ctrlKey: true,
        shiftKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBeNull();
  });

  it("detects duplicate chord registrations", () => {
    const registry = createDefaultShortcutRegistry();

    registry.register({
      commandId: "platform.theme.toggle",
      chord: "Ctrl+Shift+T",
      source: "manifest",
    });
    registry.register({
      commandId: "workbench.view.open",
      chord: "Ctrl+Shift+T",
      source: "builtin",
    });

    const conflicts = registry.getConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.chord).toBe("Ctrl+Shift+T");
    expect(conflicts[0]?.commandIds).toEqual([
      "platform.theme.toggle",
      "workbench.view.open",
    ]);
    expect(registry.getDiagnostics().conflictCount).toBe(1);
  });

  it("resolves to the first registered command for duplicate chords", () => {
    const registry = createDefaultShortcutRegistry();

    registry.register({
      commandId: "platform.theme.toggle",
      chord: "Ctrl+Shift+T",
      source: "manifest",
    });
    registry.register({
      commandId: "workbench.view.open",
      chord: "Ctrl+Shift+T",
      source: "builtin",
    });

    expect(registry.lookup("Ctrl+Shift+T")).toBe("platform.theme.toggle");
  });

  it("reports diagnostics for registrations", () => {
    const registry = createDefaultShortcutRegistry();

    registry.register({
      commandId: "workbench.view.open",
      chord: "Ctrl+Shift+V",
      source: "builtin",
    });

    expect(registry.getDiagnostics()).toMatchObject({
      status: "ready",
      registrationCount: 1,
      uniqueChordCount: 1,
      conflictCount: 0,
    });
  });

  it("rejects invalid registrations", () => {
    const registry = createDefaultShortcutRegistry();

    expect(() =>
      registry.register({
        commandId: "",
        chord: "Ctrl+Shift+T",
        source: "manifest",
      }),
    ).toThrow(ShortcutRegistryValidationError);

    expect(() =>
      registry.register({
        commandId: "platform.theme.toggle",
        chord: "   ",
        source: "manifest",
      }),
    ).toThrow(ShortcutRegistryValidationError);
  });
});
