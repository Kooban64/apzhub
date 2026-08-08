-- APZQEP QX-PR-04: Durable Dashboard layout / saved-view SoR. Additive only.

CREATE TABLE IF NOT EXISTS "qep_dashboard_layout" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "dashboard_id" text NOT NULL,
  "layout_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_layout_tenant_idx" ON "qep_dashboard_layout" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_layout_tenant_user_idx" ON "qep_dashboard_layout" ("tenant_id", "user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_layout_tenant_dashboard_idx" ON "qep_dashboard_layout" ("tenant_id", "dashboard_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_layout_tenant_updated_idx" ON "qep_dashboard_layout" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_dashboard_saved_view" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "dashboard_id" text NOT NULL,
  "pinned" boolean NOT NULL DEFAULT false,
  "favourite" boolean NOT NULL DEFAULT false,
  "view_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_saved_view_tenant_idx" ON "qep_dashboard_saved_view" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_saved_view_tenant_user_idx" ON "qep_dashboard_saved_view" ("tenant_id", "user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_saved_view_tenant_pinned_idx" ON "qep_dashboard_saved_view" ("tenant_id", "user_id", "pinned");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_dashboard_saved_view_tenant_updated_idx" ON "qep_dashboard_saved_view" ("tenant_id", "updated_at");
