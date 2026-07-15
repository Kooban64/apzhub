/** Adapter integration lifecycle states — OSS-100-03 will wire platform lifecycle hooks. */
export type IntegrationLifecycleState =
  | "unregistered"
  | "registered"
  | "initialising"
  | "ready"
  | "degraded"
  | "disabled"
  | "failed"
  | "shutting_down"
  | "shutdown";

export const INTEGRATION_LIFECYCLE_STATES: readonly IntegrationLifecycleState[] = [
  "unregistered",
  "registered",
  "initialising",
  "ready",
  "degraded",
  "disabled",
  "failed",
  "shutting_down",
  "shutdown",
] as const;

export const TERMINAL_INTEGRATION_LIFECYCLE_STATES: readonly IntegrationLifecycleState[] =
  ["disabled", "failed", "shutdown"] as const;

export const ACTIVE_INTEGRATION_LIFECYCLE_STATES: readonly IntegrationLifecycleState[] =
  ["ready", "degraded"] as const;
