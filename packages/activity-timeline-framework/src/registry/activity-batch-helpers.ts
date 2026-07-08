import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import { ActivityRegistryValidationError } from "./registry-errors";
import { validateActivityDescriptor } from "./validate-activity-descriptor";

export function collectActivityValidationIssues(
  descriptors: readonly ActivityDescriptor[],
): ActivityRegistrationIssue[] {
  const issues: ActivityRegistrationIssue[] = [];

  for (const descriptor of descriptors) {
    try {
      validateActivityDescriptor(descriptor);
    } catch (error) {
      if (error instanceof ActivityRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          activityTypeId: descriptor.activityTypeId,
          message: error.message,
          field: error.field,
        });
      } else {
        throw error;
      }
    }
  }

  return issues;
}

export function collectDuplicateActivityIssues(
  descriptors: readonly ActivityDescriptor[],
  existingIds: ReadonlySet<string>,
): ActivityRegistrationIssue[] {
  const issues: ActivityRegistrationIssue[] = [];
  const seen = new Set<string>();

  for (const descriptor of descriptors) {
    if (
      seen.has(descriptor.activityTypeId) ||
      existingIds.has(descriptor.activityTypeId)
    ) {
      issues.push({
        code: "DUPLICATE_ID",
        activityTypeId: descriptor.activityTypeId,
        message: `Duplicate activity type id: ${descriptor.activityTypeId}`,
      });
    }
    seen.add(descriptor.activityTypeId);
  }

  return issues;
}
