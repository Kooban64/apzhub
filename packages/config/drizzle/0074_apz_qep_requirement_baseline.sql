-- APZQEP-ENG-020E Part 2: Requirement Baseline persistence (immutable membership after lock).
CREATE TABLE IF NOT EXISTS "qep_requirement_baseline" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "baseline_number" integer NOT NULL CHECK ("baseline_number" >= 1),
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL CHECK ("status" IN ('draft', 'locked', 'archived')),
  "owner_user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "locked_at" timestamp with time zone,
  "locked_by" text,
  "archived_at" timestamp with time zone,
  "archived_by" text,
  "integrity_fingerprint" text,
  "correlation_id" text NOT NULL,
  CONSTRAINT "qep_requirement_baseline_number_uidx"
    UNIQUE ("tenant_id", "baseline_number"),
  CONSTRAINT "qep_requirement_baseline_locked_integrity_chk"
    CHECK (
      ("status" = 'draft' AND "locked_at" IS NULL AND "integrity_fingerprint" IS NULL)
      OR ("status" IN ('locked', 'archived') AND "locked_at" IS NOT NULL AND "integrity_fingerprint" IS NOT NULL)
    ),
  CONSTRAINT "qep_requirement_baseline_archived_chk"
    CHECK (
      ("status" <> 'archived' AND "archived_at" IS NULL)
      OR ("status" = 'archived' AND "archived_at" IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_requirement_baseline_item" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "baseline_id" text NOT NULL REFERENCES "qep_requirement_baseline"("id"),
  "requirement_id" text NOT NULL,
  "content_version_id" text NOT NULL,
  "content_version_number" integer NOT NULL CHECK ("content_version_number" >= 1),
  "included_by" text NOT NULL,
  "included_at" timestamp with time zone NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  CONSTRAINT "qep_requirement_baseline_item_version_uidx"
    UNIQUE ("tenant_id", "baseline_id", "content_version_id"),
  CONSTRAINT "qep_requirement_baseline_item_requirement_uidx"
    UNIQUE ("tenant_id", "baseline_id", "requirement_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_id_idx"
  ON "qep_requirement_baseline" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_number_idx"
  ON "qep_requirement_baseline" ("tenant_id", "baseline_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_history_idx"
  ON "qep_requirement_baseline" ("tenant_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_status_idx"
  ON "qep_requirement_baseline" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_owner_idx"
  ON "qep_requirement_baseline" ("tenant_id", "owner_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_item_baseline_idx"
  ON "qep_requirement_baseline_item" ("tenant_id", "baseline_id", "display_order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_item_requirement_idx"
  ON "qep_requirement_baseline_item" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_baseline_item_content_version_idx"
  ON "qep_requirement_baseline_item" ("tenant_id", "content_version_id");
