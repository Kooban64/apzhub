import type { ActionDescriptor } from "../types";
import type { ActionRegistryListOptions } from "./action-registry";
import {
  filterActionsByContext,
  type ActionContextSnapshot,
  type ActionSelectionSnapshot,
} from "./context-filter";

const DEFAULT_ORDER = 100;
const DEFAULT_GROUP = "";

/**
 * Deterministic registry ordering contract:
 * 1. order (ascending)
 * 2. group (ascending)
 * 3. label (ascending)
 * 4. id (ascending)
 */
export function sortActionDescriptors(
  descriptors: readonly ActionDescriptor[],
): readonly ActionDescriptor[] {
  return [...descriptors].sort((left, right) => {
    const orderDelta = (left.order ?? DEFAULT_ORDER) - (right.order ?? DEFAULT_ORDER);
    if (orderDelta !== 0) {
      return orderDelta;
    }

    const groupDelta = (left.group ?? DEFAULT_GROUP).localeCompare(
      right.group ?? DEFAULT_GROUP,
    );
    if (groupDelta !== 0) {
      return groupDelta;
    }

    const labelDelta = left.label.localeCompare(right.label);
    if (labelDelta !== 0) {
      return labelDelta;
    }

    return left.id.localeCompare(right.id);
  });
}

function toContextFilter(options: ActionRegistryListOptions): {
  readonly surface?: string;
  readonly selection?: ActionSelectionSnapshot;
  readonly context?: ActionContextSnapshot;
} {
  return {
    surface: options.surface,
    selection: options.selection,
    context: options.context,
  };
}

/** Basic list filters — permission filtering is server-side (AF-005). */
export function filterActionDescriptors(
  descriptors: readonly ActionDescriptor[],
  options?: ActionRegistryListOptions,
): readonly ActionDescriptor[] {
  if (!options) {
    return sortActionDescriptors(descriptors);
  }

  let result = descriptors;

  if (options.palette === true) {
    result = result.filter((descriptor) => descriptor.palette !== false);
  } else if (options.palette === false) {
    result = result.filter((descriptor) => descriptor.palette === false);
  }

  if (options.query?.trim()) {
    const query = options.query.trim().toLowerCase();
    result = result.filter(
      (descriptor) =>
        descriptor.label.toLowerCase().includes(query) ||
        descriptor.id.toLowerCase().includes(query),
    );
  }

  if (options.surface || options.selection || options.context) {
    result = filterActionsByContext(result, toContextFilter(options));
  }

  return sortActionDescriptors(result);
}
