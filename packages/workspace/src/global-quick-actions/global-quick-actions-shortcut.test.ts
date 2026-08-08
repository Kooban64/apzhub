import { describe, expect, it } from "vitest";

import { isGlobalQuickActionsShortcut } from "./global-quick-actions-shortcut";

describe("isGlobalQuickActionsShortcut", () => {
  it("matches Ctrl+Shift+A on Windows/Linux", () => {
    expect(
      isGlobalQuickActionsShortcut({
        key: "A",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(true);
  });

  it("ignores Ctrl+A without Shift", () => {
    expect(
      isGlobalQuickActionsShortcut({
        key: "a",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false);
  });

  it("ignores Ctrl+Shift+P", () => {
    expect(
      isGlobalQuickActionsShortcut({
        key: "p",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(false);
  });
});
