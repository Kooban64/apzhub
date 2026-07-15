-- APZTCMS-003: APZ TCMS domain persistence foundation
-- Product SoR tables (testing_*). No TestResult / step-result outcome tables.

CREATE TABLE IF NOT EXISTS "testing_requirement" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "priority" varchar(32) NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "work_item_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_requirement_priority_chk" CHECK ("priority" IN ('low','medium','high','critical')),
  CONSTRAINT "testing_requirement_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_requirement_tenant_key_uidx" ON "testing_requirement" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_requirement_tenant_idx" ON "testing_requirement" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_requirement_tenant_org_idx" ON "testing_requirement" ("tenant_id", "organisation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_requirement_archived_idx" ON "testing_requirement" ("tenant_id", "archived_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_work_item" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kind" varchar(32) NOT NULL,
  "key" varchar(64) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "project_ref_id" text,
  "external_work_item_id" text,
  "status" varchar(32) DEFAULT 'active' NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_work_item_kind_chk" CHECK ("kind" IN ('feature','epic','story','task')),
  CONSTRAINT "testing_work_item_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_work_item_tenant_key_uidx" ON "testing_work_item" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_work_item_tenant_idx" ON "testing_work_item" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_work_item_tenant_kind_idx" ON "testing_work_item" ("tenant_id", "kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_work_item_project_ref_idx" ON "testing_work_item" ("tenant_id", "project_ref_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_risk" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "level" varchar(32) NOT NULL,
  "mitigation_summary" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_risk_level_chk" CHECK ("level" IN ('low','medium','high','critical')),
  CONSTRAINT "testing_risk_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_risk_tenant_key_uidx" ON "testing_risk" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_risk_tenant_idx" ON "testing_risk" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_risk_tenant_org_idx" ON "testing_risk" ("tenant_id", "organisation_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_plan" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL,
  "release_label" text,
  "milestone_label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_test_plan_status_chk" CHECK ("status" IN ('draft','ready','deprecated','archived')),
  CONSTRAINT "testing_test_plan_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_plan_tenant_key_uidx" ON "testing_test_plan" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_plan_tenant_idx" ON "testing_test_plan" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_plan_tenant_org_idx" ON "testing_test_plan" ("tenant_id", "organisation_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_suite" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL,
  "is_regression" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_test_suite_status_chk" CHECK ("status" IN ('draft','ready','deprecated','archived')),
  CONSTRAINT "testing_test_suite_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_suite_tenant_key_uidx" ON "testing_test_suite" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_suite_tenant_idx" ON "testing_test_suite" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_case" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL,
  "priority" varchar(32) NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "estimated_minutes" integer,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_test_case_status_chk" CHECK ("status" IN ('draft','ready','deprecated','archived')),
  CONSTRAINT "testing_test_case_priority_chk" CHECK ("priority" IN ('low','medium','high','critical')),
  CONSTRAINT "testing_test_case_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_case_tenant_key_uidx" ON "testing_test_case" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_case_tenant_idx" ON "testing_test_case" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_step" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "case_id" text NOT NULL,
  "ordinal" integer NOT NULL,
  "action" text NOT NULL,
  "expected_result" text NOT NULL,
  "data_hint" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_test_step_ordinal_chk" CHECK ("ordinal" >= 0),
  CONSTRAINT "testing_test_step_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_step_case_ordinal_uidx" ON "testing_test_step" ("tenant_id", "case_id", "ordinal");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_step_tenant_case_idx" ON "testing_test_step" ("tenant_id", "case_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_plan_suite" (
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "suite_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "plan_id", "suite_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_plan_suite_suite_idx" ON "testing_plan_suite" ("tenant_id", "suite_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_suite_case" (
  "tenant_id" text NOT NULL,
  "suite_id" text NOT NULL,
  "case_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "suite_id", "case_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_suite_case_case_idx" ON "testing_suite_case" ("tenant_id", "case_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_case_requirement" (
  "tenant_id" text NOT NULL,
  "case_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "case_id", "requirement_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_case_requirement_req_idx" ON "testing_case_requirement" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_plan_requirement" (
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "plan_id", "requirement_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_plan_requirement_req_idx" ON "testing_plan_requirement" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_risk_requirement" (
  "tenant_id" text NOT NULL,
  "risk_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "risk_id", "requirement_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_risk_requirement_req_idx" ON "testing_risk_requirement" ("tenant_id", "requirement_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_plan_risk" (
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "risk_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "plan_id", "risk_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_plan_risk_risk_idx" ON "testing_plan_risk" ("tenant_id", "risk_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_regression_set" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "plan_id" text,
  "suite_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_regression_set_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_regression_set_tenant_key_uidx" ON "testing_regression_set" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_regression_set_tenant_idx" ON "testing_regression_set" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_regression_set_plan_idx" ON "testing_regression_set" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_execution_session" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "plan_id" text,
  "suite_id" text,
  "execution_type" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "assignee_id" text,
  "notes" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_execution_session_type_chk" CHECK ("execution_type" IN ('manual','automated','hybrid')),
  CONSTRAINT "testing_execution_session_status_chk" CHECK ("status" IN ('planned','queued','in_progress','completed','aborted','failed')),
  CONSTRAINT "testing_execution_session_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_execution_session_tenant_idx" ON "testing_execution_session" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_execution_session_plan_idx" ON "testing_execution_session" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_execution_session_status_idx" ON "testing_execution_session" ("tenant_id", "status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_execution_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "session_id" text NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "actor_user_id" text,
  "correlation_id" text,
  "summary" text NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_execution_history_tenant_session_idx" ON "testing_execution_history" ("tenant_id", "session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_execution_history_occurred_idx" ON "testing_execution_history" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_evidence" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "type" varchar(32) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "storage_ref" text NOT NULL,
  "content_type" varchar(128),
  "content_hash" text,
  "size_bytes" integer,
  "session_id" text,
  "case_id" text,
  "step_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_evidence_type_chk" CHECK ("type" IN ('screenshot','log','video','trace','report','note','other')),
  CONSTRAINT "testing_evidence_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_evidence_tenant_idx" ON "testing_evidence" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_evidence_session_idx" ON "testing_evidence" ("tenant_id", "session_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_approval" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "certification_record_id" text NOT NULL,
  "gate_id" text,
  "status" varchar(32) NOT NULL,
  "requested_from_user_id" text,
  "decided_by_user_id" text,
  "decided_at" timestamp with time zone,
  "comments" text,
  "conditions" text,
  "signature_json" jsonb,
  "witnesses_json" jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_approval_status_chk" CHECK ("status" IN ('pending','approved','rejected','withdrawn','conditional')),
  CONSTRAINT "testing_approval_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_approval_tenant_idx" ON "testing_approval" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_approval_cert_idx" ON "testing_approval" ("tenant_id", "certification_record_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_certification_record" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "status" varchar(64) NOT NULL,
  "plan_id" text,
  "product_label" text,
  "release_label" text,
  "gate_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "approval_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "conditions" text,
  "certified_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_certification_status_chk" CHECK ("status" IN (
    'development_ready','qa_ready','regression_ready','uat_ready',
    'production_ready','certified','failed_certification','conditional_approval'
  )),
  CONSTRAINT "testing_certification_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_certification_tenant_key_uidx" ON "testing_certification_record" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_certification_tenant_idx" ON "testing_certification_record" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_certification_status_idx" ON "testing_certification_record" ("tenant_id", "status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_release_readiness" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "certification_record_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "summary" text NOT NULL,
  "blocking_gate_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "assessed_at" timestamp with time zone NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_release_readiness_status_chk" CHECK ("status" IN ('not_ready','partially_ready','ready','blocked')),
  CONSTRAINT "testing_release_readiness_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_readiness_tenant_idx" ON "testing_release_readiness" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_release_readiness_cert_idx" ON "testing_release_readiness" ("tenant_id", "certification_record_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_coverage_record" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kind" varchar(32) NOT NULL,
  "subject_id" text NOT NULL,
  "covered_count" integer DEFAULT 0 NOT NULL,
  "total_count" integer DEFAULT 0 NOT NULL,
  "percentage" real DEFAULT 0 NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "plan_id" text,
  "suite_id" text,
  "requirement_id" text,
  "risk_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_coverage_kind_chk" CHECK ("kind" IN ('requirement','risk','suite','plan','code_ref')),
  CONSTRAINT "testing_coverage_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_coverage_tenant_idx" ON "testing_coverage_record" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_coverage_subject_idx" ON "testing_coverage_record" ("tenant_id", "kind", "subject_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_automation_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "automation_type" varchar(32) NOT NULL,
  "adapter_source_id" text,
  "case_id" text,
  "suite_id" text,
  "config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(32) DEFAULT 'active' NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automation_type_chk" CHECK ("automation_type" IN (
    'unit','integration','e2e','api','performance','security','accessibility','other'
  )),
  CONSTRAINT "testing_automation_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_automation_tenant_key_uidx" ON "testing_automation_definition" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_tenant_idx" ON "testing_automation_definition" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_traceability_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "type" varchar(32) NOT NULL,
  "source_kind" varchar(64) NOT NULL,
  "source_id" text NOT NULL,
  "target_kind" varchar(64) NOT NULL,
  "target_id" text NOT NULL,
  "notes" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_traceability_type_chk" CHECK ("type" IN ('covers','verifies','related','blocks','derived_from')),
  CONSTRAINT "testing_traceability_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_traceability_tenant_idx" ON "testing_traceability_link" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_traceability_source_idx" ON "testing_traceability_link" ("tenant_id", "source_kind", "source_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_traceability_target_idx" ON "testing_traceability_link" ("tenant_id", "target_kind", "target_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_audit_record" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "actor_user_id" text,
  "action" varchar(128) NOT NULL,
  "entity_kind" varchar(64) NOT NULL,
  "entity_id" text NOT NULL,
  "correlation_id" text,
  "summary" text NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_audit_tenant_idx" ON "testing_audit_record" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_audit_entity_idx" ON "testing_audit_record" ("tenant_id", "entity_kind", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_audit_occurred_idx" ON "testing_audit_record" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_configuration" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "config_key" varchar(64) DEFAULT 'default' NOT NULL,
  "config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_configuration_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_configuration_tenant_key_uidx" ON "testing_configuration" ("tenant_id", "config_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_configuration_tenant_idx" ON "testing_configuration" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_registry_entry" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "registry_kind" varchar(64) NOT NULL,
  "entry_key" varchar(128) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) DEFAULT 'enabled' NOT NULL,
  "version" varchar(32),
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_registry_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_registry_tenant_kind_key_uidx" ON "testing_registry_entry" ("tenant_id", "registry_kind", "entry_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_registry_tenant_idx" ON "testing_registry_entry" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_registry_kind_idx" ON "testing_registry_entry" ("tenant_id", "registry_kind");
