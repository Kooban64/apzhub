import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import { ActivityRegistryValidationError } from "../registry/registry-errors";
import { validateActivityDescriptor } from "../registry/validate-activity-descriptor";
import { parseActivityManifestEntry } from "./activity-manifest-schema";
import { mapActivityManifestToDescriptor } from "./map-activity-manifest";
import type { ActivityCapabilityRecord, ActivityExtractionResult } from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function isActivityTypeBlock(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "id" in value;
}

/** Returns manifest activity type declarations from `activities.types[]`. */
export function collectActivityTypeManifestEntries(
  manifest: unknown,
): readonly unknown[] {
  if (typeof manifest !== "object" || manifest === null) {
    return [];
  }

  const record = manifest as Record<string, unknown>;

  if (
    !("activities" in record) ||
    typeof record.activities !== "object" ||
    record.activities === null
  ) {
    return [];
  }

  const activities = record.activities as Record<string, unknown>;

  if (!("types" in activities) || !Array.isArray(activities.types)) {
    return [];
  }

  return activities.types.filter((entry) => isActivityTypeBlock(entry));
}

export function hasCapabilityActivityTypeDeclarations(manifest: unknown): boolean {
  return collectActivityTypeManifestEntries(manifest).length > 0;
}

function parseManifestEntry(rawEntry: unknown): {
  entry?: import("./activity-manifest-schema").ActivityManifestEntry;
  error?: ActivityRegistrationIssue;
} {
  const parsed = parseActivityManifestEntry(rawEntry);
  if (parsed.issue) {
    return {
      error: {
        code: "VALIDATION",
        activityTypeId:
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
 * Discover activity type descriptors declared in capability manifests.
 * Returns no descriptors when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractActivityDescriptorsFromCapabilities(
  records: readonly ActivityCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ActivityExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutActivities = 0;
  const errors: ActivityRegistrationIssue[] = [];
  const pending: ReturnType<typeof mapActivityManifestToDescriptor>[] = [];
  const seenActivityTypeIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const manifestEntries = collectActivityTypeManifestEntries(record.manifest);
    if (manifestEntries.length === 0) {
      skippedWithoutActivities += 1;
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
        const descriptor = mapActivityManifestToDescriptor(
          parsed.entry!,
          record.id,
          record.version,
        );
        validateActivityDescriptor(descriptor);

        const previousCapability = seenActivityTypeIds.get(descriptor.activityTypeId);
        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            activityTypeId: descriptor.activityTypeId,
            message: `Duplicate activity type id "${descriptor.activityTypeId}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenActivityTypeIds.set(descriptor.activityTypeId, record.id);
        pending.push(descriptor);
      } catch (error) {
        if (error instanceof ActivityRegistryValidationError) {
          errors.push({
            code: "VALIDATION",
            activityTypeId: parsed.entry!.id,
            message: `${error.message} (capability "${record.id}")`,
            field: error.field,
          });
        } else {
          throw error;
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      descriptors: [],
      diagnostics: Object.freeze({
        scannedCapabilities: sortedRecords.length,
        extractedCount: 0,
        skippedInactive,
        skippedWithoutActivities,
        capabilityIds: Object.freeze([]),
      }),
      errors: Object.freeze(errors),
    };
  }

  return {
    ok: true,
    descriptors: Object.freeze([...pending]),
    diagnostics: Object.freeze({
      scannedCapabilities: sortedRecords.length,
      extractedCount: pending.length,
      skippedInactive,
      skippedWithoutActivities,
      capabilityIds: Object.freeze([...capabilityIds].sort()),
    }),
    errors: [],
  };
}
