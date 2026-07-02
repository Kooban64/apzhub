import type { WorkbenchPermissionAdapter } from "../../interfaces/permission-adapter";
import type { SelectionState, WorkbenchSelectionItem } from "../../interfaces/types";
import {
  createEmptySelectionState,
  inferSelectionMode,
  normalizeSelectionItem,
} from "./selection-state";

export interface SelectionRestoreInput {
  readonly selection: SelectionState | undefined;
  readonly focusedViewId: string | undefined;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
}

export interface SanitizedSelectionRestore {
  readonly selection: SelectionState;
  readonly droppedInvalidCount: number;
  readonly errors: readonly string[];
}

export function sanitizeSelectionForRestore(
  input: SelectionRestoreInput,
): SanitizedSelectionRestore {
  const { selection, focusedViewId, permissionAdapter } = input;

  if (!selection || !focusedViewId) {
    return {
      selection: createEmptySelectionState(),
      droppedInvalidCount: selection?.items.length ?? 0,
      errors: focusedViewId
        ? []
        : ["Cleared selection because focused view is unavailable"],
    };
  }

  const errors: string[] = [];
  let droppedInvalidCount = 0;
  const sanitizedByView: Record<string, WorkbenchSelectionItem[]> = {};

  for (const [viewId, items] of Object.entries(selection.byView)) {
    const { items: sanitizedItems, droppedCount } = sanitizeItems(
      items,
      permissionAdapter,
    );
    droppedInvalidCount += droppedCount;

    if (droppedCount > 0) {
      errors.push(
        `Dropped ${droppedCount} inaccessible selection item(s) for view "${viewId}"`,
      );
    }

    if (sanitizedItems.length > 0) {
      sanitizedByView[viewId] = sanitizedItems;
    } else if (items.length > 0) {
      errors.push(`Dropped inaccessible selection for view "${viewId}"`);
    }
  }

  if (Object.keys(sanitizedByView).length === 0 && selection.items.length > 0) {
    const { items: fallbackItems, droppedCount } = sanitizeItems(
      selection.items,
      permissionAdapter,
    );
    droppedInvalidCount += droppedCount;

    if (droppedCount > 0) {
      errors.push(
        `Dropped ${droppedCount} inaccessible selection item(s) during restore`,
      );
    }

    if (fallbackItems.length > 0) {
      sanitizedByView[focusedViewId] = fallbackItems;
    }
  }

  const activeItems = sanitizedByView[focusedViewId] ?? [];
  if (selection.items.length > 0 && activeItems.length === 0) {
    errors.push(`Dropped selection for inaccessible focused view "${focusedViewId}"`);
  }

  return {
    selection: {
      activeViewId: focusedViewId,
      mode: inferSelectionMode(activeItems),
      items: activeItems,
      byView: sanitizedByView,
    },
    droppedInvalidCount,
    errors,
  };
}

function sanitizeItems(
  items: readonly unknown[],
  permissionAdapter: WorkbenchPermissionAdapter,
): { items: WorkbenchSelectionItem[]; droppedCount: number } {
  const normalized = items
    .map((item) => normalizeSelectionItem(item))
    .filter((item): item is WorkbenchSelectionItem => item !== null);

  const filtered = permissionAdapter.filter(normalized);

  return {
    items: filtered,
    droppedCount: normalized.length - filtered.length,
  };
}
