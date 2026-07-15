import type { ConnectionLifecycleState } from "./types";

const VALID_TRANSITIONS: Readonly<
  Record<ConnectionLifecycleState, readonly ConnectionLifecycleState[]>
> = {
  unconfigured: ["configured", "misconfigured", "disabled"],
  configured: ["authenticating", "misconfigured", "disabled", "disconnected"],
  authenticating: ["connected", "authentication_failed", "disabled"],
  connected: ["disconnected", "degraded", "disabled"],
  disconnected: ["configured", "authenticating", "disabled"],
  authentication_failed: ["configured", "disabled"],
  misconfigured: ["configured", "disabled"],
  degraded: ["connected", "disconnected", "disabled"],
  disabled: ["configured"],
};

export function canTransitionConnectionLifecycle(
  from: ConnectionLifecycleState,
  to: ConnectionLifecycleState,
): boolean {
  if (from === to) {
    return true;
  }

  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedConnectionLifecycleTransitions(
  from: ConnectionLifecycleState,
): readonly ConnectionLifecycleState[] {
  return VALID_TRANSITIONS[from] ?? [];
}

export function isTerminalConnectionLifecycleState(
  state: ConnectionLifecycleState,
): boolean {
  return state === "disabled";
}

export function isActiveConnectionLifecycleState(
  state: ConnectionLifecycleState,
): boolean {
  return state === "connected" || state === "degraded";
}
