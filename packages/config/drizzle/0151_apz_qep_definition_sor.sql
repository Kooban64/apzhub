-- APZQEP Phase 2: User Story + Acceptance Criterion SoR. Additive.
-- Does not replace qep_requirement. Does not invent Release.

CREATE TABLE IF NOT EXISTS "qep_user_story" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "story_key" varchar(32) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "story_type" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "priority" varchar(32) NOT NULL,
  "estimate_points" integer,
  "owner_user_id" text,
  "origin_type" varchar(32) NOT NULL,
  "origin_reference" text,
  "accepted_by" text,
  "accepted_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "archived_at" timestamp with time zone,
  "archived_by" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_user_story_tenant_app_key_uidx"
  ON "qep_user_story" ("tenant_id", "application_id", "story_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_user_story_tenant_requirement_idx"
  ON "qep_user_story" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_user_story_tenant_application_idx"
  ON "qep_user_story" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_acceptance_criterion" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "user_story_id" text,
  "criterion_key" varchar(32) NOT NULL,
  "text" text NOT NULL,
  "required" boolean NOT NULL DEFAULT true,
  "status" varchar(32) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "origin_type" varchar(32) NOT NULL,
  "origin_reference" text,
  "accepted_by" text,
  "accepted_at" timestamp with time zone,
  "legacy_source_kind" varchar(64),
  "legacy_source_index" integer,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "archived_at" timestamp with time zone,
  "archived_by" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_acceptance_criterion_tenant_app_key_uidx"
  ON "qep_acceptance_criterion" ("tenant_id", "application_id", "criterion_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_acceptance_criterion_legacy_source_uidx"
  ON "qep_acceptance_criterion" ("tenant_id", "requirement_id", "legacy_source_kind", "legacy_source_index")
  WHERE "legacy_source_kind" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_acceptance_criterion_tenant_requirement_idx"
  ON "qep_acceptance_criterion" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_acceptance_criterion_tenant_story_idx"
  ON "qep_acceptance_criterion" ("tenant_id", "user_story_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_acceptance_criterion_verification" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "criterion_id" text NOT NULL,
  "asset_kind" varchar(64) NOT NULL,
  "asset_id" text NOT NULL,
  "latest_result" varchar(32),
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_ac_verification_criterion_asset_uidx"
  ON "qep_acceptance_criterion_verification" ("criterion_id", "asset_kind", "asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_ac_verification_tenant_criterion_idx"
  ON "qep_acceptance_criterion_verification" ("tenant_id", "criterion_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_definition_key_counter" (
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "next_value" integer NOT NULL,
  PRIMARY KEY ("tenant_id", "application_id", "kind")
);
