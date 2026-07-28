-- APZQEP-ENG-060B: Test Plans Infrastructure persistence (OES-ENG-060B Part 2).
CREATE TABLE IF NOT EXISTS "qep_test_plans" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "number" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "objective" text NOT NULL,
  "scope_class" varchar(32) NOT NULL,
  "scope_label" text,
  "scope_external_ref" text,
  "status" varchar(32) NOT NULL
    CHECK ("status" IN (
      'draft', 'review', 'approved', 'ready', 'in_execution',
      'completed', 'archived', 'rejected', 'cancelled', 'superseded'
    )),
  "priority" varchar(16) NOT NULL
    CHECK ("priority" IN ('critical', 'high', 'medium', 'low')),
  "plan_type" varchar(32) NOT NULL,
  "owner_id" text NOT NULL,
  "version_label" varchar(32) NOT NULL,
  "predecessor_plan_id" text,
  "predecessor_sealed_version_label" varchar(32),
  "successor_plan_id" text,
  "lead_id" text,
  "assignee_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "assignment_updated_at" timestamp with time zone NOT NULL,
  "assignment_updated_by" text NOT NULL,
  "planned_start" timestamp with time zone,
  "planned_end" timestamp with time zone,
  "milestone_ref" text,
  "timezone" text,
  "external_references_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metrics_json" jsonb NOT NULL DEFAULT '{"totalItems":0,"includedCount":0,"optionalCount":0,"deferredCount":0,"pinnedIncludedCount":0}'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "correlation_id" text,
  CONSTRAINT "qep_test_plans_tenant_number_uidx" UNIQUE ("tenant_id", "number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_items" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL
    REFERENCES "qep_test_plans"("id") ON DELETE CASCADE,
  "specification_id" text NOT NULL,
  "specification_version_pin" text,
  "sequence" integer NOT NULL DEFAULT 0,
  "item_status" varchar(16) NOT NULL DEFAULT 'included'
    CHECK ("item_status" IN ('included', 'optional', 'deferred', 'removed')),
  "notes" text,
  "requirement_refs_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_approvals" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL
    REFERENCES "qep_test_plans"("id") ON DELETE CASCADE,
  "decision" varchar(16) NOT NULL
    CHECK ("decision" IN ('approved', 'rejected')),
  "decided_by" text NOT NULL,
  "decided_at" timestamp with time zone NOT NULL,
  "comment" text,
  "from_status" varchar(32) NOT NULL,
  "to_status" varchar(32) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_revisions" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL
    REFERENCES "qep_test_plans"("id") ON DELETE CASCADE,
  "version_label" varchar(32) NOT NULL,
  "sealed_at" timestamp with time zone NOT NULL,
  "sealed_by" text NOT NULL,
  "status_at_seal" varchar(32) NOT NULL,
  "item_fingerprint" text NOT NULL,
  "predecessor_version_label" varchar(32),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "qep_test_plan_revisions_lineage_uidx"
    UNIQUE ("tenant_id", "plan_id", "version_label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL
    REFERENCES "qep_test_plans"("id") ON DELETE CASCADE,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "action" text NOT NULL,
  "summary" text NOT NULL,
  "from_status" varchar(32),
  "to_status" varchar(32),
  "correlation_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  CONSTRAINT "qep_test_plan_history_seq_uidx"
    UNIQUE ("tenant_id", "plan_id", "sequence")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plans_tenant_id_idx"
  ON "qep_test_plans" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plans_tenant_status_idx"
  ON "qep_test_plans" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plans_tenant_owner_idx"
  ON "qep_test_plans" ("tenant_id", "owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plans_tenant_updated_idx"
  ON "qep_test_plans" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_items_plan_seq_idx"
  ON "qep_test_plan_items" ("plan_id", "sequence");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_items_tenant_plan_idx"
  ON "qep_test_plan_items" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_approvals_tenant_plan_idx"
  ON "qep_test_plan_approvals" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_revisions_tenant_plan_idx"
  ON "qep_test_plan_revisions" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_history_plan_idx"
  ON "qep_test_plan_history" ("tenant_id", "plan_id");
