-- APZQEP-120-S05: Evidence Catalogue Platform (first durable PostgreSQL implementation).
-- Additive only. Content bytes remain behind Storage Platform (S03).
CREATE TABLE IF NOT EXISTS "qep_evidence" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text NOT NULL,
  "workspace_id" text,
  "status" varchar(64) NOT NULL,
  "catalogue_state" varchar(32) NOT NULL DEFAULT 'ACTIVE',
  "source_kind" varchar(64) NOT NULL,
  "source_system_id" text,
  "classification_category" varchar(64),
  "classification_sensitivity_label" text,
  "media_type" text,
  "byte_size" integer,
  "content_hash" text,
  "hash_algorithm" varchar(32),
  "storage_locator" text,
  "storage_provider_kind" varchar(32),
  "integrity_verification_state" varchar(32),
  "integrity_sealed" boolean,
  "integrity_last_verified_at" timestamp with time zone,
  "owner_id" text NOT NULL,
  "retention_class" text NOT NULL,
  "retain_until" timestamp with time zone,
  "legal_hold" boolean NOT NULL DEFAULT false,
  "hold_reason" text,
  "title" text,
  "description" text,
  "tags_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "policy_references_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "version" integer NOT NULL DEFAULT 1,
  "dispositioned_at" timestamp with time zone,
  "dispositioned_by" text,
  "disposition_reason" text,
  "disposition_method" text,
  "provenance_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "relationship_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "sealed_at" timestamp with time zone,
  "sealed_by" text,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 0),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_project_idx"
  ON "qep_evidence" ("tenant_id", "project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_status_idx"
  ON "qep_evidence" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_catalogue_state_idx"
  ON "qep_evidence" ("tenant_id", "catalogue_state");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_owner_idx"
  ON "qep_evidence" ("tenant_id", "owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_classification_idx"
  ON "qep_evidence" ("tenant_id", "classification_category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_updated_idx"
  ON "qep_evidence" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_tenant_storage_locator_idx"
  ON "qep_evidence" ("tenant_id", "storage_locator");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "evidence_id" text NOT NULL
    REFERENCES "qep_evidence"("id") ON DELETE CASCADE,
  "version" integer NOT NULL,
  "media_type" text NOT NULL,
  "byte_size" integer NOT NULL,
  "content_hash" text NOT NULL,
  "hash_algorithm" varchar(32) NOT NULL,
  "storage_locator" text NOT NULL,
  "integrity_verification_state" varchar(32) NOT NULL,
  "integrity_sealed" boolean NOT NULL DEFAULT false,
  "integrity_last_verified_at" timestamp with time zone,
  "replaced_at" timestamp with time zone NOT NULL,
  "replaced_by" text NOT NULL,
  CONSTRAINT "qep_evidence_version_uidx" UNIQUE ("tenant_id", "evidence_id", "version")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_version_evidence_idx"
  ON "qep_evidence_version" ("tenant_id", "evidence_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_relationship" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "evidence_id" text NOT NULL
    REFERENCES "qep_evidence"("id") ON DELETE CASCADE,
  "target_capability" varchar(128) NOT NULL,
  "target_id" text NOT NULL,
  "relation_type" varchar(128) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "qep_evidence_relationship_link_uidx" UNIQUE (
    "tenant_id", "evidence_id", "target_capability", "target_id", "relation_type"
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_relationship_evidence_idx"
  ON "qep_evidence_relationship" ("tenant_id", "evidence_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_relationship_target_idx"
  ON "qep_evidence_relationship" ("tenant_id", "target_capability", "target_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "evidence_id" text NOT NULL,
  "action" text NOT NULL,
  "actor_id" text NOT NULL,
  "outcome" varchar(16) NOT NULL,
  "correlation_id" text,
  "occurred_at" timestamp with time zone NOT NULL,
  "details_json" jsonb NOT NULL DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_audit_evidence_idx"
  ON "qep_evidence_audit" ("tenant_id", "evidence_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_audit_occurred_idx"
  ON "qep_evidence_audit" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_collection" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text NOT NULL,
  "name" text NOT NULL,
  "purpose" text NOT NULL,
  "status" varchar(64) NOT NULL,
  "member_evidence_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "sealed_set_id" text,
  "revision" integer NOT NULL DEFAULT 1,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_collection_tenant_project_idx"
  ON "qep_evidence_collection" ("tenant_id", "project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_set" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text NOT NULL,
  "source_collection_id" text NOT NULL,
  "member_evidence_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "seal_hash" text NOT NULL,
  "sealed_at" timestamp with time zone NOT NULL,
  "sealed_by" text NOT NULL,
  "purpose" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_set_collection_idx"
  ON "qep_evidence_set" ("tenant_id", "source_collection_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_access_grant" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "evidence_id" text,
  "scope" text,
  "principal_id" text NOT NULL,
  "action" text NOT NULL,
  "effect" varchar(16) NOT NULL DEFAULT 'allow',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_access_grant_principal_idx"
  ON "qep_evidence_access_grant" ("tenant_id", "principal_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_access_grant_evidence_idx"
  ON "qep_evidence_access_grant" ("tenant_id", "evidence_id");
