/**
 * Local UI state helpers for Testing workbench — selection, filters, layout prefs.
 * No business state.
 */

export type TestingSortOrder = "asc" | "desc";

export type TestingFilterState = {
  readonly search: string;
  readonly status: string;
  readonly sort: string;
  readonly order: TestingSortOrder;
};

export type TestingSelectionState = {
  readonly mode: "none" | "single" | "bulk";
  readonly selectedIds: readonly string[];
};

export type TestingLayoutState = {
  readonly splitView: boolean;
  readonly expandedIds: readonly string[];
  readonly activeTab: string;
};

export const DEFAULT_TESTING_FILTERS: TestingFilterState = {
  search: "",
  status: "",
  sort: "updatedAt",
  order: "desc",
};

export const DEFAULT_TESTING_SELECTION: TestingSelectionState = {
  mode: "none",
  selectedIds: [],
};

export const DEFAULT_TESTING_LAYOUT: TestingLayoutState = {
  splitView: false,
  expandedIds: [],
  activeTab: "overview",
};

export function toggleSelection(
  state: TestingSelectionState,
  id: string,
  bulk = false,
): TestingSelectionState {
  const exists = state.selectedIds.includes(id);
  if (!bulk) {
    return exists && state.selectedIds.length === 1
      ? DEFAULT_TESTING_SELECTION
      : { mode: "single", selectedIds: [id] };
  }
  const selectedIds = exists
    ? state.selectedIds.filter((item) => item !== id)
    : [...state.selectedIds, id];
  return {
    mode: selectedIds.length > 1 ? "bulk" : selectedIds.length === 1 ? "single" : "none",
    selectedIds,
  };
}

export function toggleExpanded(
  expandedIds: readonly string[],
  id: string,
): readonly string[] {
  return expandedIds.includes(id)
    ? expandedIds.filter((item) => item !== id)
    : [...expandedIds, id];
}

export function applyListFilters<T extends { readonly status?: string; readonly title?: string; readonly name?: string; readonly key?: string }>(
  items: readonly T[],
  filters: TestingFilterState,
): readonly T[] {
  const search = filters.search.trim().toLowerCase();
  let next = items;
  if (filters.status) {
    next = next.filter((item) => item.status === filters.status);
  }
  if (search) {
    next = next.filter((item) => {
      const haystack = [item.title, item.name, item.key, item.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }
  const sorted = [...next].sort((a, b) => {
    const left = String((a as Record<string, unknown>)[filters.sort] ?? "");
    const right = String((b as Record<string, unknown>)[filters.sort] ?? "");
    const cmp = left.localeCompare(right);
    return filters.order === "asc" ? cmp : -cmp;
  });
  return sorted;
}
