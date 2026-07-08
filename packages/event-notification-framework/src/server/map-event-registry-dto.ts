import type { EventRegistry } from "../event/event-descriptor";
import type {
  EventDescriptorSource,
  EventDescriptorStatus,
  EventStability,
  EventVisibility,
} from "../event/event-descriptor";
import type { EventMetadata } from "../event/event-metadata";
import type { EventCategory } from "../types/event-category";
import { EVENT_REGISTRY_DTO_SCHEMA_VERSION } from "./event-registry-dto-schema-version";

/** Client-safe event descriptor — read-only registry projection (EN-006). */
export interface EventDescriptorDto {
  readonly eventId: string;
  readonly category: EventCategory;
  readonly version: string;
  readonly sourceCapability: string;
  readonly schemaVersion: string;
  readonly visibility: EventVisibility;
  readonly stability: EventStability;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly status: EventDescriptorStatus;
  readonly label?: string;
  readonly permission?: string;
  readonly subscribers: readonly string[];
  readonly source: EventDescriptorSource;
}

/** Server-authoritative, versioned Event Registry projection (EN-006). */
export interface EventRegistryDto {
  readonly schemaVersion: typeof EVENT_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly events: readonly EventDescriptorDto[];
}

export function createEmptyEventRegistryDto(): EventRegistryDto {
  return {
    schemaVersion: EVENT_REGISTRY_DTO_SCHEMA_VERSION,
    events: [],
  };
}

export function mapEventMetadataToDescriptorDto(
  metadata: EventMetadata,
): EventDescriptorDto {
  return Object.freeze({
    eventId: metadata.eventId,
    category: metadata.category,
    version: metadata.version,
    sourceCapability: metadata.sourceCapability,
    schemaVersion: metadata.schemaVersion,
    visibility: metadata.visibility,
    stability: metadata.stability,
    description: metadata.description,
    tags: metadata.tags,
    status: metadata.status,
    label: metadata.label,
    permission: metadata.permission,
    subscribers: metadata.subscribers,
    source: metadata.source,
  });
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapEventRegistryDto(registry: EventRegistry): EventRegistryDto {
  const metadata = registry.getRegistryMetadata();

  return Object.freeze({
    schemaVersion: EVENT_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: metadata.frameworkVersion,
    events: Object.freeze(
      metadata.eventMetadata
        .map(mapEventMetadataToDescriptorDto)
        .sort((left, right) => left.eventId.localeCompare(right.eventId)),
    ),
  });
}
