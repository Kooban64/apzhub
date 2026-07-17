-- APZNOTIFY-001: Platform Notification metadata tables (no delivery / queues / provider payloads)

CREATE TABLE IF NOT EXISTS "platform_notification" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text,
  "title" text NOT NULL,
  "summary" text,
  "body" text,
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "priority" varchar(32) DEFAULT 'normal' NOT NULL,
  "category_id" text,
  "template_id" text,
  "channel_kinds_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "expires_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_notification_tenant_key_uidx"
  ON "platform_notification" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_tenant_idx"
  ON "platform_notification" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_recipient" (
  "id" text PRIMARY KEY NOT NULL,
  "notification_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text,
  "address_hint" text,
  "channel_kind" varchar(32) NOT NULL,
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "read_at" timestamp with time zone,
  "acknowledged_at" timestamp with time zone,
  "dismissed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_recipient_tenant_idx"
  ON "platform_notification_recipient" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_recipient_notification_idx"
  ON "platform_notification_recipient" ("notification_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_template" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "category_id" text,
  "default_priority" varchar(32) DEFAULT 'normal' NOT NULL,
  "default_channel_kinds_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "subject_template" text,
  "body_template" text,
  "locale" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_notification_template_tenant_key_uidx"
  ON "platform_notification_template" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_category" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_notification_category_tenant_key_uidx"
  ON "platform_notification_category" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_channel" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kind" varchar(32) NOT NULL,
  "name" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "config_ref" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_channel_tenant_idx"
  ON "platform_notification_channel" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_preference" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "user_id" text NOT NULL,
  "category_id" text,
  "channel_kind" varchar(32) NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "quiet_hours" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_preference_tenant_idx"
  ON "platform_notification_preference" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_rule" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "category_id" text,
  "priority" varchar(32) DEFAULT 'normal' NOT NULL,
  "channel_kinds_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "condition_ref" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_notification_rule_tenant_key_uidx"
  ON "platform_notification_rule" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "notification_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "resource_id" text NOT NULL,
  "label" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_reference_notification_idx"
  ON "platform_notification_reference" ("notification_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_attachment_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "notification_id" text NOT NULL,
  "file_name" text NOT NULL,
  "content_type" text,
  "size_bytes" integer,
  "storage_ref" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_attachment_notification_idx"
  ON "platform_notification_attachment_metadata" ("notification_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_delivery_attempt" (
  "id" text PRIMARY KEY NOT NULL,
  "notification_id" text NOT NULL,
  "recipient_id" text NOT NULL,
  "channel_kind" varchar(32) NOT NULL,
  "status" varchar(32) DEFAULT 'recorded' NOT NULL,
  "attempted_at" timestamp with time zone NOT NULL,
  "note" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_delivery_attempt_notification_idx"
  ON "platform_notification_delivery_attempt" ("notification_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_notification_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "notification_id" text,
  "action" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_notification_audit_tenant_idx"
  ON "platform_notification_audit" ("tenant_id");
