import type {
  SelectionMode,
  SelectionState,
  WorkbenchSelectionItem,
} from "../../interfaces/types";

export function createEmptySelectionState(): SelectionState {
  return {
    mode: "none",
    items: [],
    byView: {},
  };
}

export function normalizeSelectionItem(item: unknown): WorkbenchSelectionItem | null {
  if (typeof item !== "object" || item === null) {
    return null;
  }

  const candidate = item as WorkbenchSelectionItem;
  if (typeof candidate.id !== "string" || typeof candidate.kind !== "string") {
    return null;
  }

  return {
    id: candidate.id,
    kind: candidate.kind,
    ...(typeof candidate.scope === "string" ? { scope: candidate.scope } : {}),
    ...(typeof candidate.permission === "string"
      ? { permission: candidate.permission }
      : {}),
  };
}

export function inferSelectionMode(
  items: readonly WorkbenchSelectionItem[],
): SelectionMode {
  if (items.length === 0) {
    return "none";
  }

  if (items.length === 1) {
    return "single";
  }

  return "multi";
}

export function parseSelectionState(raw: unknown): SelectionState | undefined {
  if (typeof raw !== "object" || raw === null) {
    return undefined;
  }

  const candidate = raw as Partial<SelectionState>;
  const byView: Record<string, WorkbenchSelectionItem[]> = {};

  if (candidate.byView && typeof candidate.byView === "object") {
    for (const [viewId, items] of Object.entries(candidate.byView)) {
      if (!Array.isArray(items)) {
        continue;
      }

      const parsedItems = items
        .map((item) => normalizeSelectionItem(item))
        .filter((item): item is WorkbenchSelectionItem => item !== null);

      if (parsedItems.length > 0) {
        byView[viewId] = parsedItems;
      }
    }
  }

  const legacyItems = Array.isArray(candidate.items)
    ? candidate.items
        .map((item) => normalizeSelectionItem(item))
        .filter((item): item is WorkbenchSelectionItem => item !== null)
    : [];

  const activeViewId =
    typeof candidate.activeViewId === "string" ? candidate.activeViewId : undefined;

  if (activeViewId && legacyItems.length > 0 && !byView[activeViewId]) {
    byView[activeViewId] = legacyItems;
  }

  const items =
    activeViewId && byView[activeViewId]
      ? byView[activeViewId]
      : legacyItems.length > 0
        ? legacyItems
        : [];

  const mode =
    candidate.mode === "none" ||
    candidate.mode === "single" ||
    candidate.mode === "multi"
      ? candidate.mode
      : inferSelectionMode(items);

  return {
    activeViewId,
    mode,
    items,
    byView,
  };
}
