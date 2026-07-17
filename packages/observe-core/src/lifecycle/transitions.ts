/**
 * Observability health / alert lifecycle transitions (APZOBSERVE-001).
 * Fail-closed — unknown transitions denied.
 */

import type {
  ObserveAlertStateKind,
  ObserveHealthStatus,
  ObserveMetadataStatus,
} from "@apzhub/observe-contracts";

import { ObserveDomainError } from "../ports/repository-ports";

const HEALTH_TRANSITIONS: Record<
  ObserveHealthStatus,
  readonly ObserveHealthStatus[]
> = {
  unknown: ["healthy", "degraded", "unhealthy", "maintenance"],
  healthy: ["degraded", "unhealthy", "maintenance", "unknown"],
  degraded: ["healthy", "unhealthy", "maintenance", "unknown"],
  unhealthy: ["healthy", "degraded", "maintenance", "unknown"],
  maintenance: ["healthy", "degraded", "unhealthy", "unknown"],
};

const ALERT_TRANSITIONS: Record<
  ObserveAlertStateKind,
  readonly ObserveAlertStateKind[]
> = {
  inactive: ["pending", "firing", "silenced"],
  pending: ["firing", "resolved", "silenced", "inactive"],
  firing: ["resolved", "silenced"],
  resolved: ["inactive", "pending", "firing"],
  silenced: ["inactive", "pending", "firing", "resolved"],
};

const METADATA_TRANSITIONS: Record<
  ObserveMetadataStatus,
  readonly ObserveMetadataStatus[]
> = {
  draft: ["active", "archived"],
  active: ["inactive", "archived"],
  inactive: ["active", "archived"],
  archived: [],
};

export function canTransitionObserveHealth(
  from: ObserveHealthStatus,
  to: ObserveHealthStatus,
): boolean {
  if (from === to) return true;
  return HEALTH_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertObserveHealthTransition(
  from: ObserveHealthStatus,
  to: ObserveHealthStatus,
): void {
  if (!canTransitionObserveHealth(from, to)) {
    throw new ObserveDomainError(
      "invalid_lifecycle_transition",
      `Invalid health transition: ${from} → ${to}`,
      { from, to },
    );
  }
}

export function listAllowedObserveHealthTransitions(
  from: ObserveHealthStatus,
): readonly ObserveHealthStatus[] {
  return HEALTH_TRANSITIONS[from] ?? [];
}

export function canTransitionObserveAlertState(
  from: ObserveAlertStateKind,
  to: ObserveAlertStateKind,
): boolean {
  if (from === to) return true;
  return ALERT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertObserveAlertStateTransition(
  from: ObserveAlertStateKind,
  to: ObserveAlertStateKind,
): void {
  if (!canTransitionObserveAlertState(from, to)) {
    throw new ObserveDomainError(
      "invalid_lifecycle_transition",
      `Invalid alert state transition: ${from} → ${to}`,
      { from, to },
    );
  }
}

export function canTransitionObserveMetadata(
  from: ObserveMetadataStatus,
  to: ObserveMetadataStatus,
): boolean {
  if (from === to) return true;
  return METADATA_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertObserveMetadataTransition(
  from: ObserveMetadataStatus,
  to: ObserveMetadataStatus,
): void {
  if (!canTransitionObserveMetadata(from, to)) {
    throw new ObserveDomainError(
      "invalid_lifecycle_transition",
      `Invalid metadata transition: ${from} → ${to}`,
      { from, to },
    );
  }
}
