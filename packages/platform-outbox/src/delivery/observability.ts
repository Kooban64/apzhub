/**
 * Delivery observability + dead-letter preparation hooks (metrics only).
 */

import type { DeliveryAttemptRecord, OutboxEvent } from "../types";

export type DeliveryObservabilityHooks = {
  /** Metrics: each delivery attempt outcome. */
  readonly onAttempt?: (record: DeliveryAttemptRecord) => void;
  /** Metrics: terminal / lifecycle counters. */
  readonly onTerminalState?: (input: {
    readonly outboxEventId: string;
    readonly state:
      "Delivered" | "Failed" | "RetryScheduled" | "DeadLetterReady" | "Cancelled";
    readonly retryCount: number;
    readonly failureReason?: string;
    readonly lastAttemptAt?: string;
    readonly nextAttemptAt?: string;
  }) => void;
};

/** Called when an event is prepared for dead-letter (no DLQ product in S08). */
export type DeadLetterPreparationHook = (input: {
  readonly event: OutboxEvent;
  readonly reason: string;
  readonly attemptCount: number;
}) => void;

export type InMemoryDeliveryAudit = {
  readonly attempts: DeliveryAttemptRecord[];
  readonly terminals: Array<{
    readonly outboxEventId: string;
    readonly state: string;
    readonly retryCount: number;
  }>;
  readonly deadLetterReady: Array<{
    readonly outboxEventId: string;
    readonly reason: string;
  }>;
  readonly hooks: DeliveryObservabilityHooks;
  readonly onDeadLetterReady: DeadLetterPreparationHook;
};

export function createInMemoryDeliveryAudit(): InMemoryDeliveryAudit {
  const attempts: DeliveryAttemptRecord[] = [];
  const terminals: InMemoryDeliveryAudit["terminals"] = [];
  const deadLetterReady: InMemoryDeliveryAudit["deadLetterReady"] = [];

  return {
    attempts,
    terminals,
    deadLetterReady,
    hooks: {
      onAttempt(record) {
        attempts.push(record);
      },
      onTerminalState(input) {
        terminals.push({
          outboxEventId: input.outboxEventId,
          state: input.state,
          retryCount: input.retryCount,
        });
      },
    },
    onDeadLetterReady(input) {
      deadLetterReady.push({
        outboxEventId: input.event.outboxEventId,
        reason: input.reason,
      });
    },
  };
}
