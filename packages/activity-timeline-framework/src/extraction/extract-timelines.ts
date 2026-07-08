import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import { TimelineRegistryValidationError } from "../timeline/registry-errors";
import { validateTimelineDefinition } from "../timeline/validate-timeline-definition";
import { parseTimelineManifestEntry } from "./timeline-manifest-schema";
import { mapTimelineManifestToDefinition } from "./map-timeline-manifest";
import type { ActivityCapabilityRecord, TimelineExtractionResult } from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function isTimelineBlock(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "id" in value;
}

function collectFromActivitiesBlock(
  manifest: Record<string, unknown>,
): readonly unknown[] {
  if (
    !("activities" in manifest) ||
    typeof manifest.activities !== "object" ||
    manifest.activities === null
  ) {
    return [];
  }

  const activities = manifest.activities as Record<string, unknown>;

  if (!("timelines" in activities) || !Array.isArray(activities.timelines)) {
    return [];
  }

  return activities.timelines.filter((entry) => isTimelineBlock(entry));
}

function collectFromLegacyTimelinesBlock(
  manifest: Record<string, unknown>,
): readonly unknown[] {
  if (
    !("timelines" in manifest) ||
    typeof manifest.timelines !== "object" ||
    manifest.timelines === null
  ) {
    return [];
  }

  const timelines = manifest.timelines as Record<string, unknown>;

  if (!("scopes" in timelines) || !Array.isArray(timelines.scopes)) {
    return [];
  }

  return timelines.scopes.filter((entry) => isTimelineBlock(entry));
}

/**
 * Returns manifest timeline declarations from `activities.timelines[]`,
 * falling back to legacy `timelines.scopes[]` when the activities block is absent.
 */
export function collectTimelineManifestEntries(manifest: unknown): readonly unknown[] {
  if (typeof manifest !== "object" || manifest === null) {
    return [];
  }

  const record = manifest as Record<string, unknown>;
  const fromActivities = collectFromActivitiesBlock(record);

  if (fromActivities.length > 0) {
    return fromActivities;
  }

  return collectFromLegacyTimelinesBlock(record);
}

export function hasCapabilityTimelineDeclarations(manifest: unknown): boolean {
  return collectTimelineManifestEntries(manifest).length > 0;
}

function parseManifestEntry(rawEntry: unknown): {
  entry?: import("./timeline-manifest-schema").TimelineManifestEntry;
  error?: TimelineRegistrationIssue;
} {
  const parsed = parseTimelineManifestEntry(rawEntry);
  if (parsed.issue) {
    return {
      error: {
        code: "VALIDATION",
        timelineId:
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
 * Discover timeline definitions declared in capability manifests.
 * Returns no definitions when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractTimelineDefinitionsFromCapabilities(
  records: readonly ActivityCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): TimelineExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutTimelines = 0;
  const errors: TimelineRegistrationIssue[] = [];
  const pending: ReturnType<typeof mapTimelineManifestToDefinition>[] = [];
  const seenTimelineIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const manifestEntries = collectTimelineManifestEntries(record.manifest);
    if (manifestEntries.length === 0) {
      skippedWithoutTimelines += 1;
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
        const definition = mapTimelineManifestToDefinition(parsed.entry!, record.id);
        validateTimelineDefinition(definition);

        const previousCapability = seenTimelineIds.get(definition.timelineId);
        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            timelineId: definition.timelineId,
            message: `Duplicate timeline id "${definition.timelineId}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenTimelineIds.set(definition.timelineId, record.id);
        pending.push(definition);
      } catch (error) {
        if (error instanceof TimelineRegistryValidationError) {
          errors.push({
            code: "VALIDATION",
            timelineId: parsed.entry!.id,
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
      definitions: [],
      diagnostics: Object.freeze({
        scannedCapabilities: sortedRecords.length,
        extractedCount: 0,
        skippedInactive,
        skippedWithoutTimelines,
        capabilityIds: Object.freeze([]),
      }),
      errors: Object.freeze(errors),
    };
  }

  return {
    ok: true,
    definitions: Object.freeze([...pending]),
    diagnostics: Object.freeze({
      scannedCapabilities: sortedRecords.length,
      extractedCount: pending.length,
      skippedInactive,
      skippedWithoutTimelines,
      capabilityIds: Object.freeze([...capabilityIds].sort()),
    }),
    errors: [],
  };
}
