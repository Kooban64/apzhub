import type { ActivityViewModel } from "./activity-view-model";

/** Deterministic ordering — timestamp descending, activityId ascending tie-break. */
export function compareActivityViewModels(
  left: ActivityViewModel,
  right: ActivityViewModel,
): number {
  const timestampCompare = right.timestamp.localeCompare(left.timestamp);
  if (timestampCompare !== 0) {
    return timestampCompare;
  }

  return left.activityId.localeCompare(right.activityId);
}

/** Sorts view models newest first with deterministic tie-breaking. */
export function sortActivityViewModels(
  models: readonly ActivityViewModel[],
): readonly ActivityViewModel[] {
  return Object.freeze([...models].sort(compareActivityViewModels));
}
