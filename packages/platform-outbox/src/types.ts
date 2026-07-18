/**
 * Platform outbox domain types (PCv2-02).
 */

export const OUTBOX_STATUSES = [
  "pending",
  "processing",
  "published",
  "failed",
  "retrying",
  "dead-letter",
] as const;

export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export type OutboxEvent = {
  readonly outboxEventId: string;
  readonly tenantId: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly status: OutboxStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextAttemptAt?: string;
  readonly lastError?: string;
  readonly correlationId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
};

export type RetryPolicy = {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly multiplier: number;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 1_000,
  maxDelayMs: 60_000,
  multiplier: 2,
};

export type BatchPolicy = {
  readonly batchSize: number;
};

export const DEFAULT_BATCH_POLICY: BatchPolicy = {
  batchSize: 25,
};

export type OutboxHandlerResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string; readonly permanent?: boolean };

export type OutboxHandler = {
  readonly name: string;
  handle(event: OutboxEvent): Promise<OutboxHandlerResult>;
};

export type OutboxDrainResult = {
  readonly claimed: number;
  readonly published: number;
  readonly failed: number;
  readonly deadLetter: number;
};

export type OutboxDiagnostics = {
  readonly version: string;
  readonly pending: number;
  readonly processing: number;
  readonly published: number;
  readonly failed: number;
  readonly retrying: number;
  readonly deadLetter: number;
};

export type ReplayFilter = {
  readonly outboxEventId?: string;
  readonly tenantId?: string;
  readonly status?: Extract<OutboxStatus, "published" | "dead-letter" | "failed">;
  readonly limit?: number;
};
