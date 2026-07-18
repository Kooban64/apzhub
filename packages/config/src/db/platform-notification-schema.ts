/**
 * Platform Notification metadata schema (APZNOTIFY-001).
 * Notification SoR metadata only — no provider payloads, binaries, or queues.
 */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformNotification = pgTable(
  "platform_notification",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key"),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    categoryId: text("category_id"),
    templateId: text("template_id"),
    channelKindsJson: jsonb("channel_kinds_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_notification_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformNotificationRecipient = pgTable(
  "platform_notification_recipient",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id"),
    addressHint: text("address_hint"),
    channelKind: varchar("channel_kind", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    readAt: timestamp("read_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const platformNotificationTemplate = pgTable(
  "platform_notification_template",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: text("category_id"),
    defaultPriority: varchar("default_priority", { length: 32 })
      .notNull()
      .default("normal"),
    defaultChannelKindsJson: jsonb("default_channel_kinds_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    subjectTemplate: text("subject_template"),
    bodyTemplate: text("body_template"),
    locale: text("locale"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_notification_template_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformNotificationCategory = pgTable(
  "platform_notification_category",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_notification_category_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformNotificationChannel = pgTable("platform_notification_channel", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  kind: varchar("kind", { length: 32 }).notNull(),
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  configRef: text("config_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformNotificationPreference = pgTable(
  "platform_notification_preference",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    userId: text("user_id").notNull(),
    categoryId: text("category_id"),
    channelKind: varchar("channel_kind", { length: 32 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    quietHours: text("quiet_hours"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const platformNotificationRule = pgTable(
  "platform_notification_rule",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    categoryId: text("category_id"),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    channelKindsJson: jsonb("channel_kinds_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    conditionRef: text("condition_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_notification_rule_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformNotificationReference = pgTable(
  "platform_notification_reference",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    resourceId: text("resource_id").notNull(),
    label: text("label"),
  },
);

export const platformNotificationAttachmentMetadata = pgTable(
  "platform_notification_attachment_metadata",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type"),
    sizeBytes: integer("size_bytes"),
    storageRef: text("storage_ref"),
  },
);

export const platformNotificationDeliveryAttempt = pgTable(
  "platform_notification_delivery_attempt",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    channelKind: varchar("channel_kind", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("recorded"),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull(),
    note: text("note"),
  },
);

export const platformNotificationAudit = pgTable("platform_notification_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  notificationId: text("notification_id"),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformNotificationSchema = {
  platformNotification,
  platformNotificationRecipient,
  platformNotificationTemplate,
  platformNotificationCategory,
  platformNotificationChannel,
  platformNotificationPreference,
  platformNotificationRule,
  platformNotificationReference,
  platformNotificationAttachmentMetadata,
  platformNotificationDeliveryAttempt,
  platformNotificationAudit,
};
