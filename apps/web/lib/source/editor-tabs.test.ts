import { describe, expect, it } from "vitest";

import {
  closeTab,
  cycleTabPath,
  isTabDirty,
  markTabClean,
  moveTreeFocus,
  openOrFocusTab,
  tabBasename,
  updateTabDraft,
} from "./editor-tabs";

describe("source editor tabs", () => {
  it("opens, dirties, cleans, and closes with focus fallback", () => {
    let tabs = openOrFocusTab([], "src/a.ts", "a").tabs;
    tabs = openOrFocusTab(tabs, "src/b.ts", "b").tabs;
    expect(tabs).toHaveLength(2);

    tabs = updateTabDraft(tabs, "src/a.ts", "a2");
    expect(isTabDirty(tabs[0]!)).toBe(true);

    tabs = markTabClean(tabs, "src/a.ts", "a2");
    expect(isTabDirty(tabs[0]!)).toBe(false);

    const closed = closeTab(tabs, "src/a.ts", "src/a.ts");
    expect(closed.tabs.map((t) => t.path)).toEqual(["src/b.ts"]);
    expect(closed.activePath).toBe("src/b.ts");
  });

  it("cycles tabs and tree focus", () => {
    const tabs = openOrFocusTab(openOrFocusTab([], "one", "1").tabs, "two", "2").tabs;
    expect(cycleTabPath(tabs, "one", 1)).toBe("two");
    expect(cycleTabPath(tabs, "two", 1)).toBe("one");
    expect(moveTreeFocus(3, 2, 1)).toBe(0);
    expect(tabBasename("docs/a.md")).toBe("a.md");
  });
});
