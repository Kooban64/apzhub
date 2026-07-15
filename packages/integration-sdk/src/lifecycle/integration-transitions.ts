import type { IntegrationLifecycleState } from "./types";

const ALLOWED_INTEGRATION_LIFECYCLE_TRANSITIONS: Readonly<
  Record<IntegrationLifecycleState, readonly IntegrationLifecycleState[]>
> = {
  unregistered: ["registered"],
  registered: ["initialising", "disabled"],
  initialising: ["ready", "degraded", "failed", "disabled"],
  ready: ["degraded", "disabled", "shutting_down"],
  degraded: ["ready", "disabled", "shutting_down", "failed"],
  disabled: ["registered", "initialising"],
  failed: ["registered", "initialising", "disabled"],
  shutting_down: ["shutdown"],
  shutdown: [],
};

export function canTransitionIntegrationLifecycle(
  from: IntegrationLifecycleState,
  to: IntegrationLifecycleState,
): boolean {
  if (from === to) {
    return true;
  }
  return ALLOWED_INTEGRATION_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedIntegrationLifecycleTransitions(
  from: IntegrationLifecycleState,
): readonly IntegrationLifecycleState[] {
  return ALLOWED_INTEGRATION_LIFECYCLE_TRANSITIONS[from] ?? [];
}

export function mapHealthStatusToParticipationReadiness(
  healthStatus: "healthy" | "degraded" | "unavailable" | "disabled" | undefined,
): "healthy" | "degraded" | "unhealthy" | "unknown" {
  switch (healthStatus) {
    case "healthy":
      return "healthy";
    case "degraded":
      return "degraded";
    case "unavailable":
    case "disabled":
      return "unhealthy";
    default:
      return "unknown";
  }
}

export function mapLifecycleStateToShutdownStatus(
  state: IntegrationLifecycleState,
): "none" | "draining" | "complete" {
  if (state === "shutting_down") {
    return "draining";
  }
  if (state === "shutdown") {
    return "complete";
  }
  return "none";
}

export function mapLifecycleStateToRecoveryStatus(
  state: IntegrationLifecycleState,
): "none" | "in-progress" | "complete" {
  if (state === "failed") {
    return "in-progress";
  }
  if (state === "ready" || state === "degraded") {
    return "complete";
  }
  return "none";
}
