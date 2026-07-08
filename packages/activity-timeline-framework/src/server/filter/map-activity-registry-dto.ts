import type { ActivityRegistry } from "../../registry/activity-registry";
import type { ActivityCategory } from "../../types/activity-category";
import type {
  ActivityDescriptorSource,
  ActivityDescriptorStatus,
  ActivitySeverity,
  ActivityStability,
  ActivityVisibility,
} from "../../types/activity-descriptor";
import type { TimelineScopeId } from "../../types/timeline-scope";
import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "./activity-registry-dto-schema-version";

/** Client-safe activity type descriptor — read-only registry projection (AT-006). */
export interface ActivityTypeDescriptorDto {
  readonly activityTypeId: string;
  readonly sourceEventPattern: string;
  readonly category: ActivityCategory;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly version: string;
  readonly schemaVersion: string;
  readonly severity?: ActivitySeverity;
  readonly iconRef?: string;
  readonly permissionKeys?: readonly string[];
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly status: ActivityDescriptorStatus;
  readonly source: ActivityDescriptorSource;
  readonly label?: string;
  readonly description?: string;
  readonly tags: readonly string[];
}

/** Server-authoritative, versioned Activity Registry projection (AT-006). */
export interface ActivityRegistryDto {
  readonly schemaVersion: typeof ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly types: readonly ActivityTypeDescriptorDto[];
}

export function createEmptyActivityRegistryDto(): ActivityRegistryDto {
  return Object.freeze({
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    types: [],
  });
}

export function mapActivityDescriptorToTypeDto(
  descriptor: import("../../types/activity-descriptor").ActivityDescriptor,
): ActivityTypeDescriptorDto {
  return Object.freeze({
    activityTypeId: descriptor.activityTypeId,
    sourceEventPattern: descriptor.sourceEventPattern,
    category: descriptor.category,
    timelineScopes: Object.freeze([...descriptor.timelineScopes]),
    templateRef: descriptor.templateRef,
    version: descriptor.version,
    schemaVersion: descriptor.schemaVersion ?? descriptor.version,
    severity: descriptor.severity,
    iconRef: descriptor.iconRef,
    permissionKeys: descriptor.permissionKeys
      ? Object.freeze([...descriptor.permissionKeys])
      : undefined,
    visibility: descriptor.visibility ?? "public",
    stability: descriptor.stability ?? "stable",
    status: descriptor.status ?? "active",
    source: descriptor.source ?? "manifest",
    label: descriptor.label,
    description: descriptor.description,
    tags: Object.freeze([...(descriptor.tags ?? [])]),
  });
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapActivityRegistryDto(
  registry: ActivityRegistry,
): ActivityRegistryDto {
  const metadata = registry.getRegistryMetadata();

  return Object.freeze({
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: metadata.frameworkVersion ?? metadata.platformCatalogueVersion,
    types: Object.freeze(
      registry
        .list()
        .map(mapActivityDescriptorToTypeDto)
        .sort((left, right) => left.activityTypeId.localeCompare(right.activityTypeId)),
    ),
  });
}
