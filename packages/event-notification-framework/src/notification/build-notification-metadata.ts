import type { NotificationDescriptor } from "./notification-descriptor";
import type {
  NotificationEntryDiagnostics,
  NotificationMetadata,
} from "./notification-metadata";
import { freezeNotificationDescriptor } from "./freeze-notification-descriptor";

export function buildNotificationMetadata(
  descriptor: NotificationDescriptor,
): NotificationMetadata {
  const tags = Object.freeze([...(descriptor.tags ?? [])]);

  const diagnostics: NotificationEntryDiagnostics = Object.freeze({
    validationIssueCount: 0,
    message:
      descriptor.status === "planned"
        ? "Notification route registered as planned — delivery deferred until active"
        : descriptor.status === "disabled"
          ? "Notification route registered as disabled — delivery suppressed"
          : undefined,
  });

  return Object.freeze({
    routeId: descriptor.routeId,
    notificationKind: descriptor.notificationKind,
    channel: descriptor.channel,
    source: descriptor.source ?? "manifest",
    version: descriptor.version,
    schemaVersion: descriptor.schemaVersion ?? descriptor.version,
    visibility: descriptor.visibility ?? "public",
    stability: descriptor.stability ?? "stable",
    description: descriptor.description,
    tags,
    eventPattern: descriptor.eventPattern,
    templateRef: descriptor.templateRef,
    status: descriptor.status ?? "active",
    label: descriptor.label,
    permission: descriptor.permission,
    priority: descriptor.priority,
    sourceCapability: descriptor.sourceCapability,
    diagnostics,
  });
}

export function buildNotificationMetadataList(
  descriptors: readonly NotificationDescriptor[],
): readonly NotificationMetadata[] {
  return Object.freeze(
    descriptors.map((descriptor) => buildNotificationMetadata(descriptor)),
  );
}

export { freezeNotificationDescriptor };
