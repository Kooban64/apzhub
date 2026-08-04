/** Kernel events only — Quality Flow / peer events arrive later. */

export const ORCHESTRATION_KERNEL_EVENT_TYPES = {
  kernelCreated: "orchestration.kernel.created",
  kernelReady: "orchestration.kernel.ready",
  kernelPaused: "orchestration.kernel.paused",
  kernelStopped: "orchestration.kernel.stopped",
  kernelFailed: "orchestration.kernel.failed",
  capabilityRegistered: "orchestration.capability.registered",
  contractRegistered: "orchestration.contract.registered",
} as const;

export type OrchestrationKernelEventType =
  (typeof ORCHESTRATION_KERNEL_EVENT_TYPES)[keyof typeof ORCHESTRATION_KERNEL_EVENT_TYPES];

export interface OrchestrationKernelEvent {
  readonly type: OrchestrationKernelEventType;
  readonly occurredAt: string;
  readonly orchestrationId: string;
  readonly correlationId: string;
  readonly tenantId?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export type OrchestrationEventPublisher = (
  event: OrchestrationKernelEvent,
) => void | Promise<void>;
