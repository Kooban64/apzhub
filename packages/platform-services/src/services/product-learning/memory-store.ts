import type { ProductLearningEvent } from "@apzhub/platform-service-contracts";

import type { ProductLearningEventStore } from "./store";

/** Process-local store for tests and fallback when Postgres is unavailable. */
export function createMemoryProductLearningStore(): ProductLearningEventStore {
  const events: ProductLearningEvent[] = [];

  return {
    async append(event) {
      events.push(Object.freeze({ ...event, properties: { ...event.properties } }));
    },
    async listByFeature(tenantId, featureKey) {
      return events
        .filter((e) => e.tenantId === tenantId && e.featureKey === featureKey)
        .slice()
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },
    async clearForTests() {
      events.length = 0;
    },
  };
}

let singleton: ProductLearningEventStore | undefined;

export function getMemoryProductLearningStore(): ProductLearningEventStore {
  if (!singleton) singleton = createMemoryProductLearningStore();
  return singleton;
}

export function resetMemoryProductLearningStoreForTests(): void {
  singleton = createMemoryProductLearningStore();
}
