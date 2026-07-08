import { ACTIVITY_CATEGORIES, type ActivityCategory } from "../types/activity-category";
import type { TimelineDefinitionStatus } from "../types/timeline-definition";
import { normalizeManifestTimelineScope } from "./normalize-timeline-scope";
import type { TimelineScopeId } from "../types/timeline-scope";

const TIMELINE_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const DESCRIPTOR_STATUSES = new Set<TimelineDefinitionStatus>([
  "active",
  "planned",
  "inactive",
]);

const GROUPINGS = new Set(["by-day", "by-actor", "by-category", "flat"]);

const SORT_ORDERS = new Set(["newest-first", "oldest-first"]);

const ACTIVITY_CATEGORY_SET = new Set<ActivityCategory>(ACTIVITY_CATEGORIES);

export interface TimelineManifestEntry {
  readonly id: string;
  readonly scope: TimelineScopeId;
  readonly label: string;
  readonly version: string;
  readonly grouping: string;
  readonly sortOrder?: string;
  readonly order?: number;
  readonly description?: string;
  readonly iconRef?: string;
  readonly permissionKeys?: readonly string[];
  readonly activityTypeFilter?: readonly string[];
  readonly activityCategoryFilter?: readonly ActivityCategory[];
  readonly experienceRef?: string;
  readonly status?: TimelineDefinitionStatus;
}

export interface TimelineManifestValidationIssue {
  readonly message: string;
  readonly field?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates inline capability manifest timeline entries. */
export function parseTimelineManifestEntry(rawEntry: unknown): {
  entry?: TimelineManifestEntry;
  issue?: TimelineManifestValidationIssue;
} {
  if (!isRecord(rawEntry)) {
    return { issue: { message: "Timeline manifest entry must be an object" } };
  }

  const id = rawEntry.id;
  const scope = rawEntry.scope;
  const label = rawEntry.label;
  const version = rawEntry.version;
  const grouping = rawEntry.grouping;

  if (typeof id !== "string" || !id.trim()) {
    return { issue: { message: "Timeline id is required", field: "id" } };
  }

  if (!TIMELINE_ID_PATTERN.test(id)) {
    return {
      issue: {
        message: `Timeline id "${id}" must use lowercase dot notation`,
        field: "id",
      },
    };
  }

  if (typeof scope !== "string" || !scope.trim()) {
    return { issue: { message: "Timeline scope is required", field: "scope" } };
  }

  const normalizedScope = normalizeManifestTimelineScope(scope);
  if (!normalizedScope) {
    return {
      issue: {
        message: `Invalid timeline scope "${scope}" — must be personal, team, workspace, organization, or system`,
        field: "scope",
      },
    };
  }

  if (typeof label !== "string" || !label.trim()) {
    return { issue: { message: "Timeline label is required", field: "label" } };
  }

  if (typeof version !== "string" || !SEMVER_PATTERN.test(version)) {
    return {
      issue: { message: "Timeline version must be valid semver", field: "version" },
    };
  }

  if (typeof grouping !== "string" || !GROUPINGS.has(grouping)) {
    return { issue: { message: "Invalid timeline grouping", field: "grouping" } };
  }

  if (rawEntry.sortOrder !== undefined) {
    if (
      typeof rawEntry.sortOrder !== "string" ||
      !SORT_ORDERS.has(rawEntry.sortOrder)
    ) {
      return { issue: { message: "Invalid timeline sortOrder", field: "sortOrder" } };
    }
  }

  if (rawEntry.status !== undefined) {
    if (
      typeof rawEntry.status !== "string" ||
      !DESCRIPTOR_STATUSES.has(rawEntry.status as TimelineDefinitionStatus)
    ) {
      return { issue: { message: "Invalid timeline status", field: "status" } };
    }
  }

  if (rawEntry.order !== undefined) {
    if (typeof rawEntry.order !== "number" || !Number.isFinite(rawEntry.order)) {
      return {
        issue: { message: "Timeline order must be a finite number", field: "order" },
      };
    }
  }

  if (rawEntry.activityCategoryFilter !== undefined) {
    if (
      !Array.isArray(rawEntry.activityCategoryFilter) ||
      rawEntry.activityCategoryFilter.length === 0 ||
      rawEntry.activityCategoryFilter.some(
        (category) =>
          typeof category !== "string" ||
          !ACTIVITY_CATEGORY_SET.has(category as ActivityCategory),
      )
    ) {
      return {
        issue: {
          message: "Timeline activityCategoryFilter must be non-empty valid categories",
          field: "activityCategoryFilter",
        },
      };
    }
  }

  if (rawEntry.activityTypeFilter !== undefined) {
    if (
      !Array.isArray(rawEntry.activityTypeFilter) ||
      rawEntry.activityTypeFilter.some(
        (pattern) => typeof pattern !== "string" || !pattern.trim(),
      )
    ) {
      return {
        issue: {
          message: "Timeline activityTypeFilter must be non-empty strings",
          field: "activityTypeFilter",
        },
      };
    }
  }

  if (rawEntry.permissionKeys !== undefined) {
    if (
      !Array.isArray(rawEntry.permissionKeys) ||
      rawEntry.permissionKeys.some((key) => typeof key !== "string" || !key.trim())
    ) {
      return {
        issue: {
          message: "Timeline permissionKeys must be non-empty strings",
          field: "permissionKeys",
        },
      };
    }
  }

  return {
    entry: {
      id,
      scope: normalizedScope,
      label,
      version,
      grouping,
      sortOrder:
        typeof rawEntry.sortOrder === "string" ? rawEntry.sortOrder : undefined,
      order: typeof rawEntry.order === "number" ? rawEntry.order : undefined,
      description:
        typeof rawEntry.description === "string" ? rawEntry.description : undefined,
      iconRef: typeof rawEntry.iconRef === "string" ? rawEntry.iconRef : undefined,
      permissionKeys: rawEntry.permissionKeys as readonly string[] | undefined,
      activityTypeFilter: rawEntry.activityTypeFilter as readonly string[] | undefined,
      activityCategoryFilter: rawEntry.activityCategoryFilter as
        readonly ActivityCategory[] | undefined,
      experienceRef:
        typeof rawEntry.experienceRef === "string" ? rawEntry.experienceRef : undefined,
      status: rawEntry.status as TimelineDefinitionStatus | undefined,
    },
  };
}
