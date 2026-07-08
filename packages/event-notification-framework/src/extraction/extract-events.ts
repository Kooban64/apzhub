import type { EventRegistrationIssue } from "../event/event-metadata";
import { EventRegistryValidationError } from "../event/registry-errors";
import { validateEventDescriptor } from "../event/validate-event-descriptor";
import { parseEventManifestEntry } from "./event-manifest-schema";
import { mapEventManifestToDescriptor } from "./map-event-manifest";
import type { EventCapabilityRecord, EventExtractionResult } from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function isEventDeclarationBlock(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "id" in value;
}

/** Returns manifest event declarations — inline `events[]` or standalone `event` block. */
export function collectEventManifestEntries(manifest: unknown): readonly unknown[] {
  if (typeof manifest !== "object" || manifest === null) {
    return [];
  }

  const record = manifest as Record<string, unknown>;

  if ("event" in record && isEventDeclarationBlock(record.event)) {
    return [record.event];
  }

  if ("events" in record && Array.isArray(record.events)) {
    const events = record.events;
    if (events.length === 0) {
      return [];
    }

    if (typeof events[0] === "string") {
      return [];
    }

    return events.filter((entry) => isEventDeclarationBlock(entry));
  }

  return [];
}

export function hasCapabilityEventDeclarations(manifest: unknown): boolean {
  return collectEventManifestEntries(manifest).length > 0;
}

function parseManifestEntry(rawEntry: unknown): {
  entry?: import("./event-manifest-schema").EventManifestEntry;
  error?: EventRegistrationIssue;
} {
  const parsed = parseEventManifestEntry(rawEntry);
  if (parsed.issue) {
    return {
      error: {
        code: "VALIDATION",
        eventId:
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
 * Discover event descriptors declared in capability manifests.
 * Returns no descriptors when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractEventDescriptorsFromCapabilities(
  records: readonly EventCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): EventExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutEvents = 0;
  const errors: EventRegistrationIssue[] = [];
  const pending: ReturnType<typeof mapEventManifestToDescriptor>[] = [];
  const seenEventIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const manifestEntries = collectEventManifestEntries(record.manifest);
    if (manifestEntries.length === 0) {
      skippedWithoutEvents += 1;
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
        const descriptor = mapEventManifestToDescriptor(
          parsed.entry!,
          record.id,
          record.version,
        );
        validateEventDescriptor(descriptor);

        const previousCapability = seenEventIds.get(descriptor.eventId);
        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            eventId: descriptor.eventId,
            message: `Duplicate event id "${descriptor.eventId}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenEventIds.set(descriptor.eventId, record.id);
        pending.push(descriptor);
      } catch (error) {
        if (error instanceof EventRegistryValidationError) {
          errors.push({
            code: "VALIDATION",
            eventId: parsed.entry?.id,
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
    skippedWithoutEvents,
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
