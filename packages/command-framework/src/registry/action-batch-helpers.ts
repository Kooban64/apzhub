import type { ActionDescriptor } from "../types";
import type { ActionRegistrationIssue } from "./action-batch-registration";
import { ActionRegistryValidationError } from "./registry-errors";
import { validateActionDescriptor } from "./validate-action-descriptor";

export function collectDescriptorValidationIssues(
  descriptors: readonly ActionDescriptor[],
): ActionRegistrationIssue[] {
  const issues: ActionRegistrationIssue[] = [];

  for (const descriptor of descriptors) {
    try {
      validateActionDescriptor(descriptor);
    } catch (error) {
      if (error instanceof ActionRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          actionId: descriptor.id,
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

export function collectDuplicateActionIssues(
  descriptors: readonly ActionDescriptor[],
  existingIds: ReadonlySet<string>,
): ActionRegistrationIssue[] {
  const seen = new Set(existingIds);
  const issues: ActionRegistrationIssue[] = [];

  for (const descriptor of descriptors) {
    if (seen.has(descriptor.id)) {
      issues.push({
        code: "DUPLICATE_ID",
        actionId: descriptor.id,
        capabilityId: descriptor.capabilityId,
        message: `Action id "${descriptor.id}" is already registered`,
      });
    }
    seen.add(descriptor.id);
  }

  return issues;
}
