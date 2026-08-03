import type { AutomationProviderId, ExecutionLifecycleState } from "./execution";

/** Past-tense platform automation events (provider-neutral). */
export const AUTOMATION_EVENT_TYPES = {
  executionQueued: "platform.automation.execution.queued",
  executionPreparing: "platform.automation.execution.preparing",
  executionStarted: "platform.automation.execution.started",
  executionRetrying: "platform.automation.execution.retrying",
  executionCompleted: "platform.automation.execution.completed",
  executionFailed: "platform.automation.execution.failed",
  executionCancelled: "platform.automation.execution.cancelled",
  executionTimedOut: "platform.automation.execution.timed_out",
  executionInterrupted: "platform.automation.execution.interrupted",
  evidencePublished: "platform.automation.evidence.published",
  providerRegistered: "platform.automation.provider.registered",
} as const;

export type AutomationEventType =
  (typeof AUTOMATION_EVENT_TYPES)[keyof typeof AUTOMATION_EVENT_TYPES];

export interface AutomationDomainEvent {
  readonly type: AutomationEventType;
  readonly occurredAt: string;
  readonly executionId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly providerId: AutomationProviderId;
  readonly state: ExecutionLifecycleState;
  readonly attempt?: number;
  readonly payload?: Readonly<Record<string, string | number | boolean>>;
}

export type AutomationEventPublisher = (
  event: AutomationDomainEvent,
) => void | Promise<void>;
