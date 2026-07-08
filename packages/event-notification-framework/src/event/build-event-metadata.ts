import type { EventDescriptor } from "./event-descriptor";
import type { EventEntryDiagnostics, EventMetadata } from "./event-metadata";
import { freezeEventDescriptor } from "./freeze-event-descriptor";

function resolveSourceCapability(descriptor: EventDescriptor): string {
  return descriptor.sourceCapability ?? descriptor.publisher;
}

export function buildEventMetadata(descriptor: EventDescriptor): EventMetadata {
  const subscribers = Object.freeze([...(descriptor.subscribers ?? [])]);
  const tags = Object.freeze([...(descriptor.tags ?? [])]);

  const diagnostics: EventEntryDiagnostics = Object.freeze({
    validationIssueCount: 0,
    subscriberCount: subscribers.length,
    message:
      descriptor.status === "planned"
        ? "Event registered as planned — publish deferred until active"
        : undefined,
  });

  return Object.freeze({
    eventId: descriptor.eventId,
    category: descriptor.category,
    version: descriptor.version,
    sourceCapability: resolveSourceCapability(descriptor),
    schemaVersion: descriptor.schemaVersion ?? descriptor.version,
    visibility: descriptor.visibility ?? "public",
    stability: descriptor.stability ?? "stable",
    description: descriptor.description,
    tags,
    status: descriptor.status ?? "active",
    label: descriptor.label,
    permission: descriptor.permission,
    subscribers,
    source: descriptor.source ?? "manifest",
    diagnostics,
  });
}

export function buildEventMetadataList(
  descriptors: readonly EventDescriptor[],
): readonly EventMetadata[] {
  return Object.freeze(descriptors.map((descriptor) => buildEventMetadata(descriptor)));
}

export { freezeEventDescriptor };
