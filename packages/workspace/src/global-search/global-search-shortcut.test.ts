import { describe, expect, it } from "vitest";

import { isGlobalSearchShortcut } from "./global-search-shortcut";

describe("isGlobalSearchShortcut", () => {
  it("matches Ctrl+K on non-Mac", () => {
    const original = navigator.userAgent;
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (X11; Linux x86_64)",
      configurable: true,
    });
    expect(
      isGlobalSearchShortcut({
        key: "k",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(true);
    Object.defineProperty(navigator, "userAgent", {
      value: original,
      configurable: true,
    });
  });

  it("ignores Ctrl+Shift+K", () => {
    expect(
      isGlobalSearchShortcut({
        key: "k",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(false);
  });
});
