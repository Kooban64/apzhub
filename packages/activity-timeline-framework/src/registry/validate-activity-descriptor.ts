import type { ActivityCategory } from "../types/activity-category";
import { ACTIVITY_CATEGORIES } from "../types/activity-category";
import type {
  ActivityDescriptor,
  ActivityDescriptorSource,
  ActivityDescriptorStatus,
  ActivityRetentionHint,
  ActivitySeverity,
  ActivityStability,
  ActivityVisibility,
} from "../types/activity-descriptor";
import {
  RESERVED_TIMELINE_SCOPE_IDS,
  type TimelineScopeId,
} from "../types/timeline-scope";
import { ActivityRegistryValidationError } from "./registry-errors";

const ACTIVITY_TYPE_ID_PATTERN = /^[a-z][a-z0-9.-]*$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const ACTIVITY_CATEGORY_SET = new Set<ActivityCategory>(ACTIVITY_CATEGORIES);

const TIMELINE_SCOPE_SET = new Set<TimelineScopeId>(RESERVED_TIMELINE_SCOPE_IDS);

const DESCRIPTOR_STATUSES = new Set<ActivityDescriptorStatus>([
  "active",
  "planned",
  "disabled",
]);

const VISIBILITIES = new Set<ActivityVisibility>(["public", "internal", "restricted"]);

const STABILITIES = new Set<ActivityStability>([
  "stable",
  "experimental",
  "deprecated",
]);

const SEVERITIES = new Set<ActivitySeverity>(["info", "success", "warning", "error"]);

const RETENTION_HINTS = new Set<ActivityRetentionHint>([
  "session",
  "short",
  "standard",
  "extended",
]);

const DESCRIPTOR_SOURCES = new Set<ActivityDescriptorSource>(["builtin", "manifest"]);

/** Validates activity descriptor shape before registration. Does not map events or subscribe. */
export function validateActivityDescriptor(descriptor: ActivityDescriptor): void {
  if (!descriptor.activityTypeId?.trim()) {
    throw new ActivityRegistryValidationError(
      "Activity type id is required",
      "activityTypeId",
    );
  }

  if (!ACTIVITY_TYPE_ID_PATTERN.test(descriptor.activityTypeId)) {
    throw new ActivityRegistryValidationError(
      `Activity type id "${descriptor.activityTypeId}" must use lowercase dot notation`,
      "activityTypeId",
    );
  }

  if (!descriptor.version?.trim()) {
    throw new ActivityRegistryValidationError(
      "Activity version is required",
      "version",
    );
  }

  if (!SEMVER_PATTERN.test(descriptor.version)) {
    throw new ActivityRegistryValidationError(
      `Activity version "${descriptor.version}" must be semver`,
      "version",
    );
  }

  if (!ACTIVITY_CATEGORY_SET.has(descriptor.category)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity category "${String(descriptor.category)}"`,
      "category",
    );
  }

  if (!descriptor.sourceEventPattern?.trim()) {
    throw new ActivityRegistryValidationError(
      "Activity sourceEventPattern is required",
      "sourceEventPattern",
    );
  }

  if (!descriptor.templateRef?.trim()) {
    throw new ActivityRegistryValidationError(
      "Activity templateRef is required",
      "templateRef",
    );
  }

  if (
    !Array.isArray(descriptor.timelineScopes) ||
    descriptor.timelineScopes.length === 0 ||
    descriptor.timelineScopes.some((scope) => !scope.trim())
  ) {
    throw new ActivityRegistryValidationError(
      "Activity timelineScopes must be a non-empty array",
      "timelineScopes",
    );
  }

  for (const scope of descriptor.timelineScopes) {
    if (!TIMELINE_SCOPE_SET.has(scope)) {
      throw new ActivityRegistryValidationError(
        `Invalid timeline scope "${scope}" — must be a reserved scope id`,
        "timelineScopes",
      );
    }
  }

  if (descriptor.schemaVersion !== undefined && !descriptor.schemaVersion.trim()) {
    throw new ActivityRegistryValidationError(
      "Activity schemaVersion must be non-empty when provided",
      "schemaVersion",
    );
  }

  if (
    descriptor.schemaVersion !== undefined &&
    !SEMVER_PATTERN.test(descriptor.schemaVersion)
  ) {
    throw new ActivityRegistryValidationError(
      `Activity schemaVersion "${descriptor.schemaVersion}" must be semver`,
      "schemaVersion",
    );
  }

  if (descriptor.visibility !== undefined && !VISIBILITIES.has(descriptor.visibility)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity visibility "${String(descriptor.visibility)}"`,
      "visibility",
    );
  }

  if (descriptor.stability !== undefined && !STABILITIES.has(descriptor.stability)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity stability "${String(descriptor.stability)}"`,
      "stability",
    );
  }

  if (descriptor.status !== undefined && !DESCRIPTOR_STATUSES.has(descriptor.status)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity status "${String(descriptor.status)}"`,
      "status",
    );
  }

  if (descriptor.severity !== undefined && !SEVERITIES.has(descriptor.severity)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity severity "${String(descriptor.severity)}"`,
      "severity",
    );
  }

  if (
    descriptor.retentionHint !== undefined &&
    !RETENTION_HINTS.has(descriptor.retentionHint)
  ) {
    throw new ActivityRegistryValidationError(
      `Invalid activity retentionHint "${String(descriptor.retentionHint)}"`,
      "retentionHint",
    );
  }

  if (descriptor.source !== undefined && !DESCRIPTOR_SOURCES.has(descriptor.source)) {
    throw new ActivityRegistryValidationError(
      `Invalid activity source "${String(descriptor.source)}"`,
      "source",
    );
  }

  if (descriptor.tags !== undefined) {
    if (!Array.isArray(descriptor.tags) || descriptor.tags.some((tag) => !tag.trim())) {
      throw new ActivityRegistryValidationError(
        "Activity tags must be non-empty strings when provided",
        "tags",
      );
    }
  }

  if (descriptor.permissionKeys !== undefined) {
    if (
      !Array.isArray(descriptor.permissionKeys) ||
      descriptor.permissionKeys.some((key) => !key.trim())
    ) {
      throw new ActivityRegistryValidationError(
        "Activity permissionKeys must be non-empty strings when provided",
        "permissionKeys",
      );
    }
  }
}
