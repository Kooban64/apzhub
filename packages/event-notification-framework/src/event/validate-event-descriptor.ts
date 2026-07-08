import type { EventCategory } from "../types/event-category";
import type {
  EventDescriptor,
  EventDescriptorStatus,
  EventStability,
  EventVisibility,
} from "./event-descriptor";
import { EventRegistryValidationError } from "./registry-errors";

const EVENT_ID_PATTERN = /^[a-z][a-z0-9.-]*$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const EVENT_CATEGORIES = new Set<EventCategory>([
  "system",
  "user",
  "capability",
  "integration",
  "security",
  "infrastructure",
  "business",
  "notification",
  "ai",
]);

const DESCRIPTOR_STATUSES = new Set<EventDescriptorStatus>([
  "active",
  "planned",
  "deprecated",
]);

const VISIBILITIES = new Set<EventVisibility>(["public", "internal", "restricted"]);

const STABILITIES = new Set<EventStability>(["stable", "experimental", "deprecated"]);

/** Validates event descriptor shape before registration. Does not publish or subscribe. */
export function validateEventDescriptor(descriptor: EventDescriptor): void {
  if (!descriptor.eventId?.trim()) {
    throw new EventRegistryValidationError("Event id is required", "eventId");
  }

  if (!EVENT_ID_PATTERN.test(descriptor.eventId)) {
    throw new EventRegistryValidationError(
      `Event id "${descriptor.eventId}" must use lowercase dot notation`,
      "eventId",
    );
  }

  if (!descriptor.version?.trim()) {
    throw new EventRegistryValidationError("Event version is required", "version");
  }

  if (!SEMVER_PATTERN.test(descriptor.version)) {
    throw new EventRegistryValidationError(
      `Event version "${descriptor.version}" must be semver`,
      "version",
    );
  }

  if (!EVENT_CATEGORIES.has(descriptor.category)) {
    throw new EventRegistryValidationError(
      `Invalid event category "${String(descriptor.category)}"`,
      "category",
    );
  }

  const sourceCapability = descriptor.sourceCapability ?? descriptor.publisher;
  if (!sourceCapability?.trim()) {
    throw new EventRegistryValidationError(
      "Event publisher (source capability) is required",
      "publisher",
    );
  }

  if (descriptor.schemaVersion !== undefined && !descriptor.schemaVersion.trim()) {
    throw new EventRegistryValidationError(
      "Event schemaVersion must be non-empty",
      "schemaVersion",
    );
  }

  if (
    descriptor.schemaVersion !== undefined &&
    !SEMVER_PATTERN.test(descriptor.schemaVersion)
  ) {
    throw new EventRegistryValidationError(
      `Event schemaVersion "${descriptor.schemaVersion}" must be semver`,
      "schemaVersion",
    );
  }

  if (descriptor.visibility !== undefined && !VISIBILITIES.has(descriptor.visibility)) {
    throw new EventRegistryValidationError(
      `Invalid event visibility "${String(descriptor.visibility)}"`,
      "visibility",
    );
  }

  if (descriptor.stability !== undefined && !STABILITIES.has(descriptor.stability)) {
    throw new EventRegistryValidationError(
      `Invalid event stability "${String(descriptor.stability)}"`,
      "stability",
    );
  }

  if (descriptor.status !== undefined && !DESCRIPTOR_STATUSES.has(descriptor.status)) {
    throw new EventRegistryValidationError(
      `Invalid event status "${String(descriptor.status)}"`,
      "status",
    );
  }

  if (descriptor.tags !== undefined) {
    if (!Array.isArray(descriptor.tags) || descriptor.tags.some((tag) => !tag.trim())) {
      throw new EventRegistryValidationError(
        "Event tags must be a non-empty string array when provided",
        "tags",
      );
    }
  }

  if (descriptor.subscribers !== undefined) {
    if (
      !Array.isArray(descriptor.subscribers) ||
      descriptor.subscribers.some((subscriber) => !subscriber.trim())
    ) {
      throw new EventRegistryValidationError(
        "Event subscribers must be non-empty strings when provided",
        "subscribers",
      );
    }
  }

  if (
    descriptor.source !== undefined &&
    descriptor.source !== "builtin" &&
    descriptor.source !== "manifest"
  ) {
    throw new EventRegistryValidationError(
      `Invalid event source "${String(descriptor.source)}"`,
      "source",
    );
  }
}
