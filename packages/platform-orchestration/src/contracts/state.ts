/** Kernel lifecycle states only — not Quality Flow run states. */

export const ORCHESTRATION_KERNEL_STATES = [
  "created",
  "initialising",
  "ready",
  "paused",
  "stopping",
  "stopped",
  "failed",
] as const;

export type OrchestrationKernelState = (typeof ORCHESTRATION_KERNEL_STATES)[number];

export interface OrchestrationKernelSnapshot {
  readonly orchestrationId: string;
  readonly state: OrchestrationKernelState;
  readonly version: string;
  readonly programme: string;
  readonly slice: string;
  readonly updatedAt: string;
  readonly failureReason?: string;
}
