import type { PlatformLifecycleState } from "./types";

const VALID_TRANSITIONS: Readonly<
  Record<PlatformLifecycleState, readonly PlatformLifecycleState[]>
> = {
  initializing: ["bootstrapping", "degraded", "stopped"],
  bootstrapping: ["configuration-ready", "degraded", "recovering", "stopped"],
  "configuration-ready": ["identity-ready", "degraded", "recovering", "stopped"],
  "identity-ready": ["authorization-ready", "degraded", "recovering", "stopped"],
  "authorization-ready": ["platform-ready", "degraded", "recovering", "stopped"],
  "platform-ready": ["products-ready", "degraded", "recovering", "stopped"],
  "products-ready": ["operational", "degraded", "recovering", "stopped"],
  operational: ["maintenance", "degraded", "stopping", "recovering"],
  maintenance: ["operational", "stopping"],
  degraded: ["recovering", "operational", "stopping", "stopped"],
  recovering: ["operational", "degraded", "bootstrapping", "configuration-ready", "identity-ready", "authorization-ready", "platform-ready", "products-ready"],
  stopping: ["stopped"],
  stopped: ["initializing", "recovering"],
};

export function getAllowedLifecycleTransitions(
  from: PlatformLifecycleState,
): readonly PlatformLifecycleState[] {
  return VALID_TRANSITIONS[from];
}

export function canTransitionLifecycle(
  from: PlatformLifecycleState,
  to: PlatformLifecycleState,
): boolean {
  return getAllowedLifecycleTransitions(from).includes(to);
}

export function pickHighestStartupState(
  satisfiedGates: readonly PlatformLifecycleState[],
): PlatformLifecycleState {
  const order: PlatformLifecycleState[] = [
    "operational",
    "products-ready",
    "platform-ready",
    "authorization-ready",
    "identity-ready",
    "configuration-ready",
    "bootstrapping",
    "initializing",
  ];

  for (const state of order) {
    if (satisfiedGates.includes(state)) {
      return state;
    }
  }

  return "initializing";
}
