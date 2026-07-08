import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import { NotificationRegistryValidationError } from "../notification/registry-errors";
import { validateNotificationDescriptor } from "../notification/validate-notification-descriptor";
import { parseNotificationManifestEntry } from "./notification-manifest-schema";
import { mapNotificationManifestToDescriptor } from "./map-notification-manifest";
import type { EventCapabilityRecord, NotificationExtractionResult } from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function isNotificationRouteBlock(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "id" in value;
}

/** Returns manifest notification route declarations from `notifications.routes[]`. */
export function collectNotificationManifestEntries(
  manifest: unknown,
): readonly unknown[] {
  if (typeof manifest !== "object" || manifest === null) {
    return [];
  }

  const record = manifest as Record<string, unknown>;

  if (
    !("notifications" in record) ||
    typeof record.notifications !== "object" ||
    record.notifications === null
  ) {
    return [];
  }

  const notifications = record.notifications as Record<string, unknown>;

  if (!("routes" in notifications) || !Array.isArray(notifications.routes)) {
    return [];
  }

  return notifications.routes.filter((entry) => isNotificationRouteBlock(entry));
}

export function hasCapabilityNotificationDeclarations(manifest: unknown): boolean {
  return collectNotificationManifestEntries(manifest).length > 0;
}

function parseManifestEntry(rawEntry: unknown): {
  entry?: import("./notification-manifest-schema").NotificationManifestEntry;
  error?: NotificationRegistrationIssue;
} {
  const parsed = parseNotificationManifestEntry(rawEntry);
  if (parsed.issue) {
    return {
      error: {
        code: "VALIDATION",
        routeId:
          typeof (rawEntry as { id?: string }).id === "string"
            ? (rawEntry as { id: string }).id
            : undefined,
        message: parsed.issue.message,
        field: parsed.issue.field,
      },
    };
  }

  return { entry: parsed.entry };
}

/**
 * Discover notification route descriptors declared in capability manifests.
 * Returns no descriptors when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractNotificationDescriptorsFromCapabilities(
  records: readonly EventCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): NotificationExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutNotifications = 0;
  const errors: NotificationRegistrationIssue[] = [];
  const pending: ReturnType<typeof mapNotificationManifestToDescriptor>[] = [];
  const seenRouteIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const manifestEntries = collectNotificationManifestEntries(record.manifest);
    if (manifestEntries.length === 0) {
      skippedWithoutNotifications += 1;
      continue;
    }

    capabilityIds.push(record.id);

    for (const rawEntry of manifestEntries) {
      const parsed = parseManifestEntry(rawEntry);
      if (parsed.error) {
        errors.push({
          ...parsed.error,
          message: `${parsed.error.message} (capability "${record.id}")`,
        });
        continue;
      }

      try {
        const descriptor = mapNotificationManifestToDescriptor(
          parsed.entry!,
          record.id,
          record.version,
        );
        validateNotificationDescriptor(descriptor);

        const previousCapability = seenRouteIds.get(descriptor.routeId);
        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            routeId: descriptor.routeId,
            message: `Duplicate notification route id "${descriptor.routeId}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenRouteIds.set(descriptor.routeId, record.id);
        pending.push(descriptor);
      } catch (error) {
        if (error instanceof NotificationRegistryValidationError) {
          errors.push({
            code: "VALIDATION",
            routeId: parsed.entry?.id,
            message: `${error.message} (capability "${record.id}")`,
            field: error.field,
          });
          continue;
        }
        throw error;
      }
    }
  }

  const diagnostics = {
    scannedCapabilities: records.length,
    extractedCount: errors.length === 0 ? pending.length : 0,
    skippedInactive,
    skippedWithoutNotifications,
    capabilityIds: Object.freeze([...capabilityIds].sort()),
  };

  if (errors.length > 0) {
    return {
      ok: false,
      descriptors: [],
      diagnostics,
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    descriptors: Object.freeze([...pending]),
    diagnostics,
    errors: [],
  };
}
