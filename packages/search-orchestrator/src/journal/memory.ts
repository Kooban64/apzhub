import { assertPublicationTransition } from "../lifecycle";
import type { EnqueuePublicationInput, PublicationJournalEntry } from "../types";
import type { PublicationJournalRepository } from "./port";

export function createInMemoryPublicationJournal(): PublicationJournalRepository {
  const store = new Map<string, PublicationJournalEntry>();

  return {
    async enqueue(input) {
      const entry: PublicationJournalEntry = {
        id: input.id,
        tenantId: input.tenantId,
        organisationId: input.organisationId,
        entityId: input.entityId,
        entityType: input.entityType,
        productId: input.productId,
        operation: input.operation,
        payloadJson: input.payloadJson,
        payloadHash: input.payloadHash,
        status: "queued",
        attemptCount: 0,
        maxAttempts: input.maxAttempts,
        correlationId: input.correlationId,
        actorUserId: input.actorUserId,
        createdAt: input.now,
        updatedAt: input.now,
      };
      store.set(entry.id, entry);
      return entry;
    },

    async findById(id) {
      return store.get(id) ?? null;
    },

    async findDuplicate(input) {
      for (const entry of store.values()) {
        if (
          entry.tenantId === input.tenantId &&
          entry.entityId === input.entityId &&
          entry.operation === input.operation &&
          entry.payloadHash === input.payloadHash &&
          (entry.status === "queued" ||
            entry.status === "publishing" ||
            entry.status === "published" ||
            entry.status === "retrying")
        ) {
          return entry;
        }
      }
      return null;
    },

    async claimBatch(input) {
      const ready = [...store.values()]
        .filter((entry) => {
          if (entry.status === "queued") return true;
          if (entry.status !== "retrying") return false;
          if (!entry.nextAttemptAt) return true;
          return entry.nextAttemptAt <= input.now;
        })
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, input.limit);

      const claimed: PublicationJournalEntry[] = [];
      for (const entry of ready) {
        assertPublicationTransition(entry.status, "publishing");
        const next: PublicationJournalEntry = {
          ...entry,
          status: "publishing",
          attemptCount: entry.attemptCount + 1,
          updatedAt: input.now,
          nextAttemptAt: undefined,
        };
        store.set(next.id, next);
        claimed.push(next);
      }
      return claimed;
    },

    async updateStatus(input) {
      const existing = store.get(input.id);
      if (!existing) {
        throw new Error(`Publication journal entry not found: ${input.id}`);
      }
      if (existing.status !== input.from) {
        throw new Error(
          `Publication status mismatch for ${input.id}: expected ${input.from}, found ${existing.status}`,
        );
      }
      assertPublicationTransition(input.from, input.to);
      const next: PublicationJournalEntry = {
        ...existing,
        status: input.to,
        updatedAt: input.now,
        attemptCount: input.attemptCount ?? existing.attemptCount,
        nextAttemptAt:
          input.nextAttemptAt === null
            ? undefined
            : (input.nextAttemptAt ?? existing.nextAttemptAt),
        lastError:
          input.lastError === null
            ? undefined
            : (input.lastError ?? existing.lastError),
        publishedAt:
          input.publishedAt === null
            ? undefined
            : (input.publishedAt ?? existing.publishedAt),
      };
      store.set(next.id, next);
      return next;
    },

    async countByStatus(status) {
      return [...store.values()].filter((e) => e.status === status).length;
    },

    async listByStatus(status, limit = 100) {
      return [...store.values()]
        .filter((e) => e.status === status)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, limit);
    },
  };
}

export type { EnqueuePublicationInput };
