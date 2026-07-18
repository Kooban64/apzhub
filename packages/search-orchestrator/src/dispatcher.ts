/**
 * Enqueue API for product publication hooks (APZSEARCH-016).
 */

import { isSearchOrchestrationEnabled, SearchOrchestrationDisabledError } from "./env";
import { hashPublicationPayload } from "./hash";
import type { PublicationJournalRepository } from "./journal/port";
import type {
  EnqueuePublicationInput,
  PublicationJournalEntry,
  RetryPolicy,
} from "./types";
import { DEFAULT_RETRY_POLICY } from "./types";

export type PublicationDispatcher = {
  enqueue(input: EnqueuePublicationInput): Promise<
    | {
        readonly ok: true;
        readonly entry: PublicationJournalEntry;
        readonly deduplicated: boolean;
      }
    | {
        readonly ok: false;
        readonly code: "SEARCH_ORCHESTRATION_DISABLED";
        readonly message: string;
      }
  >;
};

export type CreatePublicationDispatcherOptions = {
  readonly journal: PublicationJournalRepository;
  readonly retryPolicy?: RetryPolicy;
  readonly id: () => string;
  readonly now?: () => string;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  /** When true, throw on disabled instead of returning ok:false */
  readonly throwIfDisabled?: boolean;
};

export function createPublicationDispatcher(
  options: CreatePublicationDispatcherOptions,
): PublicationDispatcher {
  const now = options.now ?? (() => new Date().toISOString());
  const policy = options.retryPolicy ?? DEFAULT_RETRY_POLICY;

  return {
    async enqueue(input) {
      if (!isSearchOrchestrationEnabled(options.env)) {
        if (options.throwIfDisabled) {
          throw new SearchOrchestrationDisabledError();
        }
        return {
          ok: false as const,
          code: "SEARCH_ORCHESTRATION_DISABLED" as const,
          message:
            "Search publication orchestration is not enabled (APZHUB_SEARCH_ORCHESTRATION_ENABLED).",
        };
      }

      const payloadHash = hashPublicationPayload({
        operation: input.operation,
        entityId: input.entityId,
        entityType: input.entityType,
        productId: input.productId,
        payload: input.payload,
      });

      const duplicate = await options.journal.findDuplicate({
        tenantId: input.tenantId,
        entityId: input.entityId,
        operation: input.operation,
        payloadHash,
      });
      if (duplicate) {
        return { ok: true as const, entry: duplicate, deduplicated: true };
      }

      const entry = await options.journal.enqueue({
        ...input,
        id: options.id(),
        payloadJson: JSON.stringify(input.payload),
        payloadHash,
        maxAttempts: policy.maxAttempts,
        now: now(),
      });
      return { ok: true as const, entry, deduplicated: false };
    },
  };
}

/**
 * Safe hook wrapper — never throws into product transactions when orchestration is disabled.
 */
export function safeEnqueuePublication(
  dispatcher: PublicationDispatcher,
  input: EnqueuePublicationInput,
): Promise<void> {
  return dispatcher.enqueue(input).then((result) => {
    if (!result.ok) return;
  });
}
