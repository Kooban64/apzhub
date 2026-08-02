/**
 * Outbox worker — drains claimed events through handlers (PCv2-02 / S08).
 * Must run outside HTTP request handlers.
 */

import type {
  DeadLetterPreparationHook,
  DeliveryObservabilityHooks,
} from "./delivery/observability";
import { isPermanentFailureMessage, nextAttemptIso, shouldRetry } from "./retry-policy";
import type { OutboxStore } from "./store/port";
import type {
  BatchPolicy,
  DeliveryAttemptRecord,
  OutboxDiagnostics,
  OutboxDrainResult,
  OutboxHandler,
  ReplayFilter,
  RetryPolicy,
} from "./types";
import { DEFAULT_BATCH_POLICY, DEFAULT_RETRY_POLICY } from "./types";
import { PLATFORM_OUTBOX_VERSION } from "./version";

export type OutboxWorker = {
  processBatch(): Promise<OutboxDrainResult>;
  replay(filter?: ReplayFilter): Promise<number>;
  diagnostics(): Promise<OutboxDiagnostics>;
  readonly store: OutboxStore;
  readonly handlers: readonly OutboxHandler[];
};

export type CreateOutboxWorkerOptions = {
  readonly store: OutboxStore;
  readonly handlers: readonly OutboxHandler[];
  readonly retryPolicy?: RetryPolicy;
  readonly batchPolicy?: BatchPolicy;
  readonly now?: () => string;
  readonly observability?: DeliveryObservabilityHooks;
  readonly onDeadLetterReady?: DeadLetterPreparationHook;
};

export function createOutboxWorker(options: CreateOutboxWorkerOptions): OutboxWorker {
  const now = options.now ?? (() => new Date().toISOString());
  const retryPolicy = options.retryPolicy ?? DEFAULT_RETRY_POLICY;
  const batchPolicy = options.batchPolicy ?? DEFAULT_BATCH_POLICY;
  const handlers = options.handlers;
  const obs = options.observability;

  if (handlers.length === 0) {
    throw new Error("OutboxWorker requires at least one handler");
  }

  function recordAttempt(partial: DeliveryAttemptRecord): void {
    obs?.onAttempt?.(partial);
  }

  return {
    store: options.store,
    handlers,

    async processBatch() {
      const claimed = await options.store.claimBatch({
        limit: batchPolicy.batchSize,
        now: now(),
      });

      let published = 0;
      let failed = 0;
      let deadLetter = 0;

      for (const event of claimed) {
        const startedAt = now();
        const startedMs = Date.parse(startedAt);
        let lastError: string | undefined;
        let permanent = false;
        let allOk = true;

        for (const handler of handlers) {
          const result = await handler.handle(event);
          if (!result.ok) {
            allOk = false;
            lastError = `${handler.name}: ${result.message}`;
            permanent =
              result.permanent === true || isPermanentFailureMessage(result.message);
            break;
          }
        }

        const finishedAt = now();
        const durationMs = Math.max(0, Date.parse(finishedAt) - startedMs);

        if (allOk) {
          await options.store.markPublished({
            outboxEventId: event.outboxEventId,
            now: finishedAt,
          });
          published += 1;
          recordAttempt({
            attempt: event.attemptCount,
            startedAt,
            finishedAt,
            durationMs,
            outcome: "delivered",
          });
          obs?.onTerminalState?.({
            outboxEventId: event.outboxEventId,
            state: "Delivered",
            retryCount: event.attemptCount,
            lastAttemptAt: finishedAt,
          });
          continue;
        }

        const errorMessage = lastError ?? "Handler failed";
        const attemptCount = event.attemptCount;

        await options.store.markFailed({
          outboxEventId: event.outboxEventId,
          now: finishedAt,
          lastError: errorMessage,
          nextAttemptAt: null,
          to: "failed",
          attemptCount,
        });

        if (!shouldRetry(attemptCount, permanent, retryPolicy)) {
          await options.store.markFailed({
            outboxEventId: event.outboxEventId,
            now: finishedAt,
            lastError: errorMessage,
            nextAttemptAt: null,
            to: "dead-letter",
            attemptCount,
          });
          deadLetter += 1;
          recordAttempt({
            attempt: attemptCount,
            startedAt,
            finishedAt,
            durationMs,
            outcome: "dead-letter",
            failureReason: errorMessage,
          });
          options.onDeadLetterReady?.({
            event,
            reason: errorMessage,
            attemptCount,
          });
          obs?.onTerminalState?.({
            outboxEventId: event.outboxEventId,
            state: "DeadLetterReady",
            retryCount: attemptCount,
            failureReason: errorMessage,
            lastAttemptAt: finishedAt,
          });
        } else {
          const nextAttemptAt = nextAttemptIso(attemptCount, now, retryPolicy);
          await options.store.markFailed({
            outboxEventId: event.outboxEventId,
            now: finishedAt,
            lastError: errorMessage,
            nextAttemptAt,
            to: "retrying",
            attemptCount,
          });
          failed += 1;
          recordAttempt({
            attempt: attemptCount,
            startedAt,
            finishedAt,
            durationMs,
            outcome: "retry-scheduled",
            failureReason: errorMessage,
          });
          obs?.onTerminalState?.({
            outboxEventId: event.outboxEventId,
            state: "RetryScheduled",
            retryCount: attemptCount,
            failureReason: errorMessage,
            lastAttemptAt: finishedAt,
            nextAttemptAt,
          });
        }
      }

      return {
        claimed: claimed.length,
        published,
        failed,
        deadLetter,
      };
    },

    async replay(filter = {}) {
      return options.store.replay({ ...filter, now: now() });
    },

    async diagnostics() {
      const counts = await options.store.countByStatus();
      return {
        version: PLATFORM_OUTBOX_VERSION,
        pending: counts.pending,
        processing: counts.processing,
        published: counts.published,
        failed: counts.failed,
        retrying: counts.retrying,
        deadLetter: counts["dead-letter"],
        cancelled: counts.cancelled ?? 0,
      };
    },
  };
}
