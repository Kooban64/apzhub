/** Kernel + trigger + Quality Flow lifecycle events (no capability execution). */

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

export const QUALITY_FLOW_EVENT_TYPES = {
  definitionRegistered: "orchestration.quality_flow.definition_registered",
  definitionVersioned: "orchestration.quality_flow.definition_versioned",
  instanceCreated: "orchestration.quality_flow.instance_created",
  stateTransitioned: "orchestration.quality_flow.state_transitioned",
  instancePaused: "orchestration.quality_flow.instance_paused",
  instanceResumed: "orchestration.quality_flow.instance_resumed",
} as const;

export const IMPACT_CORRELATION_EVENT_TYPES = {
  created: "orchestration.impact_correlation.created",
} as const;

export const POLICY_SELECTION_EVENT_TYPES = {
  decisionProduced: "orchestration.policy_selection.decision_produced",
} as const;

export const GOVERNANCE_EVENT_TYPES = {
  decisionProduced: "orchestration.governance.decision_produced",
} as const;

export const APPROVAL_EVENT_TYPES = {
  bundleCreated: "orchestration.approval.bundle_created",
  decisionSubmitted: "orchestration.approval.decision_submitted",
} as const;

export const DECISION_EVENT_TYPES = {
  packageCreated: "orchestration.decision.package_created",
} as const;

export type OrchestrationKernelEventType =
  (typeof ORCHESTRATION_KERNEL_EVENT_TYPES)[keyof typeof ORCHESTRATION_KERNEL_EVENT_TYPES];

export type TriggerEventType =
  (typeof TRIGGER_EVENT_TYPES)[keyof typeof TRIGGER_EVENT_TYPES];

export type QualityFlowEventType =
  (typeof QUALITY_FLOW_EVENT_TYPES)[keyof typeof QUALITY_FLOW_EVENT_TYPES];

export type ImpactCorrelationEventType =
  (typeof IMPACT_CORRELATION_EVENT_TYPES)[keyof typeof IMPACT_CORRELATION_EVENT_TYPES];

export type PolicySelectionEventType =
  (typeof POLICY_SELECTION_EVENT_TYPES)[keyof typeof POLICY_SELECTION_EVENT_TYPES];

export type GovernanceEventType =
  (typeof GOVERNANCE_EVENT_TYPES)[keyof typeof GOVERNANCE_EVENT_TYPES];

export type ApprovalEventType =
  (typeof APPROVAL_EVENT_TYPES)[keyof typeof APPROVAL_EVENT_TYPES];

export type DecisionEventType =
  (typeof DECISION_EVENT_TYPES)[keyof typeof DECISION_EVENT_TYPES];

export type OrchestrationEventType =
  | OrchestrationKernelEventType
  | TriggerEventType
  | QualityFlowEventType
  | ImpactCorrelationEventType
  | PolicySelectionEventType
  | GovernanceEventType
  | ApprovalEventType
  | DecisionEventType;

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
