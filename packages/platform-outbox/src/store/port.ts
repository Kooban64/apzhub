import type { OutboxEvent, OutboxStatus, ReplayFilter } from "../types";

export type OutboxStore = {
  /** Claim a batch of claimable rows (pending / retrying with due nextAttemptAt). */
  claimBatch(options: {
    readonly limit: number;
    readonly now: string;
  }): Promise<readonly OutboxEvent[]>;

  markPublished(options: {
    readonly outboxEventId: string;
    readonly now: string;
  }): Promise<void>;

  markFailed(options: {
    readonly outboxEventId: string;
    readonly now: string;
    readonly lastError: string;
    readonly nextAttemptAt: string | null;
    readonly to: Extract<OutboxStatus, "failed" | "retrying" | "dead-letter">;
    readonly attemptCount: number;
  }): Promise<void>;

  replay(filter: ReplayFilter & { readonly now: string }): Promise<number>;

  countByStatus(): Promise<Record<OutboxStatus, number>>;

  /**
   * Persist a pending outbox event (Application Services / product adapters).
   * Idempotent when the same outboxEventId already exists.
   */
  enqueue(event: OutboxEvent): Promise<{ readonly duplicate?: boolean } | void>;

  /** @deprecated Prefer enqueue — retained for older call sites. */
  insert?(event: OutboxEvent): Promise<void>;
};
