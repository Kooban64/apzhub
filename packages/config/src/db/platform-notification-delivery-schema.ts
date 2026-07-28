/**
 * Additive Notification Delivery plane schema (ADR-0071 / Platform-1.3-ENG-004).
 * Lease columns added under Platform-1.4-ENG-001B-P0 / ADR-0073.
 * Extends APZNOTIFY ownership — not a competing Notification SoR.
 * No provider credentials, mailbox, or inbound email.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformNotificationIntent = pgTable(
  "platform_notification_intent",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    sourceProduct: varchar("source_product", { length: 32 }).notNull(),
    sourceEvent: text("source_event"),
    category: text("category").notNull(),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    subject: text("subject").notNull(),
    summary: text("summary"),
    payloadJson: jsonb("payload_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    recipientHintsJson: jsonb("recipient_hints_json")
      .$type<unknown[]>()
      .notNull()
      .default([]),
    mandatory: boolean("mandatory").notNull().default(false),
    correlationId: text("correlation_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    requestedBy: text("requested_by").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    templateId: text("template_id"),
    templateVersion: integer("template_version"),
    metadataJson: jsonb("metadata_json").$type<Record<string, string>>(),
    status: varchar("status", { length: 32 }).notNull().default("requested"),
    suppressionReason: text("suppression_reason"),
    policyRef: text("policy_ref"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_notification_intent_tenant_idem_uidx").on(
      table.tenantId,
      table.idempotencyKey,
    ),
  ],
);

export const platformNotificationDeliveryRecord = pgTable(
  "platform_notification_delivery_record",
  {
    id: text("id").primaryKey(),
    intentId: text("intent_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    userId: text("user_id").notNull(),
    channel: varchar("channel", { length: 32 }).notNull().default("in_app"),
    providerId: varchar("provider_id", { length: 64 }).notNull().default("in_app"),
    status: varchar("status", { length: 32 }).notNull().default("requested"),
    receiptLevel: varchar("receipt_level", { length: 32 })
      .notNull()
      .default("requested"),
    idempotencyKey: text("idempotency_key").notNull(),
    correlationId: text("correlation_id").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastFailureClass: varchar("last_failure_class", { length: 64 }),
    lastFailureCode: text("last_failure_code"),
    inAppNotificationId: text("in_app_notification_id"),
    terminalAt: timestamp("terminal_at", { withTimezone: true }),
    deadLetter: boolean("dead_letter").notNull().default(false),
    /** ENG-001B-P0 / ADR-0073 — lease fencing (nullable; unused until later phases). */
    claimedBy: text("claimed_by"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
    requeueReason: text("requeue_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_notification_delivery_record_idem_uidx").on(
      table.tenantId,
      table.idempotencyKey,
    ),
    index("platform_notification_delivery_record_queue_idx").on(
      table.status,
      table.nextAttemptAt,
    ),
    index("platform_notification_delivery_record_lease_idx")
      .on(table.status, table.leaseExpiresAt)
      .where(sql`${table.status} = 'processing'`),
    index("platform_notification_delivery_record_tenant_queue_idx").on(
      table.tenantId,
      table.status,
      table.nextAttemptAt,
    ),
  ],
);

export const platformNotificationDeliveryTry = pgTable(
  "platform_notification_delivery_try",
  {
    id: text("id").primaryKey(),
    deliveryId: text("delivery_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull().default("in_app"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    receiptLevel: varchar("receipt_level", { length: 32 }).notNull(),
    failureClass: varchar("failure_class", { length: 64 }),
    failureCode: text("failure_code"),
    note: text("note"),
    /** ENG-001B-P0 — future provider duplicate control / worker attribution. */
    providerReference: text("provider_reference"),
    workerId: text("worker_id"),
  },
  (table) => [
    index("platform_notification_delivery_try_delivery_idx").on(table.deliveryId),
    uniqueIndex("platform_notification_delivery_try_delivery_attempt_uidx").on(
      table.deliveryId,
      table.attemptNumber,
    ),
  ],
);

export const platformNotificationInAppItem = pgTable(
  "platform_notification_in_app_item",
  {
    id: text("id").primaryKey(),
    deliveryId: text("delivery_id").notNull(),
    intentId: text("intent_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    userId: text("user_id").notNull(),
    category: text("category").notNull(),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"),
    sourceProduct: varchar("source_product", { length: 32 }).notNull(),
    sourceObjectRef: text("source_object_ref"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
);

export const platformNotificationDeliverySchema = {
  platformNotificationIntent,
  platformNotificationDeliveryRecord,
  platformNotificationDeliveryTry,
  platformNotificationInAppItem,
};
