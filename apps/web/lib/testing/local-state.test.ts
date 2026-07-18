import { describe, expect, it } from "vitest";

import {
  applyListFilters,
  DEFAULT_TESTING_FILTERS,
  DEFAULT_TESTING_SELECTION,
  toggleExpanded,
  toggleSelection,
  type TestingFilterState,
} from "./local-state";

describe("testing local state helpers", () => {
  it("toggles single and bulk selection", () => {
    expect(toggleSelection(DEFAULT_TESTING_SELECTION, "a")).toEqual({
      mode: "single",
      selectedIds: ["a"],
    });

    expect(toggleSelection({ mode: "single", selectedIds: ["a"] }, "a")).toEqual(
      DEFAULT_TESTING_SELECTION,
    );

    expect(toggleSelection(DEFAULT_TESTING_SELECTION, "a", true)).toEqual({
      mode: "single",
      selectedIds: ["a"],
    });

    expect(toggleSelection({ mode: "single", selectedIds: ["a"] }, "b", true)).toEqual({
      mode: "bulk",
      selectedIds: ["a", "b"],
    });

    expect(
      toggleSelection({ mode: "bulk", selectedIds: ["a", "b"] }, "a", true),
    ).toEqual({
      mode: "single",
      selectedIds: ["b"],
    });

    expect(toggleSelection({ mode: "single", selectedIds: ["b"] }, "b", true)).toEqual(
      DEFAULT_TESTING_SELECTION,
    );
  });

  it("toggles expanded ids", () => {
    expect(toggleExpanded([], "x")).toEqual(["x"]);
    expect(toggleExpanded(["x"], "x")).toEqual([]);
    expect(toggleExpanded(["x"], "y")).toEqual(["x", "y"]);
  });

  it("filters by status and search, then sorts", () => {
    const items = [
      { id: "1", title: "Alpha plan", status: "active", updatedAt: "2026-01-03" },
      { id: "2", title: "Beta plan", status: "draft", updatedAt: "2026-01-01" },
      { id: "3", name: "Gamma suite", status: "active", updatedAt: "2026-01-02" },
    ];

    const statusFiltered = applyListFilters(items, {
      ...DEFAULT_TESTING_FILTERS,
      status: "active",
    });
    expect(statusFiltered.map((item) => item.id)).toEqual(["1", "3"]);

    const searchFiltered = applyListFilters(items, {
      ...DEFAULT_TESTING_FILTERS,
      search: "beta",
    });
    expect(searchFiltered.map((item) => item.id)).toEqual(["2"]);

    const asc: TestingFilterState = {
      ...DEFAULT_TESTING_FILTERS,
      sort: "updatedAt",
      order: "asc",
    };
    expect(applyListFilters(items, asc).map((item) => item.id)).toEqual([
      "2",
      "3",
      "1",
    ]);

    const desc: TestingFilterState = {
      ...DEFAULT_TESTING_FILTERS,
      sort: "updatedAt",
      order: "desc",
    };
    expect(applyListFilters(items, desc).map((item) => item.id)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });
});
