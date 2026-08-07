import { getDb, platformProductLearningEvent } from "@apzhub/config/db";
import { and, asc, eq } from "drizzle-orm";

import type {
  ProductLearningEvent,
  ProductLearningFeatureKey,
} from "@apzhub/platform-service-contracts";

import type { ProductLearningEventStore } from "./store";

export function createPostgresProductLearningStore(): ProductLearningEventStore {
  return {
    async append(event) {
      const db = getDb();
      await db.insert(platformProductLearningEvent).values({
        id: event.id,
        tenantId: event.tenantId,
        featureKey: event.featureKey,
        eventName: event.eventName,
        propertiesJson: { ...event.properties },
        occurredAt: new Date(event.occurredAt),
        correlationId: event.correlationId,
      });
    },

    async listByFeature(tenantId, featureKey: ProductLearningFeatureKey) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProductLearningEvent)
        .where(
          and(
            eq(platformProductLearningEvent.tenantId, tenantId),
            eq(platformProductLearningEvent.featureKey, featureKey),
          ),
        )
        .orderBy(asc(platformProductLearningEvent.occurredAt));

      return rows.map((row): ProductLearningEvent =>
        Object.freeze({
          id: row.id,
          tenantId: row.tenantId,
          featureKey: row.featureKey as ProductLearningFeatureKey,
          eventName: row.eventName as ProductLearningEvent["eventName"],
          properties: Object.freeze({ ...(row.propertiesJson ?? {}) }),
          occurredAt: row.occurredAt.toISOString(),
          correlationId: row.correlationId ?? undefined,
        }),
      );
    },
  };
}
