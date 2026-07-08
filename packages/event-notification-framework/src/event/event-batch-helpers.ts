import type { EventRegistrationIssue } from "./event-metadata";
import type { EventDescriptor } from "./event-descriptor";
import { EventRegistryValidationError } from "./registry-errors";
import { validateEventDescriptor } from "./validate-event-descriptor";

export function collectEventValidationIssues(
  descriptors: readonly EventDescriptor[],
): EventRegistrationIssue[] {
  const issues: EventRegistrationIssue[] = [];

  for (const descriptor of descriptors) {
    try {
      validateEventDescriptor(descriptor);
    } catch (error) {
      if (error instanceof EventRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          eventId: descriptor.eventId,
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

export function collectDuplicateEventIssues(
  descriptors: readonly EventDescriptor[],
  existingIds: ReadonlySet<string>,
): EventRegistrationIssue[] {
  const issues: EventRegistrationIssue[] = [];
  const seen = new Set<string>();

  for (const descriptor of descriptors) {
    if (seen.has(descriptor.eventId) || existingIds.has(descriptor.eventId)) {
      issues.push({
        code: "DUPLICATE_ID",
        eventId: descriptor.eventId,
        message: `Duplicate event id: ${descriptor.eventId}`,
      });
    }
    seen.add(descriptor.eventId);
  }

  return issues;
}
