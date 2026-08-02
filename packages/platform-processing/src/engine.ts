/**
 * Reliable Event Processing Engine — APZQEP-120-S09.
 * Knows HOW to execute; never WHY the work exists.
 */

import type { EventProcessor } from "./processor/contract";
import type { ProcessorRegistry } from "./processor/registry";
import {
  classifyFailure,
  isPoisonCandidate,
  nextAttemptIso,
  shouldRetry,
} from "./retry";
import type { ProcessingStore } from "./store/port";
import type {
  LeasePolicy,
  ProcessingContext,
  ProcessingDiagnostics,
  ProcessingResult,
  ProcessingWorkItem,
  RetryPolicy,
  SchedulerPolicy,
} from "./types";
import {
  DEFAULT_LEASE_POLICY,
  DEFAULT_PROCESSING_RETRY_POLICY,
  DEFAULT_SCHEDULER_POLICY,
} from "./types";
import type { ProcessingObservabilityHooks } from "./metrics";
import { PLATFORM_PROCESSING_VERSION } from "./version";

export type ProcessBatchResult = {
  readonly reserved: number;
  readonly processed: number;
  readonly acknowledged: number;
  readonly retried: number;
  readonly deadLetter: number;
  readonly skipped: number;
};

export type ProcessingEngine = {
  readonly store: ProcessingStore;
  readonly registry: ProcessorRegistry;
  readonly workerId: string;
  processBatch(): Promise<ProcessBatchResult>;
  reclaimExpired(): Promise<number>;
  replay(filter?: {
    readonly workItemId?: string;
    readonly tenantId?: string;
    readonly status?: "acknowledged" | "dead_letter_ready" | "failed";
    readonly limit?: number;
  }): Promise<number>;
  diagnostics(): Promise<ProcessingDiagnostics>;
};

export type CreateProcessingEngineOptions = {
  readonly store: ProcessingStore;
  readonly registry: ProcessorRegistry;
  readonly workerId: string;
  readonly retryPolicy?: RetryPolicy;
  readonly leasePolicy?: LeasePolicy;
  readonly schedulerPolicy?: SchedulerPolicy;
  readonly now?: () => string;
  readonly observability?: ProcessingObservabilityHooks;
};

function leaseExpiryIso(now: string, ttlMs: number): string {
  return new Date(Date.parse(now) + ttlMs).toISOString();
}

