/**
 * Platform Metrics lifecycle transitions (APZMETRICS-001).
 * Fail-closed — unknown transitions denied.
 */

import type { MetricsLifecycleStatus } from "@apzhub/metrics-contracts";

import { MetricsDomainError } from "../ports/repository-ports";

const LIFECYCLE_TRANSITIONS: Record<
  MetricsLifecycleStatus,
  readonly MetricsLifecycleStatus[]
> = {
  draft: ["active", "archived"],
  active: ["inactive", "archived"],
  inactive: ["active", "archived"],
  archived: [],
};

export function canTransitionMetricsLifecycle(
  from: MetricsLifecycleStatus,
  to: MetricsLifecycleStatus,
): boolean {
  if (from === to) return true;
  return LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertMetricsLifecycleTransition(
  from: MetricsLifecycleStatus,
  to: MetricsLifecycleStatus,
): void {
  if (!canTransitionMetricsLifecycle(from, to)) {
    throw new MetricsDomainError(
      "invalid_lifecycle_transition",
      `Invalid metrics lifecycle transition: ${from} → ${to}`,
      { from, to },
    );
  }
}

export function listAllowedMetricsLifecycleTransitions(
  from: MetricsLifecycleStatus,
): readonly MetricsLifecycleStatus[] {
  return LIFECYCLE_TRANSITIONS[from] ?? [];
}
