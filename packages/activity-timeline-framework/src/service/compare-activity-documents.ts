import type { ActivityDocument } from "../types/activity-document";

/** Deterministic ordering — timestamp descending, activityId ascending tie-break. */
export function compareActivityDocuments(
  left: ActivityDocument,
  right: ActivityDocument,
): number {
  const timestampCompare = right.timestamp.localeCompare(left.timestamp);
  if (timestampCompare !== 0) {
    return timestampCompare;
  }

  return left.activityId.localeCompare(right.activityId);
}
