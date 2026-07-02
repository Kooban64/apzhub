import type { CapabilityLifecycleState } from "../capability/types";

/**
 * Valid lifecycle transitions.
 * Happy path is linear; failure states support disable, fail, and degrade flows.
 */
const VALID_TRANSITIONS: Readonly<
  Record<CapabilityLifecycleState, readonly CapabilityLifecycleState[]>
> = {
  discovered: ["validated", "failed", "disabled"],
  validated: ["dependencies-resolved", "failed", "disabled"],
  "dependencies-resolved": ["registered", "failed", "disabled"],
  registered: ["initialised", "failed", "disabled"],
  initialised: ["healthy", "degraded", "failed", "disabled"],
  healthy: ["active", "degraded", "failed", "disabled"],
  active: ["degraded", "failed", "disabled"],
  degraded: ["healthy", "failed", "disabled"],
  failed: ["discovered", "degraded", "disabled"],
  disabled: ["discovered"],
};

export function getAllowedTransitions(
  from: CapabilityLifecycleState | null,
): readonly CapabilityLifecycleState[] {
  if (from === null) {
    return ["discovered"];
  }
  return VALID_TRANSITIONS[from];
}

export function canTransitionBetween(
  from: CapabilityLifecycleState | null,
  to: CapabilityLifecycleState,
): boolean {
  return getAllowedTransitions(from).includes(to);
}

export function isFailureState(state: CapabilityLifecycleState): boolean {
  return state === "failed" || state === "disabled" || state === "degraded";
}
