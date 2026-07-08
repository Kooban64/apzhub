import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { TimelineDefinition } from "../types/timeline-definition";
import { TimelineRegistryValidationError } from "./registry-errors";
import { validateTimelineDefinition } from "./validate-timeline-definition";

export function collectTimelineValidationIssues(
  definitions: readonly TimelineDefinition[],
): TimelineRegistrationIssue[] {
  const issues: TimelineRegistrationIssue[] = [];

  for (const definition of definitions) {
    try {
      validateTimelineDefinition(definition);
    } catch (error) {
      if (error instanceof TimelineRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          timelineId: definition.timelineId,
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

export function collectDuplicateTimelineIssues(
  definitions: readonly TimelineDefinition[],
  existingIds: ReadonlySet<string>,
): TimelineRegistrationIssue[] {
  const issues: TimelineRegistrationIssue[] = [];
  const seen = new Set<string>();

  for (const definition of definitions) {
    if (seen.has(definition.timelineId) || existingIds.has(definition.timelineId)) {
      issues.push({
        code: "DUPLICATE_ID",
        timelineId: definition.timelineId,
        message: `Duplicate timeline id: ${definition.timelineId}`,
      });
    }
    seen.add(definition.timelineId);
  }

  return issues;
}
