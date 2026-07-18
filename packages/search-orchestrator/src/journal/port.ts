import type {
  EnqueuePublicationInput,
  PublicationJournalEntry,
  PublicationStatus,
} from "../types";

export type PublicationJournalRepository = {
  enqueue(
    input: EnqueuePublicationInput & {
      readonly id: string;
      readonly payloadJson: string;
      readonly payloadHash: string;
      readonly maxAttempts: number;
      readonly now: string;
    },
  ): Promise<PublicationJournalEntry>;
  findById(id: string): Promise<PublicationJournalEntry | null>;
  findDuplicate(input: {
    readonly tenantId: string;
    readonly entityId: string;
    readonly operation: string;
    readonly payloadHash: string;
  }): Promise<PublicationJournalEntry | null>;
  claimBatch(input: {
    readonly limit: number;
    readonly now: string;
  }): Promise<readonly PublicationJournalEntry[]>;
  updateStatus(input: {
    readonly id: string;
    readonly from: PublicationStatus;
    readonly to: PublicationStatus;
    readonly now: string;
    readonly attemptCount?: number;
    readonly nextAttemptAt?: string | null;
    readonly lastError?: string | null;
    readonly publishedAt?: string | null;
  }): Promise<PublicationJournalEntry>;
  countByStatus(status: PublicationStatus): Promise<number>;
  listByStatus(
    status: PublicationStatus,
    limit?: number,
  ): Promise<readonly PublicationJournalEntry[]>;
};
