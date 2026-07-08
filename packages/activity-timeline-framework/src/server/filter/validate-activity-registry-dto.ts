import {
  collectDuplicateActivityIssues,
  collectActivityValidationIssues,
} from "../../registry/activity-batch-helpers";
import type { ActivityDescriptor } from "../../types/activity-descriptor";
import type { ActivityRegistrationIssue } from "../../types/activity-metadata";
import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "./activity-registry-dto-schema-version";
import {
  createEmptyActivityRegistryDto,
  type ActivityRegistryDto,
  type ActivityTypeDescriptorDto,
} from "./map-activity-registry-dto";

export interface ActivityRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: ActivityRegistryDto;
  readonly errors: readonly ActivityRegistrationIssue[];
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

function mapDtoEntryToDescriptor(entry: ActivityTypeDescriptorDto): ActivityDescriptor {
  return {
    activityTypeId: entry.activityTypeId,
    version: entry.version,
    category: entry.category,
    sourceEventPattern: entry.sourceEventPattern,
    timelineScopes: entry.timelineScopes,
    templateRef: entry.templateRef,
    schemaVersion: entry.schemaVersion,
    severity: entry.severity,
    iconRef: entry.iconRef,
    permissionKeys: entry.permissionKeys,
    visibility: entry.visibility,
    stability: entry.stability,
    status: entry.status,
    source: entry.source,
    label: entry.label,
    description: entry.description,
    tags: entry.tags,
  };
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateActivityRegistryDto(
  dto: unknown,
): ActivityRegistryDtoValidationResult {
  const errors: ActivityRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "ActivityRegistryDto must be an object",
        },
      ]),
    };
  }

  if (dto.schemaVersion !== ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `ActivityRegistryDto.schemaVersion must be ${ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!Array.isArray(dto.types)) {
    errors.push({
      code: "VALIDATION",
      message: "ActivityRegistryDto.types must be an array",
      field: "types",
    });
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const types = dto.types as ActivityTypeDescriptorDto[];
  const descriptors = types.map(mapDtoEntryToDescriptor);
  const validationIssues = collectActivityValidationIssues(descriptors);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateActivityIssues(descriptors, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  const frameworkVersion = normaliseFrameworkVersion(dto.frameworkVersion);
  if (dto.frameworkVersion !== undefined && frameworkVersion === undefined) {
    errors.push({
      code: "VALIDATION",
      message: "ActivityRegistryDto.frameworkVersion must be a non-empty string",
      field: "frameworkVersion",
    });
    return {
      ok: false,
      dto: createEmptyActivityRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    dto: Object.freeze({
      schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion,
      types: Object.freeze([...types]),
    }),
    errors: [],
  };
}
