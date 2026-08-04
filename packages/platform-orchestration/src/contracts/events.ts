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

/** Past-tense automation coordination facts (QO-011) — never commands. */
export const AUTOMATION_COORDINATION_EVENT_TYPES = {
  coordinationCreated: "automation.coordination.created",
  coordinationUpdated: "automation.coordination.updated",
  coordinationCompleted: "automation.coordination.completed",
  intentIdentified: "automation.intent.identified",
} as const;

/** Past-tense source change coordination facts (QO-012) — never commands. */
export const SOURCE_CHANGE_EVENT_TYPES = {
  changeAssociated: "source.change.associated",
  packageCreated: "source.package.created",
  packageUpdated: "source.package.updated",
  identityNormalized: "source.identity.normalized",
} as const;

/** Past-tense quality intelligence enrichment facts (QO-013) — never commands. */
export const ENRICHMENT_EVENT_TYPES = {
  enrichmentCreated: "quality.enrichment.created",
  enrichmentCompleted: "quality.enrichment.completed",
  insightAttached: "advisory.insight.attached",
  packageCreated: "enrichment.package.created",
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

export type AutomationCoordinationEventType =
  (typeof AUTOMATION_COORDINATION_EVENT_TYPES)[keyof typeof AUTOMATION_COORDINATION_EVENT_TYPES];

export type SourceChangeEventType =
  (typeof SOURCE_CHANGE_EVENT_TYPES)[keyof typeof SOURCE_CHANGE_EVENT_TYPES];

export type EnrichmentEventType =
  (typeof ENRICHMENT_EVENT_TYPES)[keyof typeof ENRICHMENT_EVENT_TYPES];

export type OrchestrationEventType =
  | OrchestrationKernelEventType
  | TriggerEventType
  | QualityFlowEventType
  | ImpactCorrelationEventType
  | PolicySelectionEventType
  | GovernanceEventType
  | ApprovalEventType
  | DecisionEventType
  | AutomationCoordinationEventType
  | SourceChangeEventType
  | EnrichmentEventType;

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
