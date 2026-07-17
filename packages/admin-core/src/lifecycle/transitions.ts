/**
 * Administration lifecycle transitions (APZADMIN-001).
 * Fail closed — only explicitly allowed transitions succeed.
 */

import type { AdministrationLifecycleStatus } from "@apzhub/admin-contracts";
import {
  ADMINISTRATION_LIFECYCLE_STATUSES,
  isAdministrationLifecycleStatus,
} from "@apzhub/admin-contracts";

import { AdministrationDomainError } from "../ports/repository-ports";

const ALLOWED: Readonly<
  Record<
    AdministrationLifecycleStatus,
    readonly AdministrationLifecycleStatus[]
  >
> = {
  draft: ["registered", "archived"],
  registered: ["active", "draft", "archived"],
  active: ["deprecated", "archived"],
  deprecated: ["archived", "active"],
  archived: ["draft"],
};

export function listAllowedAdministrationLifecycleTransitions(
  from: AdministrationLifecycleStatus,
): readonly AdministrationLifecycleStatus[] {
  return ALLOWED[from];
}

export { isAdministrationLifecycleStatus, ADMINISTRATION_LIFECYCLE_STATUSES };

export function canTransitionAdministrationLifecycle(
  from: AdministrationLifecycleStatus,
  to: AdministrationLifecycleStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertAdministrationLifecycleTransition(
  from: AdministrationLifecycleStatus,
  to: AdministrationLifecycleStatus,
): void {
  if (!canTransitionAdministrationLifecycle(from, to)) {
    throw new AdministrationDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition administration lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
