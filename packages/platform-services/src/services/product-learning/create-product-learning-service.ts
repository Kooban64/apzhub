import type {
  ContextLearningSummary,
  RecordProductLearningEventInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import { getMemoryProductLearningStore } from "./memory-store";
import { createPostgresProductLearningStore } from "./postgres-store";
import { recordProductLearningEvent } from "./record-learning-event";
import type { ProductLearningEventStore } from "./store";
import { summarizeContextLearning } from "./summarize-context-learning";

export type ProductLearningService = {
  record(
    ctx: ServiceRequestContext,
    input: RecordProductLearningEventInput,
  ): Promise<void>;
  summarizeEnterpriseContext(
    ctx: ServiceRequestContext,
  ): Promise<ContextLearningSummary>;
};

let preferredStore: ProductLearningEventStore | undefined;

export function setProductLearningStoreForTests(
  store: ProductLearningEventStore,
): void {
  preferredStore = store;
}

export function resolveProductLearningStore(): ProductLearningEventStore {
  if (preferredStore) return preferredStore;
  if (process.env.APZHUB_PRODUCT_LEARNING_STORE === "memory") {
    return getMemoryProductLearningStore();
  }
  try {
    return createPostgresProductLearningStore();
  } catch {
    return getMemoryProductLearningStore();
  }
}

export function createProductLearningService(
  store: ProductLearningEventStore = resolveProductLearningStore(),
): ProductLearningService {
  return {
    async record(ctx, input) {
      try {
        await recordProductLearningEvent(ctx, store, input);
      } catch (error) {
        // Prefer Postgres; fall back to memory if table/migration not ready.
        if (store !== getMemoryProductLearningStore()) {
          await recordProductLearningEvent(ctx, getMemoryProductLearningStore(), input);
          return;
        }
        throw error;
      }
    },
    async summarizeEnterpriseContext(ctx) {
      const tenantId = ctx.tenantId ?? "default";
      let events;
      try {
        events = await store.listByFeature(tenantId, "enterprise-context");
      } catch {
        events = await getMemoryProductLearningStore().listByFeature(
          tenantId,
          "enterprise-context",
        );
      }
      return summarizeContextLearning(events);
    },
  };
}
