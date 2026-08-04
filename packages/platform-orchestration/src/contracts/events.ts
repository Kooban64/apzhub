/** Kernel + trigger events — Quality Flow execution events arrive later. */

export const ORCHESTRATION_KERNEL_EVENT_TYPES = {
  kernelCreated: "orchestration.kernel.created",
  kernelReady: "orchestration.kernel.ready",
  kernelPaused: "orchestration.kernel.paused",
  kernelStopped: "orchestration.kernel.stopped",
  kernelFailed: "orchestration.kernel.failed",
  capabilityRegistered: "orchestration.capability.registered",
  contractRegistered: "orchestration.contract.registered",
} as const;

export const TRIGGER_EVENT_TYPES = {
  received: "orchestration.trigger.received",
  ignored: "orchestration.trigger.ignored",
  routed: "orchestration.trigger.routed",
  rejected: "orchestration.trigger.rejected",
} as const;

export type OrchestrationKernelEventType =
  (typeof ORCHESTRATION_KERNEL_EVENT_TYPES)[keyof typeof ORCHESTRATION_KERNEL_EVENT_TYPES];

export type TriggerEventType =
  (typeof TRIGGER_EVENT_TYPES)[keyof typeof TRIGGER_EVENT_TYPES];

export type OrchestrationEventType = OrchestrationKernelEventType | TriggerEventType;

export interface OrchestrationKernelEvent {
  readonly type: OrchestrationEventType;
  readonly occurredAt: string;
  readonly orchestrationId: string;
  readonly correlationId: string;
  readonly tenantId?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export type OrchestrationEventPublisher = (
  event: OrchestrationKernelEvent,
) => void | Promise<void>;
