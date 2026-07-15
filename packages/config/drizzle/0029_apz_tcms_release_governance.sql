-- APZTCMS-014: TCMS Release & Quality Governance tables

CREATE TABLE IF NOT EXISTS "testing_release" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "description" text,
  "window_json" jsonb,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_status_chk" CHECK ("status" IN (
    'draft','planning','ready_for_review','ready_for_approval',
    'approved','conditionally_approved','rejected','withdrawn','superseded','archived'
  )),
  CONSTRAINT "testing_release_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_release_tenant_key_uidx" ON "testing_release" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_tenant_idx" ON "testing_release" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_status_idx" ON "testing_release" ("tenant_id", "status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_scope" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "ref_id" text NOT NULL,
  "label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_scope_kind_chk" CHECK ("kind" IN (
    'plan','suite','case','execution','requirement','certification',
    'evidence','coverage','defect','risk','automation','other'
  )),
  CONSTRAINT "testing_release_scope_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_scope_tenant_idx" ON "testing_release_scope" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_scope_release_idx" ON "testing_release_scope" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_package" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "name" text NOT NULL,
  "version_label" text NOT NULL,
  "description" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_package_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_package_tenant_idx" ON "testing_release_package" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_package_release_idx" ON "testing_release_package" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_candidate" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "label" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "notes" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_candidate_status_chk" CHECK ("status" IN (
    'draft','planning','ready_for_review','ready_for_approval',
    'approved','conditionally_approved','rejected','withdrawn','superseded','archived'
  )),
  CONSTRAINT "testing_release_candidate_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_candidate_tenant_idx" ON "testing_release_candidate" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_candidate_release_idx" ON "testing_release_candidate" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_approval" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "stage_kind" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "requested_from_user_id" text,
  "decided_by_user_id" text,
  "decided_at" timestamp with time zone,
  "comments" text,
  "conditions" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_approval_stage_chk" CHECK ("stage_kind" IN (
    'technical','qa','business','security','executive'
  )),
  CONSTRAINT "testing_release_approval_status_chk" CHECK ("status" IN (
    'pending','approved','rejected','withdrawn','conditional'
  )),
  CONSTRAINT "testing_release_approval_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_approval_tenant_idx" ON "testing_release_approval" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_approval_release_idx" ON "testing_release_approval" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_decision" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "verdict" varchar(32) NOT NULL,
  "decided_by_user_id" text NOT NULL,
  "decided_at" timestamp with time zone NOT NULL,
  "rationale" text NOT NULL,
  "is_automatic" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_decision_verdict_chk" CHECK ("verdict" IN (
    'approved','conditionally_approved','rejected'
  )),
  CONSTRAINT "testing_release_decision_auto_chk" CHECK ("is_automatic" = false),
  CONSTRAINT "testing_release_decision_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_decision_tenant_idx" ON "testing_release_decision" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_decision_release_idx" ON "testing_release_decision" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_evidence" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "kind" varchar(64) NOT NULL,
  "ref_id" text NOT NULL,
  "summary" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_evidence_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_evidence_tenant_idx" ON "testing_release_evidence" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_evidence_release_idx" ON "testing_release_evidence" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_dependency" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "depends_on_release_id" text,
  "kind" varchar(64) NOT NULL,
  "required" boolean DEFAULT true NOT NULL,
  "notes" text,
  "blocked" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_dependency_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_dependency_tenant_idx" ON "testing_release_dependency" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_dependency_release_idx" ON "testing_release_dependency" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_note" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "authored_at" timestamp with time zone NOT NULL,
  "author_user_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_note_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_note_tenant_idx" ON "testing_release_note" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_note_release_idx" ON "testing_release_note" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_risk_assessment" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "snapshot_json" jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "is_decision" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_risk_decision_chk" CHECK ("is_decision" = false),
  CONSTRAINT "testing_release_risk_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_risk_tenant_idx" ON "testing_release_risk_assessment" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_risk_release_idx" ON "testing_release_risk_assessment" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_readiness_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "snapshot_json" jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "is_decision" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_readiness_snap_decision_chk" CHECK ("is_decision" = false),
  CONSTRAINT "testing_release_readiness_snap_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_readiness_snap_tenant_idx" ON "testing_release_readiness_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_readiness_snap_release_idx" ON "testing_release_readiness_snapshot" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_summary_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "snapshot_json" jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "is_decision" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_summary_decision_chk" CHECK ("is_decision" = false),
  CONSTRAINT "testing_release_summary_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_summary_tenant_idx" ON "testing_release_summary_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_summary_release_idx" ON "testing_release_summary_snapshot" ("tenant_id", "release_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_release_audit_entry" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "release_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text,
  "action" text NOT NULL,
  "summary" text NOT NULL,
  "details_json" jsonb DEFAULT '{}'::jsonb,
  "correlation_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_audit_tenant_idx" ON "testing_release_audit_entry" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_audit_release_idx" ON "testing_release_audit_entry" ("tenant_id", "release_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_audit_occurred_idx" ON "testing_release_audit_entry" ("tenant_id", "occurred_at");
