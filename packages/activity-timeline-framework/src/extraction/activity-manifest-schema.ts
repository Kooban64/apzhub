import { ACTIVITY_CATEGORIES, type ActivityCategory } from "../types/activity-category";
import type {
  ActivityDescriptorStatus,
  ActivityRetentionHint,
  ActivitySeverity,
} from "../types/activity-descriptor";
import { normalizeManifestTimelineScope } from "./normalize-timeline-scope";
import type { TimelineScopeId } from "../types/timeline-scope";

const ACTIVITY_CATEGORY_SET = new Set<ActivityCategory>(ACTIVITY_CATEGORIES);

const ACTIVITY_TYPE_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const DESCRIPTOR_STATUSES = new Set<ActivityDescriptorStatus>([
  "active",
  "planned",
  "disabled",
]);

const SEVERITIES = new Set<ActivitySeverity>(["info", "success", "warning", "error"]);

const RETENTION_HINTS = new Set<ActivityRetentionHint>([
  "session",
  "short",
  "standard",
  "extended",
]);

export interface ActivityManifestEntry {
  readonly id: string;
  readonly eventPattern: string;
  readonly category: ActivityCategory;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly version: string;
  readonly severity?: ActivitySeverity;
  readonly iconRef?: string;
  readonly permissionKeys?: readonly string[];
  readonly retentionHint?: ActivityRetentionHint;
  readonly status?: ActivityDescriptorStatus;
  readonly label?: string;
  readonly titleTemplate?: string;
  readonly summaryTemplate?: string;
  readonly bodyTemplate?: string;
  readonly tags?: readonly string[];
}

export interface ActivityManifestValidationIssue {
  readonly message: string;
  readonly field?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTimelineScopes(rawScopes: unknown): {
  scopes?: TimelineScopeId[];
  issue?: ActivityManifestValidationIssue;
} {
  if (!Array.isArray(rawScopes) || rawScopes.length === 0) {
    return {
      issue: {
        message: "Activity timelineScopes must be a non-empty array",
        field: "timelineScopes",
      },
    };
  }

  const scopes: TimelineScopeId[] = [];

  for (const rawScope of rawScopes) {
    if (typeof rawScope !== "string" || !rawScope.trim()) {
      return {
        issue: {
          message: "Activity timelineScopes entries must be strings",
          field: "timelineScopes",
        },
      };
    }

    const normalized = normalizeManifestTimelineScope(rawScope);
    if (!normalized) {
      return {
        issue: {
          message: `Invalid timeline scope "${rawScope}" — must be personal, team, workspace, organization, or system`,
          field: "timelineScopes",
        },
      };
    }

    scopes.push(normalized);
  }

  return { scopes };
}

/** Validates inline capability manifest `activities.types[]` entries. */
export function parseActivityManifestEntry(rawEntry: unknown): {
  entry?: ActivityManifestEntry;
  issue?: ActivityManifestValidationIssue;
} {
  if (!isRecord(rawEntry)) {
    return { issue: { message: "Activity manifest entry must be an object" } };
  }

  const id = rawEntry.id;
  const eventPattern = rawEntry.eventPattern;
  const category = rawEntry.category;
  const templateRef = rawEntry.templateRef;
  const version = rawEntry.version;

  if (typeof id !== "string" || !id.trim()) {
    return { issue: { message: "Activity type id is required", field: "id" } };
  }

  if (!ACTIVITY_TYPE_ID_PATTERN.test(id)) {
    return {
      issue: {
        message: `Activity type id "${id}" must use lowercase dot notation`,
        field: "id",
      },
    };
  }

  if (typeof eventPattern !== "string" || !eventPattern.trim()) {
    return {
      issue: { message: "Activity eventPattern is required", field: "eventPattern" },
    };
  }

  if (
    typeof category !== "string" ||
    !ACTIVITY_CATEGORY_SET.has(category as ActivityCategory)
  ) {
    return { issue: { message: "Invalid activity category", field: "category" } };
  }

  const scopeResult = parseTimelineScopes(rawEntry.timelineScopes);
  if (scopeResult.issue) {
    return { issue: scopeResult.issue };
  }

  if (typeof templateRef !== "string" || !templateRef.trim()) {
    return {
      issue: { message: "Activity templateRef is required", field: "templateRef" },
    };
  }

  if (typeof version !== "string" || !SEMVER_PATTERN.test(version)) {
    return {
      issue: { message: "Activity version must be valid semver", field: "version" },
    };
  }

  if (rawEntry.severity !== undefined) {
    if (
      typeof rawEntry.severity !== "string" ||
      !SEVERITIES.has(rawEntry.severity as ActivitySeverity)
    ) {
      return { issue: { message: "Invalid activity severity", field: "severity" } };
    }
  }

  if (rawEntry.status !== undefined) {
    if (
      typeof rawEntry.status !== "string" ||
      !DESCRIPTOR_STATUSES.has(rawEntry.status as ActivityDescriptorStatus)
    ) {
      return { issue: { message: "Invalid activity status", field: "status" } };
    }
  }

  if (rawEntry.retentionHint !== undefined) {
    if (
      typeof rawEntry.retentionHint !== "string" ||
      !RETENTION_HINTS.has(rawEntry.retentionHint as ActivityRetentionHint)
    ) {
      return {
        issue: { message: "Invalid activity retentionHint", field: "retentionHint" },
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
          message: "Activity permissionKeys must be non-empty strings",
          field: "permissionKeys",
        },
      };
    }
  }

  if (rawEntry.tags !== undefined) {
    if (
      !Array.isArray(rawEntry.tags) ||
      rawEntry.tags.some((tag) => typeof tag !== "string" || !tag.trim())
    ) {
      return {
        issue: { message: "Activity tags must be non-empty strings", field: "tags" },
      };
    }
  }

  return {
    entry: {
      id,
      eventPattern,
      category: category as ActivityCategory,
      timelineScopes: scopeResult.scopes!,
      templateRef,
      version,
      severity: rawEntry.severity as ActivitySeverity | undefined,
      iconRef: typeof rawEntry.iconRef === "string" ? rawEntry.iconRef : undefined,
      permissionKeys: rawEntry.permissionKeys as readonly string[] | undefined,
      retentionHint: rawEntry.retentionHint as ActivityRetentionHint | undefined,
      status: rawEntry.status as ActivityDescriptorStatus | undefined,
      label: typeof rawEntry.label === "string" ? rawEntry.label : undefined,
      titleTemplate:
        typeof rawEntry.titleTemplate === "string" ? rawEntry.titleTemplate : undefined,
      summaryTemplate:
        typeof rawEntry.summaryTemplate === "string"
          ? rawEntry.summaryTemplate
          : undefined,
      bodyTemplate:
        typeof rawEntry.bodyTemplate === "string" ? rawEntry.bodyTemplate : undefined,
      tags: rawEntry.tags as readonly string[] | undefined,
    },
  };
}
