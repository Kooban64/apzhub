/**
 * Product Learning events — APZHUB-CONTEXT-LEARNING-001.
 * Anonymous interaction telemetry. Never stores business SoR content.
 */
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformProductLearningEvent = pgTable(
  "platform_product_learning_event",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    featureKey: text("feature_key").notNull(),
    eventName: text("event_name").notNull(),
    propertiesJson: jsonb("properties_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    correlationId: text("correlation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("platform_product_learning_event_tenant_feature_idx").on(
      table.tenantId,
      table.featureKey,
      table.occurredAt,
    ),
    index("platform_product_learning_event_tenant_name_idx").on(
      table.tenantId,
      table.eventName,
      table.occurredAt,
    ),
  ],
);

export const platformProductLearningSchema = {
  platformProductLearningEvent,
};
