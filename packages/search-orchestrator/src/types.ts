/**
 * Orchestration domain types (APZSEARCH-016) — metadata of publication work only.
 */

export const PUBLICATION_OPERATIONS = [
  "publish",
  "update",
  "remove",
  "lifecycle",
] as const;

export type PublicationOperation = (typeof PUBLICATION_OPERATIONS)[number];

export const PUBLICATION_STATUSES = [
  "queued",
  "publishing",
  "published",
  "failed",
  "retrying",
  "dead-letter",
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export type PublicationProductId =
  "projects" | "support" | "documents" | "testing" | "reporting" | (string & {});

export type PublicationJournalEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly entityId: string;
  readonly entityType: string;
  readonly productId: PublicationProductId;
  readonly operation: PublicationOperation;
  readonly payloadJson: string;
  readonly payloadHash: string;
  readonly status: PublicationStatus;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextAttemptAt?: string;
  readonly lastError?: string;
  readonly correlationId: string;
  readonly actorUserId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
};

export type EnqueuePublicationInput = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly entityId: string;
  readonly entityType: string;
  readonly productId: PublicationProductId;
  readonly operation: PublicationOperation;
  /** Canonical entity input / draft JSON-serialisable payload */
  readonly payload: unknown;
  readonly correlationId: string;
  readonly actorUserId?: string;
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
  readonly maxBatchSize: number;
};

export const DEFAULT_BATCH_POLICY: BatchPolicy = {
  maxBatchSize: 25,
};

export type OrchestrationDiagnostics = {
  readonly enabled: boolean;
  readonly frameworkVersion: string;
  readonly queueDepth: number;
  readonly retryingCount: number;
  readonly failedCount: number;
  readonly deadLetterCount: number;
  readonly publishedCount: number;
  readonly throughputPublished: number;
  readonly backlog: number;
};
