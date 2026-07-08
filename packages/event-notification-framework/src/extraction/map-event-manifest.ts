import type { EventDescriptor } from "../event/event-descriptor";
import type { EventManifestEntry } from "./event-manifest-schema";

/** Maps a validated manifest entry to an internal event descriptor. */
export function mapEventManifestToDescriptor(
  entry: EventManifestEntry,
  capabilityId: string,
  capabilityVersion: string | undefined,
): EventDescriptor {
  return {
    eventId: entry.id,
    version: entry.version,
    category: entry.category,
    publisher: entry.publisher,
    sourceCapability: capabilityId,
    schemaVersion: capabilityVersion ?? entry.version,
    label: entry.label,
    description: entry.description,
    tags: entry.tags,
    subscribers: entry.subscribers,
    status: entry.status,
    permission: entry.permission,
    source: "manifest",
  };
}
