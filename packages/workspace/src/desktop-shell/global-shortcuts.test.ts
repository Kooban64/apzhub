import { describe, expect, it, vi } from "vitest";

import { isCommandPaletteShortcut, isEditableShortcutTarget } from "./palette-shortcut";
import { shouldIgnoreGlobalShortcut } from "./global-shortcuts";

describe("shouldIgnoreGlobalShortcut", () => {
  it("ignores shortcuts while typing in unrelated inputs", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    expect(shouldIgnoreGlobalShortcut({ target: input })).toBe(true);

    document.body.removeChild(input);
  });

  it("ignores shortcuts when a modal is open", () => {
    expect(
      shouldIgnoreGlobalShortcut({ target: document.body }, { modalOpen: true }),
    ).toBe(true);
  });

  it("ignores shortcuts while the command palette input is focused", () => {
    const palette = document.createElement("div");
    palette.setAttribute("data-testid", "command-palette");
    const input = document.createElement("input");
    input.setAttribute("role", "combobox");
    palette.appendChild(input);
    document.body.appendChild(palette);

    expect(shouldIgnoreGlobalShortcut({ target: input })).toBe(true);
    expect(isEditableShortcutTarget(input)).toBe(false);

    document.body.removeChild(palette);
  });

  it("does not ignore shortcuts on the shell root", () => {
    expect(shouldIgnoreGlobalShortcut({ target: document.body })).toBe(false);
  });
});

describe("palette shortcut separation", () => {
  it("does not treat palette chord as a registry global shortcut candidate in listener guard", () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });

    expect(
      isCommandPaletteShortcut({
        key: "P",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(true);
  });
});
