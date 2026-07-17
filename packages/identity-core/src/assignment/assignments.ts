/**
 * Permission and service assignment helpers (APZIDENTITY-001).
 * Metadata only — does not evaluate runtime authorization or provision access.
 */

import type {
  IdentityPermissionAssignment,
  IdentityServiceAssignment,
  IdentityServiceCapability,
} from "@apzhub/identity-contracts";

import { IdentityDomainError } from "../ports/repository-ports";
import {
  validateIdentityPermissionAssignment,
  validateIdentityServiceAssignment,
} from "../validation/validate-identity";

export function listAssignedServiceCapabilities(
  assignments: readonly IdentityServiceAssignment[],
): readonly IdentityServiceCapability[] {
  const set = new Set<IdentityServiceCapability>();
  for (const assignment of assignments) {
    validateIdentityServiceAssignment(assignment);
    if (assignment.status === "active") {
      set.add(assignment.serviceCapability);
    }
  }
  return [...set].sort();
}

export function listAssignedPermissionKeys(
  assignments: readonly IdentityPermissionAssignment[],
): readonly string[] {
  const set = new Set<string>();
  for (const assignment of assignments) {
    validateIdentityPermissionAssignment(assignment);
    set.add(assignment.permissionKey);
  }
  return [...set].sort();
}

export function assertServiceAssignmentActive(
  assignment: IdentityServiceAssignment,
): void {
  validateIdentityServiceAssignment(assignment);
  if (assignment.status !== "active") {
    throw new IdentityDomainError(
      "assignment_not_active",
      `Service assignment ${assignment.id} is not active`,
      { id: assignment.id, status: assignment.status },
    );
  }
}
