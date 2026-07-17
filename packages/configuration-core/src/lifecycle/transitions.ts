/**
 * Configuration lifecycle transitions (APZCONFIG-001).
 * Fail closed — only explicitly allowed transitions succeed.
 * No automatic rollout.
 */

import type { ConfigurationLifecycleStatus } from "@apzhub/configuration-contracts";
import {
  CONFIGURATION_LIFECYCLE_STATUSES,
  isConfigurationLifecycleStatus,
} from "@apzhub/configuration-contracts";

import { ConfigurationDomainError } from "../ports/repository-ports";

const ALLOWED: Readonly<
  Record<ConfigurationLifecycleStatus, readonly ConfigurationLifecycleStatus[]>
> = {
  draft: ["validated", "archived"],
  validated: ["approved", "draft", "archived"],
  approved: ["published", "validated", "archived"],
  published: ["deprecated", "archived"],
  deprecated: ["archived", "published"],
  archived: ["draft"],
};

export function listAllowedConfigurationLifecycleTransitions(
  from: ConfigurationLifecycleStatus,
): readonly ConfigurationLifecycleStatus[] {
  return ALLOWED[from];
}

export { isConfigurationLifecycleStatus, CONFIGURATION_LIFECYCLE_STATUSES };

export function canTransitionConfigurationLifecycle(
  from: ConfigurationLifecycleStatus,
  to: ConfigurationLifecycleStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertConfigurationLifecycleTransition(
  from: ConfigurationLifecycleStatus,
  to: ConfigurationLifecycleStatus,
): void {
  if (!canTransitionConfigurationLifecycle(from, to)) {
    throw new ConfigurationDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition configuration lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
