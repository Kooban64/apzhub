import type { PlatformLifecycleState } from "./types";

/** Startup progression order (happy path). */
export const PLATFORM_LIFECYCLE_STARTUP_SEQUENCE: readonly PlatformLifecycleState[] = [
  "initializing",
  "bootstrapping",
  "configuration-ready",
  "identity-ready",
  "authorization-ready",
  "platform-ready",
  "products-ready",
  "operational",
] as const;

export const PLATFORM_LIFECYCLE_TERMINAL_STATES: readonly PlatformLifecycleState[] = [
  "stopped",
] as const;

export function formatLifecycleStateLabel(state: PlatformLifecycleState): string {
  return state
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function lifecycleStateIndex(state: PlatformLifecycleState): number {
  const index = PLATFORM_LIFECYCLE_STARTUP_SEQUENCE.indexOf(state);
  return index >= 0 ? index : -1;
}

export function isOperationalLifecycleState(state: PlatformLifecycleState): boolean {
  return state === "operational";
}

export function isActiveServingState(state: PlatformLifecycleState): boolean {
  return state === "operational" || state === "degraded" || state === "maintenance";
}
