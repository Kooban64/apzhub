import type { NotificationDescriptor } from "../notification/notification-descriptor";
import type { NotificationManifestEntry } from "./notification-manifest-schema";

/** Maps a validated manifest entry to an internal notification route descriptor. */
export function mapNotificationManifestToDescriptor(
  entry: NotificationManifestEntry,
  capabilityId: string,
  capabilityVersion: string | undefined,
): NotificationDescriptor {
  return {
    routeId: entry.id,
    eventPattern: entry.eventPattern,
    notificationKind: entry.notificationKind,
    channel: entry.channel,
    templateRef: entry.templateRef,
    version: entry.version,
    sourceCapability: capabilityId,
    schemaVersion: capabilityVersion ?? entry.version,
    label: entry.label,
    description: entry.description,
    tags: entry.tags,
    status: entry.status,
    priority: entry.priority,
    permission: entry.permission,
    source: "manifest",
    titleTemplate: entry.titleTemplate,
    bodyTemplate: entry.bodyTemplate,
  };
}
