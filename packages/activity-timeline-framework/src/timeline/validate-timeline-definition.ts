import type { ActivityCategory } from "../types/activity-category";
import { ACTIVITY_CATEGORIES } from "../types/activity-category";
import type {
  TimelineDefinition,
  TimelineDefinitionSource,
  TimelineDefinitionStatus,
} from "../types/timeline-definition";
import {
  RESERVED_TIMELINE_SCOPE_IDS,
  type TimelineScopeId,
} from "../types/timeline-scope";
import type {
  ActivityStability,
  ActivityVisibility,
} from "../types/activity-descriptor";
import { TimelineRegistryValidationError } from "./registry-errors";

const TIMELINE_ID_PATTERN = /^[a-z][a-z0-9.-]*$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const TIMELINE_SCOPE_SET = new Set<TimelineScopeId>(RESERVED_TIMELINE_SCOPE_IDS);

const ACTIVITY_CATEGORY_SET = new Set<ActivityCategory>(ACTIVITY_CATEGORIES);

const DESCRIPTOR_STATUSES = new Set<TimelineDefinitionStatus>([
  "active",
  "planned",
  "inactive",
]);

const VISIBILITIES = new Set<ActivityVisibility>(["public", "internal", "restricted"]);

const STABILITIES = new Set<ActivityStability>([
  "stable",
  "experimental",
  "deprecated",
]);

const DESCRIPTOR_SOURCES = new Set<TimelineDefinitionSource>(["builtin", "manifest"]);

/** Validates timeline definition shape before registration. Does not generate timelines. */
export function validateTimelineDefinition(definition: TimelineDefinition): void {
  if (!definition.timelineId?.trim()) {
    throw new TimelineRegistryValidationError("Timeline id is required", "timelineId");
  }

  if (!TIMELINE_ID_PATTERN.test(definition.timelineId)) {
    throw new TimelineRegistryValidationError(
      `Timeline id "${definition.timelineId}" must use lowercase dot notation`,
      "timelineId",
    );
  }

  if (!definition.label?.trim()) {
    throw new TimelineRegistryValidationError("Timeline label is required", "label");
  }

  if (!definition.version?.trim()) {
    throw new TimelineRegistryValidationError(
      "Timeline version is required",
      "version",
    );
  }

  if (!SEMVER_PATTERN.test(definition.version)) {
    throw new TimelineRegistryValidationError(
      `Timeline version "${definition.version}" must be semver`,
      "version",
    );
  }

  if (!TIMELINE_SCOPE_SET.has(definition.scope)) {
    throw new TimelineRegistryValidationError(
      `Invalid timeline scope "${definition.scope}"`,
      "scope",
    );
  }

  if (typeof definition.order !== "number" || !Number.isFinite(definition.order)) {
    throw new TimelineRegistryValidationError(
      "Timeline order must be a finite number",
      "order",
    );
  }

  if (definition.visibility !== undefined && !VISIBILITIES.has(definition.visibility)) {
    throw new TimelineRegistryValidationError(
      `Invalid timeline visibility "${String(definition.visibility)}"`,
      "visibility",
    );
  }

  if (definition.stability !== undefined && !STABILITIES.has(definition.stability)) {
    throw new TimelineRegistryValidationError(
      `Invalid timeline stability "${String(definition.stability)}"`,
      "stability",
    );
  }

  if (definition.status !== undefined && !DESCRIPTOR_STATUSES.has(definition.status)) {
    throw new TimelineRegistryValidationError(
      `Invalid timeline status "${String(definition.status)}"`,
      "status",
    );
  }

  if (definition.source !== undefined && !DESCRIPTOR_SOURCES.has(definition.source)) {
    throw new TimelineRegistryValidationError(
      `Invalid timeline source "${String(definition.source)}"`,
      "source",
    );
  }

  if (definition.supportedActivityCategories !== undefined) {
    if (
      !Array.isArray(definition.supportedActivityCategories) ||
      definition.supportedActivityCategories.length === 0
    ) {
      throw new TimelineRegistryValidationError(
        "Timeline supportedActivityCategories must be a non-empty array when provided",
        "supportedActivityCategories",
      );
    }

    for (const category of definition.supportedActivityCategories) {
      if (!ACTIVITY_CATEGORY_SET.has(category)) {
        throw new TimelineRegistryValidationError(
          `Invalid supported activity category "${String(category)}"`,
          "supportedActivityCategories",
        );
      }
    }
  }

  if (definition.metadata !== undefined && typeof definition.metadata !== "object") {
    throw new TimelineRegistryValidationError(
      "Timeline metadata must be an object when provided",
      "metadata",
    );
  }
}
