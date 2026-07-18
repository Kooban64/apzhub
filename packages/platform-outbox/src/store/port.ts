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

  /** Test / seed helper — insert a pending event. */
  insert?(event: OutboxEvent): Promise<void>;
};
