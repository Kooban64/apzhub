import type { TimelineRegistry } from "../../timeline/timeline-registry";
import type { ActivityCategory } from "../../types/activity-category";
import type {
  ActivityStability,
  ActivityVisibility,
} from "../../types/activity-descriptor";
import type {
  TimelineDefinition,
  TimelineDefinitionSource,
  TimelineDefinitionStatus,
} from "../../types/timeline-definition";
import type { TimelineScopeId } from "../../types/timeline-scope";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "./timeline-registry-dto-schema-version";

const DEFAULT_TIMELINE_GROUPING = "flat";

function readStringMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readStringArrayMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string,
): readonly string[] | undefined {
  const value = metadata?.[key];
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string" || !entry.trim())
  ) {
    return undefined;
  }

  return Object.freeze([...value]);
}

/** Client-safe timeline descriptor — read-only registry projection (AT-006). */
export interface TimelineDescriptorDto {
  readonly timelineId: string;
  readonly scope: TimelineScopeId;
  readonly label: string;
  readonly grouping: string;
  readonly sortOrder?: string;
  readonly activityTypeFilter?: readonly string[];
  readonly activityCategoryFilter?: readonly ActivityCategory[];
  readonly version: string;
  readonly status: TimelineDefinitionStatus;
  readonly experienceRef?: string;
  readonly iconRef?: string;
  readonly source: TimelineDefinitionSource;
  readonly permissionKeys?: readonly string[];
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly description?: string;
}

/** Server-authoritative, versioned Timeline Registry projection (AT-006). */
export interface TimelineRegistryDto {
  readonly schemaVersion: typeof TIMELINE_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly timelines: readonly TimelineDescriptorDto[];
}

export function createEmptyTimelineRegistryDto(): TimelineRegistryDto {
  return Object.freeze({
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    timelines: [],
  });
}

export function mapTimelineDefinitionToDescriptorDto(
  definition: TimelineDefinition,
): TimelineDescriptorDto {
  const metadata = definition.metadata;

  return Object.freeze({
    timelineId: definition.timelineId,
    scope: definition.scope,
    label: definition.label,
    grouping: readStringMetadata(metadata, "grouping") ?? DEFAULT_TIMELINE_GROUPING,
    sortOrder: readStringMetadata(metadata, "sortOrder"),
    activityTypeFilter: readStringArrayMetadata(metadata, "activityTypeFilter"),
    activityCategoryFilter: definition.supportedActivityCategories
      ? Object.freeze([...definition.supportedActivityCategories])
      : undefined,
    version: definition.version,
    status: definition.status ?? "active",
    experienceRef: readStringMetadata(metadata, "experienceRef"),
    iconRef: definition.icon,
    source: definition.source ?? "manifest",
    permissionKeys: readStringArrayMetadata(metadata, "permissionKeys"),
    visibility: definition.visibility ?? "public",
    stability: definition.stability ?? "stable",
    description: definition.description,
  });
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapTimelineRegistryDto(
  registry: TimelineRegistry,
): TimelineRegistryDto {
  const metadata = registry.getRegistryMetadata();

  return Object.freeze({
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: metadata.frameworkVersion ?? metadata.platformCatalogueVersion,
    timelines: Object.freeze(
      registry
        .list()
        .map(mapTimelineDefinitionToDescriptorDto)
        .sort((left, right) => left.timelineId.localeCompare(right.timelineId)),
    ),
  });
}
