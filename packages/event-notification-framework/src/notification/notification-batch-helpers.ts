import type { NotificationRegistrationIssue } from "./notification-metadata";
import type { NotificationDescriptor } from "./notification-descriptor";
import { NotificationRegistryValidationError } from "./registry-errors";
import { validateNotificationDescriptor } from "./validate-notification-descriptor";

export function collectNotificationValidationIssues(
  descriptors: readonly NotificationDescriptor[],
): NotificationRegistrationIssue[] {
  const issues: NotificationRegistrationIssue[] = [];

  for (const descriptor of descriptors) {
    try {
      validateNotificationDescriptor(descriptor);
    } catch (error) {
      if (error instanceof NotificationRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          routeId: descriptor.routeId,
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

export function collectDuplicateRouteIssues(
  descriptors: readonly NotificationDescriptor[],
  existingIds: ReadonlySet<string>,
): NotificationRegistrationIssue[] {
  const issues: NotificationRegistrationIssue[] = [];
  const seen = new Set<string>();

  for (const descriptor of descriptors) {
    if (seen.has(descriptor.routeId) || existingIds.has(descriptor.routeId)) {
      issues.push({
        code: "DUPLICATE_ID",
        routeId: descriptor.routeId,
        message: `Duplicate notification route id: ${descriptor.routeId}`,
      });
    }
    seen.add(descriptor.routeId);
  }

  return issues;
}
