import type { ActivityDescriptor } from "../types/activity-descriptor";
import type { ActivityManifestEntry } from "./activity-manifest-schema";

/** Maps a validated manifest entry to an internal activity type descriptor. */
export function mapActivityManifestToDescriptor(
  entry: ActivityManifestEntry,
  capabilityId: string,
  capabilityVersion: string | undefined,
): ActivityDescriptor {
  return {
    activityTypeId: entry.id,
    version: entry.version,
    sourceEventPattern: entry.eventPattern,
    category: entry.category,
    timelineScopes: entry.timelineScopes,
    templateRef: entry.templateRef,
    severity: entry.severity,
    iconRef: entry.iconRef,
    permissionKeys: entry.permissionKeys,
    retentionHint: entry.retentionHint,
    status: entry.status,
    label: entry.label,
    tags: entry.tags,
    sourceCapability: capabilityId,
    schemaVersion: capabilityVersion ?? entry.version,
    source: "manifest",
  };
}
