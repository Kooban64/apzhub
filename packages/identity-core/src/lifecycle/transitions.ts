/**
 * Identity lifecycle transitions (APZIDENTITY-001).
 * Fail-closed — unknown transitions rejected.
 */

import type { IdentityLifecycleStatus } from "@apzhub/identity-contracts";

import { IdentityDomainError } from "../ports/repository-ports";

const ALLOWED: Readonly<
  Record<IdentityLifecycleStatus, readonly IdentityLifecycleStatus[]>
> = {
  draft: ["invited", "pending", "active", "archived"],
  invited: ["pending", "active", "deactivated", "archived"],
  pending: ["active", "suspended", "deactivated", "archived"],
  active: ["suspended", "deactivated", "archived"],
  suspended: ["active", "deactivated", "archived"],
  deactivated: ["archived", "active"],
  archived: [],
};

export function canTransitionIdentityLifecycle(
  from: IdentityLifecycleStatus,
  to: IdentityLifecycleStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function listAllowedIdentityLifecycleTransitions(
  from: IdentityLifecycleStatus,
): readonly IdentityLifecycleStatus[] {
  return ALLOWED[from];
}

export function assertIdentityLifecycleTransition(
  from: IdentityLifecycleStatus,
  to: IdentityLifecycleStatus,
): void {
  if (!canTransitionIdentityLifecycle(from, to)) {
    throw new IdentityDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition identity lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
