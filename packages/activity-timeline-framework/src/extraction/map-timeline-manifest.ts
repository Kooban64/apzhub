import type { TimelineDefinition } from "../types/timeline-definition";
import type { TimelineManifestEntry } from "./timeline-manifest-schema";

const DEFAULT_MANIFEST_TIMELINE_ORDER = 100;

/** Maps a validated manifest entry to an internal timeline definition. */
export function mapTimelineManifestToDefinition(
  entry: TimelineManifestEntry,
  capabilityId: string,
): TimelineDefinition {
  const metadata = Object.freeze({
    grouping: entry.grouping,
    ...(entry.sortOrder ? { sortOrder: entry.sortOrder } : {}),
    ...(entry.activityTypeFilter
      ? { activityTypeFilter: entry.activityTypeFilter }
      : {}),
    ...(entry.permissionKeys ? { permissionKeys: entry.permissionKeys } : {}),
    ...(entry.experienceRef ? { experienceRef: entry.experienceRef } : {}),
    sourceCapability: capabilityId,
  });

  return {
    timelineId: entry.id,
    scope: entry.scope,
    label: entry.label,
    description: entry.description,
    icon: entry.iconRef,
    order: entry.order ?? DEFAULT_MANIFEST_TIMELINE_ORDER,
    version: entry.version,
    supportedActivityCategories: entry.activityCategoryFilter,
    metadata,
    status: entry.status,
    source: "manifest",
  };
}
