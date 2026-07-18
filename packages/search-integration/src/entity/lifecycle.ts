/**
 * Publication lifecycle for canonical search entities (APZSEARCH-009).
 * No background transitions — callers advance state explicitly via lifecycle ops.
 */

export const SEARCH_ENTITY_LIFECYCLE_STATES = [
  "draft",
  "validated",
  "published",
  "updated",
  "removed",
  "archived",
  "invalid",
] as const;

export type SearchEntityLifecycleState =
  (typeof SEARCH_ENTITY_LIFECYCLE_STATES)[number];

export function isSearchEntityLifecycleState(
  value: string,
): value is SearchEntityLifecycleState {
  return (SEARCH_ENTITY_LIFECYCLE_STATES as readonly string[]).includes(value);
}

export type SearchEntityLifecycleRecord = {
  readonly entityId: string;
  readonly productId: string;
  readonly state: SearchEntityLifecycleState;
  readonly updatedAt: string;
  readonly reason?: string;
};

/** Allowed explicit transitions (no scheduling / retries). */
const ALLOWED: Readonly<
  Record<SearchEntityLifecycleState, readonly SearchEntityLifecycleState[]>
> = {
  draft: ["validated", "published", "invalid", "archived"],
  validated: ["published", "invalid", "draft", "archived"],
  published: ["updated", "removed", "archived"],
  updated: ["updated", "removed", "archived"],
  removed: ["archived", "draft"],
  archived: ["draft"],
  invalid: ["draft", "validated", "archived"],
};

export class SearchEntityLifecycle {
  canTransition(
    from: SearchEntityLifecycleState,
    to: SearchEntityLifecycleState,
  ): boolean {
    return ALLOWED[from].includes(to);
  }

  assertTransition(
    from: SearchEntityLifecycleState,
    to: SearchEntityLifecycleState,
  ): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid search entity lifecycle transition: ${from} → ${to}`);
    }
  }
}
