import type { EventCategory } from "../types/event-category";
import { CANONICAL_EVENT_CATEGORIES } from "../types/event-category";

const EVENT_CATEGORIES = new Set<EventCategory>([
  ...CANONICAL_EVENT_CATEGORIES,
  "security",
  "infrastructure",
  "business",
  "notification",
  "ai",
]);

const DESCRIPTOR_STATUSES = new Set(["active", "planned", "deprecated"]);

export interface EventManifestEntry {
  readonly id: string;
  readonly version: string;
  readonly category: EventCategory;
  readonly label?: string;
  readonly publisher: string;
  readonly subscribers?: readonly string[];
  readonly permission?: string;
  readonly status?: "active" | "planned" | "deprecated";
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly payload: Readonly<
    Record<string, string | { readonly type: string; readonly required?: boolean }>
  >;
}

export interface EventManifestValidationIssue {
  readonly message: string;
  readonly field?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPayloadField(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (!isRecord(value) || typeof value.type !== "string" || !value.type.trim()) {
    return false;
  }

  return value.required === undefined || typeof value.required === "boolean";
}

/** Validates inline capability manifest `events[]` entries. */
export function parseEventManifestEntry(rawEntry: unknown): {
  entry?: EventManifestEntry;
  issue?: EventManifestValidationIssue;
} {
  if (!isRecord(rawEntry)) {
    return { issue: { message: "Event manifest entry must be an object" } };
  }

  const id = rawEntry.id;
  const version = rawEntry.version;
  const category = rawEntry.category;
  const publisher = rawEntry.publisher;
  const payload = rawEntry.payload;

  if (typeof id !== "string" || !id.trim()) {
    return { issue: { message: "Event id is required", field: "id" } };
  }

  if (typeof version !== "string" || !version.trim()) {
    return { issue: { message: "Event version is required", field: "version" } };
  }

  if (
    typeof category !== "string" ||
    !EVENT_CATEGORIES.has(category as EventCategory)
  ) {
    return { issue: { message: "Invalid event category", field: "category" } };
  }

  if (typeof publisher !== "string" || !publisher.trim()) {
    return { issue: { message: "Event publisher is required", field: "publisher" } };
  }

  if (!isRecord(payload) || Object.keys(payload).length === 0) {
    return { issue: { message: "Event payload schema is required", field: "payload" } };
  }

  for (const [fieldName, fieldValue] of Object.entries(payload)) {
    if (!fieldName.trim() || !isPayloadField(fieldValue)) {
      return {
        issue: {
          message: `Invalid payload field "${fieldName}"`,
          field: `payload.${fieldName}`,
        },
      };
    }
  }

  if (
    rawEntry.status !== undefined &&
    !DESCRIPTOR_STATUSES.has(String(rawEntry.status))
  ) {
    return { issue: { message: "Invalid event status", field: "status" } };
  }

  if (rawEntry.subscribers !== undefined) {
    if (
      !Array.isArray(rawEntry.subscribers) ||
      rawEntry.subscribers.some(
        (subscriber) => typeof subscriber !== "string" || !subscriber.trim(),
      )
    ) {
      return {
        issue: {
          message: "Event subscribers must be non-empty strings",
          field: "subscribers",
        },
      };
    }
  }

  if (rawEntry.tags !== undefined) {
    if (
      !Array.isArray(rawEntry.tags) ||
      rawEntry.tags.some((tag) => typeof tag !== "string" || !tag.trim())
    ) {
      return {
        issue: { message: "Event tags must be non-empty strings", field: "tags" },
      };
    }
  }

  return {
    entry: {
      id: id.trim(),
      version: version.trim(),
      category: category as EventCategory,
      label: typeof rawEntry.label === "string" ? rawEntry.label : undefined,
      publisher: publisher.trim(),
      subscribers: Array.isArray(rawEntry.subscribers)
        ? Object.freeze([...rawEntry.subscribers])
        : undefined,
      permission:
        typeof rawEntry.permission === "string" ? rawEntry.permission : undefined,
      status: rawEntry.status as EventManifestEntry["status"],
      description:
        typeof rawEntry.description === "string" ? rawEntry.description : undefined,
      tags: Array.isArray(rawEntry.tags)
        ? Object.freeze([...rawEntry.tags])
        : undefined,
      payload: Object.freeze({ ...payload }) as EventManifestEntry["payload"],
    },
  };
}

/** Alias for standalone `event.yaml` entries — same shape as inline blocks. */
export const parseStandaloneEventManifest = parseEventManifestEntry;

export type StandaloneEventManifest = EventManifestEntry;