async function executeWithTimeout(
  promise: Promise<ProcessingResult>,
  timeoutMs: number,
): Promise<ProcessingResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<ProcessingResult>((resolve) => {
        timer = setTimeout(
          () =>
            resolve({
              outcome: "retry",
              message: "PROCESSING_TIMEOUT",
              retryable: true,
            }),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function toContext(
  item: ProcessingWorkItem,
  workerId: string,
  leasedUntil: string,
  now: string,
): ProcessingContext {
  return {
    workItemId: item.workItemId,
    tenantId: item.tenantId,
    eventType: item.eventType,
    payload: item.payload,
    attemptCount: item.attemptCount,
    ...(item.correlationId ? { correlationId: item.correlationId } : {}),
    idempotencyKey: item.idempotencyKey,
    workerId,
    leasedUntil,
    now,
  };
}

export function createProcessingEngine(
  options: CreateProcessingEngineOptions,
): ProcessingEngine {
  const now = options.now ?? (() => new Date().toISOString());
  const retryPolicy = options.retryPolicy ?? DEFAULT_PROCESSING_RETRY_POLICY;
  const leasePolicy = options.leasePolicy ?? DEFAULT_LEASE_POLICY;
  const schedulerPolicy = options.schedulerPolicy ?? DEFAULT_SCHEDULER_POLICY;
  const obs = options.observability;
  const workerId = options.workerId;

  if (!workerId.trim()) {
    throw new Error("ProcessingEngine requires a non-empty workerId");
  }

  async function handleResult(
    item: ProcessingWorkItem,
    processor: EventProcessor,
    result: ProcessingResult,
    startedAt: string,
    finishedAt: string,
  ): Promise<"acknowledged" | "retried" | "deadLetter"> {
    const durationMs = Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt));
    const failureClass = classifyFailure(result);
    const permanent =
      result.permanent === true ||
      result.outcome === "terminal_failure" ||
      result.outcome === "dead_letter" ||
      failureClass === "permanent" ||
      failureClass === "poison";

    if (result.outcome === "acknowledged") {
      await options.store.markAcknowledged({
        workItemId: item.workItemId,
        now: finishedAt,
      });
      obs?.onAttempt?.({
        workItemId: item.workItemId,
        processorId: processor.descriptor.processorId,
        workerId,
        attempt: item.attemptCount,
        startedAt,
        finishedAt,
        durationMs,
        outcome: "acknowledged",
      });
      return "acknowledged";
    }

    const message = result.message ?? result.outcome;
    const poison =
      result.outcome === "dead_letter" ||
      isPoisonCandidate(item.attemptCount, failureClass, retryPolicy);

    if (
      poison ||
      result.outcome === "dead_letter" ||
      result.outcome === "terminal_failure" ||
      !shouldRetry(item.attemptCount, permanent, retryPolicy)
    ) {
      await options.store.markDeadLetter({
        workItemId: item.workItemId,
        now: finishedAt,
        lastError: message,
        attemptCount: item.attemptCount,
      });
      obs?.onAttempt?.({
        workItemId: item.workItemId,
        processorId: processor.descriptor.processorId,
        workerId,
        attempt: item.attemptCount,
        startedAt,
        finishedAt,
        durationMs,
        outcome: "dead_letter",
        failureClass: poison ? "poison" : failureClass,
        message,
      });
      obs?.onDeadLetterReady?.({
        workItemId: item.workItemId,
        reason: message,
        attemptCount: item.attemptCount,
      });
      return "deadLetter";
    }

    const nextAttemptAt = nextAttemptIso(item.attemptCount, now, retryPolicy);
    await options.store.markRetry({
      workItemId: item.workItemId,
      now: finishedAt,
      nextAttemptAt,
      lastError: message,
      attemptCount: item.attemptCount,
    });
    obs?.onAttempt?.({
      workItemId: item.workItemId,
      processorId: processor.descriptor.processorId,
      workerId,
      attempt: item.attemptCount,
      startedAt,
      finishedAt,
      durationMs,
      outcome: "retry",
      failureClass,
      message,
    });
    return "retried";
  }

  return {
    store: options.store,
    registry: options.registry,
    workerId,

    async processBatch() {
      await options.store.reclaimExpired({ now: now() });

      const reserved = await options.store.reserveBatch({
        workerId,
        limit: schedulerPolicy.batchSize,
        now: now(),
      });

      let processed = 0;
      let acknowledged = 0;
      let retried = 0;
      let deadLetter = 0;
      let skipped = 0;

      for (const item of reserved) {
        const leaseExpiresAt = leaseExpiryIso(now(), leasePolicy.leaseTtlMs);
        const leased = await options.store.acquireLease({
          workItemId: item.workItemId,
          workerId,
          leaseExpiresAt,
          now: now(),
        });
        if (!leased) {
          skipped += 1;
          continue;
        }

        const processor = options.registry.resolve(item.eventType);
        const startedAt = now();

        if (!processor) {
          await options.store.markDeadLetter({
            workItemId: item.workItemId,
            now: startedAt,
            lastError: "NO_PROCESSOR",
            attemptCount: item.attemptCount,
          });
          obs?.onAttempt?.({
            workItemId: item.workItemId,
            processorId: "none",
            workerId,
            attempt: item.attemptCount,
            startedAt,
            finishedAt: startedAt,
            durationMs: 0,
            outcome: "no_processor",
            failureClass: "permanent",
            message: "NO_PROCESSOR",
          });
          obs?.onDeadLetterReady?.({
            workItemId: item.workItemId,
            reason: "NO_PROCESSOR",
            attemptCount: item.attemptCount,
          });
          deadLetter += 1;
          processed += 1;
          continue;
        }

        await options.store.markProcessing({
          workItemId: item.workItemId,
          workerId,
          now: startedAt,
        });

        let result: ProcessingResult;
        try {
          const timeoutMs = Math.min(
            item.processingTimeoutMs,
            leasePolicy.processingTimeoutMs,
          );
          result = await executeWithTimeout(
            processor.execute(toContext(leased, workerId, leaseExpiresAt, startedAt)),
            timeoutMs,
          );
        } catch (error) {
          result = {
            outcome: "retry",
            message: error instanceof Error ? error.message : "PROCESSOR_THREW",
            retryable: true,
          };
        }

        // Lease expiry check after execution
        const finishedAt = now();
        if (Date.parse(leaseExpiresAt) < Date.parse(finishedAt)) {
          await options.store.markRetry({
            workItemId: item.workItemId,
            now: finishedAt,
            nextAttemptAt: finishedAt,
            lastError: "LEASE_EXPIRED",
            attemptCount: item.attemptCount,
          });
          obs?.onAttempt?.({
            workItemId: item.workItemId,
            processorId: processor.descriptor.processorId,
            workerId,
            attempt: item.attemptCount,
            startedAt,
            finishedAt,
            durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
            outcome: "lease_expired",
            failureClass: "timeout",
            message: "LEASE_EXPIRED",
          });
          retried += 1;
          processed += 1;
          continue;
        }

        const branch = await handleResult(
          item,
          processor,
          result,
          startedAt,
          finishedAt,
        );
        if (branch === "acknowledged") acknowledged += 1;
        else if (branch === "retried") retried += 1;
        else deadLetter += 1;
        processed += 1;
      }

      return {
        reserved: reserved.length,
        processed,
        acknowledged,
        retried,
        deadLetter,
        skipped,
      };
    },

    async reclaimExpired() {
      return options.store.reclaimExpired({ now: now() });
    },

    async replay(filter = {}) {
      return options.store.replay({ ...filter, now: now() });
    },

    async diagnostics() {
      const counts = await options.store.countByStatus();
      return {
        version: PLATFORM_PROCESSING_VERSION,
        pending: counts.pending,
        reserved: counts.reserved,
        leased: counts.leased,
        processing: counts.processing,
        acknowledged: counts.acknowledged,
        retryScheduled: counts.retry_scheduled,
        failed: counts.failed,
        deadLetterReady: counts.dead_letter_ready,
        cancelled: counts.cancelled,
      };
    },
  };
}
