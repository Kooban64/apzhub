/**
 * Platform Processing domain types — APZQEP-120-S09.
 * Engine knows HOW to execute; never WHY the work exists.
 */

export const PROCESSING_STATUSES = [
  "pending",
  "reserved",
  "leased",
  "processing",
  "acknowledged",
  "retry_scheduled",
  "failed",
  "dead_letter_ready",
  "cancelled",
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

/** Owner-facing processing lifecycle (Processing Contract). */
export const PROCESSING_LIFECYCLE_STATES = [
  "Event",
  "Reserved",
  "Leased",
  "Executing",
  "Acknowledged",
  "Retry",
  "DeadLetter",
  "Cancelled",
] as const;

export type ProcessingLifecycleState = (typeof PROCESSING_LIFECYCLE_STATES)[number];

export type ProcessingWorkItem = {
  readonly workItemId: string;
  readonly tenantId: string;
  /** Opaque capability / event type key used for processor lookup. */
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly status: ProcessingStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly idempotencyKey: string;
  readonly correlationId?: string;
  readonly sourceOutboxEventId?: string;
  readonly reservedBy?: string;
  readonly leasedBy?: string;
  readonly leaseExpiresAt?: string;
  readonly nextAttemptAt?: string;
  readonly lastError?: string;
  readonly processingTimeoutMs: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly acknowledgedAt?: string;
};

export type ProcessingResultOutcome =
  "acknowledged" | "retry" | "dead_letter" | "terminal_failure";

export type ProcessingResult = {
  readonly outcome: ProcessingResultOutcome;
  readonly message?: string;
  readonly retryable?: boolean;
  readonly permanent?: boolean;
  readonly metadata?: Record<string, unknown>;
};

export type ProcessingContext = {
  readonly workItemId: string;
  readonly tenantId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly attemptCount: number;
  readonly correlationId?: string;
  readonly idempotencyKey: string;
  readonly workerId: string;
  readonly leasedUntil: string;
  readonly now: string;
};

export type RetryPolicy = {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly multiplier: number;
};

export const DEFAULT_PROCESSING_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 1_000,
  maxDelayMs: 60_000,
  multiplier: 2,
};

export type LeasePolicy = {
  readonly leaseTtlMs: number;
  readonly processingTimeoutMs: number;
};

export const DEFAULT_LEASE_POLICY: LeasePolicy = {
  leaseTtlMs: 30_000,
  processingTimeoutMs: 25_000,
};

export type SchedulerPolicy = {
  readonly batchSize: number;
};

export const DEFAULT_SCHEDULER_POLICY: SchedulerPolicy = {
  batchSize: 25,
};

export type FailureClass = "transient" | "permanent" | "timeout" | "poison" | "unknown";

export type ProcessingAttemptRecord = {
  readonly workItemId: string;
  readonly processorId: string;
  readonly workerId: string;
  readonly attempt: number;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly durationMs?: number;
  readonly outcome: ProcessingResultOutcome | "lease_expired" | "no_processor";
  readonly failureClass?: FailureClass;
  readonly message?: string;
};

export type ProcessingDiagnostics = {
  readonly version: string;
  readonly pending: number;
  readonly reserved: number;
  readonly leased: number;
  readonly processing: number;
  readonly acknowledged: number;
  readonly retryScheduled: number;
  readonly failed: number;
  readonly deadLetterReady: number;
  readonly cancelled: number;
};
