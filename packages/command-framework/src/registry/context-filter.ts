import type { ActionContextPredicate, ActionDescriptor } from "../types";

export interface ActionSelectionSnapshot {
  readonly mode: "none" | "single" | "multi";
}

export interface ActionContextSnapshot {
  readonly contextTypes?: readonly string[];
}

export interface ActionContextFilterInput {
  readonly surface?: string;
  readonly selection?: ActionSelectionSnapshot;
  readonly context?: ActionContextSnapshot;
}

function matchesSurface(
  predicate: ActionContextPredicate | undefined,
  surface?: string,
): boolean {
  if (!surface) {
    return true;
  }

  const surfaces = predicate?.surfaces;
  if (!surfaces || surfaces.length === 0) {
    return true;
  }

  return surfaces.includes(surface);
}

function matchesSelectionKind(
  predicate: ActionContextPredicate | undefined,
  selection?: ActionSelectionSnapshot,
): boolean {
  const kinds = predicate?.selectionKinds;
  if (!kinds || kinds.length === 0) {
    return true;
  }

  if (!selection) {
    return false;
  }

  return kinds.includes(selection.mode);
}

function matchesContextTypes(
  predicate: ActionContextPredicate | undefined,
  context?: ActionContextSnapshot,
): boolean {
  const requiredTypes = predicate?.contextTypes;
  if (!requiredTypes || requiredTypes.length === 0) {
    return true;
  }

  const availableTypes = context?.contextTypes ?? [];
  if (availableTypes.length === 0) {
    return false;
  }

  return requiredTypes.some((type) => availableTypes.includes(type));
}

/** Returns true when an action descriptor matches the supplied context predicates. */
export function matchesActionContextPredicate(
  descriptor: ActionDescriptor,
  filter: ActionContextFilterInput,
): boolean {
  const predicate = descriptor.contextWhen;

  return (
    matchesSurface(predicate, filter.surface) &&
    matchesSelectionKind(predicate, filter.selection) &&
    matchesContextTypes(predicate, filter.context)
  );
}

/** Filters descriptors by optional surface, selection, and context snapshots. */
export function filterActionsByContext(
  descriptors: readonly ActionDescriptor[],
  filter: ActionContextFilterInput = {},
): readonly ActionDescriptor[] {
  return descriptors.filter((descriptor) =>
    matchesActionContextPredicate(descriptor, filter),
  );
}
