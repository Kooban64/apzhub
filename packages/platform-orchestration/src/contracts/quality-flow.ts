/**
 * Enterprise Quality Flow contracts (QO-004).
 *
 * Definitions are immutable. Instances are mutable runtime state.
 * Engine coordinates lifecycle only — never executes capabilities.
 */

import type { QualityFlowStage } from "./capability-catalogue";

export const QUALITY_FLOW_STATES = [
  "registered",
  "ready",
  "triggered",
  "impact_analysed",
  "selection_complete",
  "capability_coordination",
  "awaiting_gates",
  "awaiting_approval",
  "recommendation_ready",
  "completed",
  "cancelled",
  "failed",
  "rejected",
  "superseded",
  "timed_out",
] as const;

export type QualityFlowState = (typeof QUALITY_FLOW_STATES)[number];

export const QUALITY_FLOW_TERMINAL_STATES = [
  "completed",
  "cancelled",
  "failed",
  "rejected",
  "superseded",
  "timed_out",
] as const;

export type QualityFlowTerminalState = (typeof QUALITY_FLOW_TERMINAL_STATES)[number];

export type QualityFlowDefinitionStatus = "draft" | "active" | "retired";

/** Immutable Quality Flow definition — never mutated after registration. */
export interface QualityFlowDefinition {
  readonly flowId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly owner: string;
  readonly supportedTriggerTypes: readonly string[];
  readonly supportedCapabilityStages: readonly QualityFlowStage[];
  readonly supportedPolicies: readonly string[];
  readonly supportedGates: readonly string[];
  readonly lifecycleVersion: string;
  readonly documentationRef: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly status: QualityFlowDefinitionStatus;
}

export interface QualityFlowDefinitionInput {
  readonly flowId: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly owner: string;
  readonly supportedTriggerTypes?: readonly string[];
  readonly supportedCapabilityStages?: readonly QualityFlowStage[];
  readonly supportedPolicies?: readonly string[];
  readonly supportedGates?: readonly string[];
  readonly lifecycleVersion?: string;
  readonly documentationRef: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly status?: QualityFlowDefinitionStatus;
}

/** Append-only transition history entry. */
export interface QualityFlowTransitionRecord {
  readonly transitionId: string;
  readonly fromState: QualityFlowState;
  readonly toState: QualityFlowState;
  readonly timestamp: string;
  readonly actor: string;
  readonly reason: string;
  readonly correlationId: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Mutable runtime instance of an immutable definition version. */
export interface QualityFlowInstance {
  readonly instanceId: string;
  readonly flowDefinitionId: string;
  readonly definitionVersion: string;
  readonly triggerId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly qualityFlowId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly currentState: QualityFlowState;
  readonly previousState?: QualityFlowState;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly paused: boolean;
  /** Last valid state for recovery resume/retry. */
  readonly recoveryPoint?: QualityFlowState;
  readonly metadata: Readonly<Record<string, string>>;
  readonly history: readonly QualityFlowTransitionRecord[];
}

export interface CreateQualityFlowInstanceInput {
  readonly flowId: string;
  readonly definitionVersion?: string;
  readonly triggerId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actor?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface QualityFlowTransitionRequest {
  readonly toState: QualityFlowState;
  readonly actor: string;
  readonly reason: string;
  readonly correlationId: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export function isTerminalQualityFlowState(state: QualityFlowState): boolean {
  return (QUALITY_FLOW_TERMINAL_STATES as readonly string[]).includes(state);
}
