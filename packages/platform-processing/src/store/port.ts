import type { ProcessingStatus, ProcessingWorkItem } from "../types";

export type ProcessingStore = {
  enqueue(item: ProcessingWorkItem): Promise<{ readonly duplicate?: boolean } | void>;

  /** Reserve claimable pending / due retry items for a worker. */
  reserveBatch(options: {
    readonly workerId: string;
    readonly limit: number;
    readonly now: string;
  }): Promise<readonly ProcessingWorkItem[]>;

  /** Convert reserved → leased with expiry. */
  acquireLease(options: {
    readonly workItemId: string;
    readonly workerId: string;
    readonly leaseExpiresAt: string;
    readonly now: string;
  }): Promise<ProcessingWorkItem | undefined>;

  /** Heartbeat / extend lease while processing. */
  renewLease(options: {
    readonly workItemId: string;
    readonly workerId: string;
    readonly leaseExpiresAt: string;
    readonly now: string;
  }): Promise<boolean>;

  markProcessing(options: {
    readonly workItemId: string;
    readonly workerId: string;
    readonly now: string;
  }): Promise<void>;

  markAcknowledged(options: {
    readonly workItemId: string;
    readonly now: string;
  }): Promise<void>;

  markRetry(options: {
    readonly workItemId: string;
    readonly now: string;
    readonly nextAttemptAt: string;
    readonly lastError: string;
    readonly attemptCount: number;
  }): Promise<void>;

  markFailed(options: {
    readonly workItemId: string;
    readonly now: string;
    readonly lastError: string;
    readonly attemptCount: number;
  }): Promise<void>;

  markDeadLetter(options: {
    readonly workItemId: string;
    readonly now: string;
    readonly lastError: string;
    readonly attemptCount: number;
  }): Promise<void>;

  /** Reclaim expired leases / stuck processing → retry_scheduled or pending. */
  reclaimExpired(options: {
    readonly now: string;
    readonly limit?: number;
  }): Promise<number>;

  /** Replay terminal items back to pending. */
  replay(options: {
    readonly now: string;
    readonly workItemId?: string;
    readonly tenantId?: string;
    readonly status?: Extract<
      ProcessingStatus,
      "acknowledged" | "dead_letter_ready" | "failed"
    >;
    readonly limit?: number;
  }): Promise<number>;

  cancel(options: {
    readonly workItemId: string;
    readonly now: string;
  }): Promise<boolean>;

  countByStatus(): Promise<Record<ProcessingStatus, number>>;

  get(workItemId: string): Promise<ProcessingWorkItem | undefined>;
};
