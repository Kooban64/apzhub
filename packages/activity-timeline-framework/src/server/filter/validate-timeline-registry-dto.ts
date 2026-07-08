import {
  collectDuplicateTimelineIssues,
  collectTimelineValidationIssues,
} from "../../timeline/timeline-batch-helpers";
import type { TimelineDefinition } from "../../types/timeline-definition";
import type { TimelineRegistrationIssue } from "../../types/timeline-metadata";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "./timeline-registry-dto-schema-version";
import {
  createEmptyTimelineRegistryDto,
  type TimelineDescriptorDto,
  type TimelineRegistryDto,
} from "./map-timeline-registry-dto";

export interface TimelineRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: TimelineRegistryDto;
  readonly errors: readonly TimelineRegistrationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normaliseFrameworkVersion(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function mapDtoEntryToDefinition(entry: TimelineDescriptorDto): TimelineDefinition {
  const metadata = Object.freeze({
    grouping: entry.grouping,
    ...(entry.sortOrder ? { sortOrder: entry.sortOrder } : {}),
    ...(entry.activityTypeFilter
      ? { activityTypeFilter: entry.activityTypeFilter }
      : {}),
    ...(entry.permissionKeys ? { permissionKeys: entry.permissionKeys } : {}),
    ...(entry.experienceRef ? { experienceRef: entry.experienceRef } : {}),
  });

  return {
    timelineId: entry.timelineId,
    scope: entry.scope,
    label: entry.label,
    description: entry.description,
    icon: entry.iconRef,
    order: 100,
    version: entry.version,
    visibility: entry.visibility,
    stability: entry.stability,
    status: entry.status,
    source: entry.source,
    supportedActivityCategories: entry.activityCategoryFilter,
    metadata,
  };
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateTimelineRegistryDto(
  dto: unknown,
): TimelineRegistryDtoValidationResult {
  const errors: TimelineRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "TimelineRegistryDto must be an object",
        },
      ]),
    };
  }

  if (dto.schemaVersion !== TIMELINE_REGISTRY_DTO_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `TimelineRegistryDto.schemaVersion must be ${TIMELINE_REGISTRY_DTO_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!Array.isArray(dto.timelines)) {
    errors.push({
      code: "VALIDATION",
      message: "TimelineRegistryDto.timelines must be an array",
      field: "timelines",
    });
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const timelines = dto.timelines as TimelineDescriptorDto[];
  const definitions = timelines.map(mapDtoEntryToDefinition);
  const validationIssues = collectTimelineValidationIssues(definitions);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateTimelineIssues(definitions, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  const frameworkVersion = normaliseFrameworkVersion(dto.frameworkVersion);
  if (dto.frameworkVersion !== undefined && frameworkVersion === undefined) {
    errors.push({
      code: "VALIDATION",
      message: "TimelineRegistryDto.frameworkVersion must be a non-empty string",
      field: "frameworkVersion",
    });
    return {
      ok: false,
      dto: createEmptyTimelineRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    dto: Object.freeze({
      schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion,
      timelines: Object.freeze([...timelines]),
    }),
    errors: [],
  };
}
