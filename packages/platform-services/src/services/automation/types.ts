/**
 * Cross-Product Automation Foundation contracts (APZHUB-1.1-004).
 * Platform-owned registration + execution — not product-specific engines.
 */

import type { DomainEventEnvelope } from "../../events/domain-event-publisher";

/** Platform action kinds supported by the foundation. */
export type AutomationActionKind = "platform.handler" | "workflow.trigger";

export type AutomationExecutionStatus = "succeeded" | "skipped" | "failed" | "deferred";

export interface AutomationRegistration {
  readonly id: string;
  /** Stable unique key (idempotent upsert). */
  readonly key: string;
  readonly eventPattern: string;
  readonly actionKind: AutomationActionKind;
  /** Handler id (`platform.handler`) or workflow id (`workflow.trigger`). */
  readonly actionRef: string;
  readonly enabled: boolean;
  readonly tenantId?: string;
  readonly description?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterAutomationInput {
  readonly key: string;
  readonly eventPattern: string;
  readonly actionKind: AutomationActionKind;
  readonly actionRef: string;
  readonly enabled?: boolean;
  readonly tenantId?: string;
  readonly description?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface AutomationExecutionRecord {
  readonly id: string;
  readonly registrationId: string;
  readonly registrationKey: string;
  readonly eventId: string;
  readonly envelopeId: string;
  readonly status: AutomationExecutionStatus;
  readonly reason?: string;
  readonly correlationId: string;
  readonly tenantId?: string;
  readonly executedAt: string;
  readonly details?: Readonly<Record<string, string>>;
}

export interface AutomationHandlerContext {
  readonly envelope: DomainEventEnvelope;
  readonly registration: AutomationRegistration;
}

export type AutomationHandler = (
  context: AutomationHandlerContext,
) => Promise<AutomationHandlerResult> | AutomationHandlerResult;

export interface AutomationHandlerResult {
  readonly status: Exclude<AutomationExecutionStatus, "skipped">;
  readonly reason?: string;
  readonly details?: Readonly<Record<string, string>>;
}

/** Minimal bus subscribe surface — adapter-compatible with ENF EventBus. */
export interface AutomationEventBus {
  subscribe(options: {
    readonly eventPattern: string;
    readonly handler: (envelope: DomainEventEnvelope) => void | Promise<void>;
  }): string;
}

/** Optional Workflow event-trigger source (metadata bindings; execute remains gated). */
export interface WorkflowEventTriggerBindingView {
  readonly triggerId: string;
  readonly workflowId: string;
  readonly eventType: string;
  readonly enabled: boolean;
  readonly tenantId: string;
  readonly versionId?: string;
}

export interface WorkflowEventTriggerSource {
  listEnabledEventTriggers(input?: {
    readonly tenantId?: string;
  }): Promise<readonly WorkflowEventTriggerBindingView[]>;
}
