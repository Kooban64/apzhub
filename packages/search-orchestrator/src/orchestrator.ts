/**
 * Index Orchestrator — drains journal through Search Integration (APZSEARCH-016).
 * Does not call Meilisearch / provider SDKs / search-persistence.
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
} from "@apzhub/search-integration";
import {
  createSearchIntegrationContext,
  type CanonicalSearchEntityInput,
  type SearchEntityDraft,
} from "@apzhub/search-integration";

import type { PublicationDispatcher } from "./dispatcher";
import type { PublicationJournalRepository } from "./journal/port";
import { isPermanentFailureMessage, nextAttemptIso, shouldRetry } from "./retry-policy";
import type {
  BatchPolicy,
  OrchestrationDiagnostics,
  PublicationJournalEntry,
  RetryPolicy,
} from "./types";
import { DEFAULT_BATCH_POLICY, DEFAULT_RETRY_POLICY } from "./types";
import { SEARCH_ORCHESTRATOR_VERSION } from "./version";
import { isSearchOrchestrationEnabled } from "./env";

export type IndexOrchestrator = {
  processBatch(): Promise<{
    readonly processed: number;
    readonly published: number;
    readonly failed: number;
    readonly deadLetter: number;
  }>;
  diagnostics(): Promise<OrchestrationDiagnostics>;
  readonly dispatcher: PublicationDispatcher;
  readonly journal: PublicationJournalRepository;
};

export type CreateIndexOrchestratorOptions = {
  readonly journal: PublicationJournalRepository;
  readonly dispatcher: PublicationDispatcher;
  readonly publisher: SearchIntegrationPublisher;
  readonly retryPolicy?: RetryPolicy;
  readonly batchPolicy?: BatchPolicy;
  readonly now?: () => string;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  /** Cumulative published counter for diagnostics throughput. */
  readonly publishedCounter?: { value: number };
};

export function createIndexOrchestrator(
  options: CreateIndexOrchestratorOptions,
): IndexOrchestrator {
  const now = options.now ?? (() => new Date().toISOString());
  const retryPolicy = options.retryPolicy ?? DEFAULT_RETRY_POLICY;
  const batchPolicy = options.batchPolicy ?? DEFAULT_BATCH_POLICY;
  const publishedCounter = options.publishedCounter ?? { value: 0 };

  async function applyResult(
    entry: PublicationJournalEntry,
    result: SearchPublicationResult,
  ): Promise<"published" | "failed" | "dead-letter"> {
    if (result.ok) {
      await options.journal.updateStatus({
        id: entry.id,
        from: "publishing",
        to: "published",
        now: now(),
        publishedAt: now(),
        lastError: null,
        nextAttemptAt: null,
      });
      publishedCounter.value += 1;
      return "published";
    }

    const permanent = isPermanentFailureMessage(result.message);
    const errorMessage = result.message ?? "Publication failed";

    // Always visit `failed` so the transition is auditable before retry / DLQ.
    await options.journal.updateStatus({
      id: entry.id,
      from: "publishing",
      to: "failed",
      now: now(),
      lastError: errorMessage,
      nextAttemptAt: null,
    });

    if (!shouldRetry(entry.attemptCount, permanent, retryPolicy)) {
      await options.journal.updateStatus({
        id: entry.id,
        from: "failed",
        to: "dead-letter",
        now: now(),
        lastError: errorMessage,
        nextAttemptAt: null,
      });
      return "dead-letter";
    }

    await options.journal.updateStatus({
      id: entry.id,
      from: "failed",
      to: "retrying",
      now: now(),
      lastError: errorMessage,
      nextAttemptAt: nextAttemptIso(entry.attemptCount, now, retryPolicy),
    });
    return "failed";
  }

  async function executeEntry(
    entry: PublicationJournalEntry,
  ): Promise<SearchPublicationResult> {
    const payload = JSON.parse(entry.payloadJson) as
      | CanonicalSearchEntityInput
      | SearchEntityDraft
      | {
          readonly entityId: string;
          readonly state?: string;
          readonly reason?: string;
        };

    const context = createSearchIntegrationContext({
      searchContext: {
        correlationId: entry.correlationId,
        actorUserId: entry.actorUserId ?? "system",
        tenantId: entry.tenantId,
        organisationId: entry.organisationId,
        permissions: ["search.*"],
      },
      productId: entry.productId as never,
    });

    if (entry.operation === "remove") {
      return options.publisher.remove(context, entry.entityId);
    }
    if (entry.operation === "lifecycle") {
      const lifecyclePayload = payload as {
        readonly entityId: string;
        readonly state: Parameters<SearchIntegrationPublisher["lifecycle"]>[2];
        readonly reason?: string;
      };
      return options.publisher.lifecycle(
        context,
        lifecyclePayload.entityId ?? entry.entityId,
        lifecyclePayload.state,
        lifecyclePayload.reason,
      );
    }
    if (entry.operation === "update") {
      return options.publisher.update(
        context,
        payload as CanonicalSearchEntityInput | SearchEntityDraft,
      );
    }
    return options.publisher.publish(
      context,
      payload as CanonicalSearchEntityInput | SearchEntityDraft,
    );
  }

  return {
    dispatcher: options.dispatcher,
    journal: options.journal,

    async processBatch() {
      const claimed = await options.journal.claimBatch({
        limit: batchPolicy.maxBatchSize,
        now: now(),
      });
      let published = 0;
      let failed = 0;
      let deadLetter = 0;
      for (const entry of claimed) {
        try {
          const result = await executeEntry(entry);
          const outcome = await applyResult(entry, result);
          if (outcome === "published") published += 1;
          else if (outcome === "dead-letter") deadLetter += 1;
          else failed += 1;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unexpected orchestration error";
          const permanent = isPermanentFailureMessage(message);
          await options.journal.updateStatus({
            id: entry.id,
            from: "publishing",
            to: "failed",
            now: now(),
            lastError: message,
            nextAttemptAt: null,
          });
          if (!shouldRetry(entry.attemptCount, permanent, retryPolicy)) {
            await options.journal.updateStatus({
              id: entry.id,
              from: "failed",
              to: "dead-letter",
              now: now(),
              lastError: message,
              nextAttemptAt: null,
            });
            deadLetter += 1;
          } else {
            await options.journal.updateStatus({
              id: entry.id,
              from: "failed",
              to: "retrying",
              now: now(),
              lastError: message,
              nextAttemptAt: nextAttemptIso(entry.attemptCount, now, retryPolicy),
            });
            failed += 1;
          }
        }
      }
      return {
        processed: claimed.length,
        published,
        failed,
        deadLetter,
      };
    },

    async diagnostics() {
      const [queueDepth, retryingCount, failedCount, deadLetterCount, publishedCount] =
        await Promise.all([
          options.journal.countByStatus("queued"),
          options.journal.countByStatus("retrying"),
          options.journal.countByStatus("failed"),
          options.journal.countByStatus("dead-letter"),
          options.journal.countByStatus("published"),
        ]);
      return {
        enabled: isSearchOrchestrationEnabled(options.env),
        frameworkVersion: SEARCH_ORCHESTRATOR_VERSION,
        queueDepth,
        retryingCount,
        failedCount,
        deadLetterCount,
        publishedCount,
        throughputPublished: publishedCounter.value,
        backlog: queueDepth + retryingCount,
      };
    },
  };
}
