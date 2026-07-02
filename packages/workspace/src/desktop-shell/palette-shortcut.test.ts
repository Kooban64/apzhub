import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  isCommandPaletteShortcut,
  isEditableShortcutTarget,
  shouldIgnoreCommandPaletteShortcut,
  useCommandPaletteShortcut,
} from "./palette-shortcut";

describe("isCommandPaletteShortcut", () => {
  it("matches Ctrl+Shift+P on Windows/Linux", () => {
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

  it("matches Meta+Shift+P on macOS", () => {
    vi.stubGlobal("navigator", { userAgent: "Macintosh" });

    expect(
      isCommandPaletteShortcut({
        key: "p",
        ctrlKey: false,
        metaKey: true,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(true);
  });

  it("rejects chords without shift", () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });

    expect(
      isCommandPaletteShortcut({
        key: "p",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false);
  });
});

describe("shouldIgnoreCommandPaletteShortcut", () => {
  it("ignores shortcuts while typing in unrelated inputs", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    expect(
      shouldIgnoreCommandPaletteShortcut({ target: input }, { paletteOpen: false }),
    ).toBe(true);

    document.body.removeChild(input);
  });

  it("allows shortcuts when the palette is already open", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    expect(
      shouldIgnoreCommandPaletteShortcut({ target: input }, { paletteOpen: true }),
    ).toBe(false);

    document.body.removeChild(input);
  });

  it("does not ignore palette combobox input", () => {
    const palette = document.createElement("div");
    palette.setAttribute("data-testid", "command-palette");
    const input = document.createElement("input");
    input.setAttribute("role", "combobox");
    palette.appendChild(input);
    document.body.appendChild(palette);

    expect(isEditableShortcutTarget(input)).toBe(false);

    document.body.removeChild(palette);
  });
});

describe("useCommandPaletteShortcut", () => {
  it("opens the palette when the shortcut is pressed", () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });
    const onOpen = vi.fn();

    renderHook(() =>
      useCommandPaletteShortcut({
        enabled: true,
        onOpen,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "P",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      }),
    );

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("does not open when focus is in an unrelated text input", () => {
    vi.stubGlobal("navigator", { userAgent: "Windows NT 10.0" });
    const onOpen = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() =>
      useCommandPaletteShortcut({
        enabled: true,
        onOpen,
      }),
    );

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "P",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(onOpen).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
