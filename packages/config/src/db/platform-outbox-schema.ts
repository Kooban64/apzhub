/**
 * Enterprise Platform Outbox persistence — APZQEP-120-S08.
 * Product-agnostic store for reliable event delivery.
 * Proven in APZQEP; reusable across the portfolio.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformOutboxEvent = pgTable(
  "platform_outbox_event",
  {
    outboxEventId: text("outbox_event_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    aggregateType: varchar("aggregate_type", { length: 64 }).notNull(),
    aggregateId: text("aggregate_id").notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: text("last_error"),
    correlationId: text("correlation_id"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("platform_outbox_event_tenant_idx").on(table.tenantId),
    index("platform_outbox_event_status_idx").on(table.status),
    index("platform_outbox_event_claim_idx").on(
      table.status,
      table.nextAttemptAt,
      table.createdAt,
    ),
    uniqueIndex("platform_outbox_event_idempotency_uidx").on(
      table.tenantId,
      table.idempotencyKey,
    ),
  ],
);

export const platformOutboxSchema = {
  platformOutboxEvent,
};
