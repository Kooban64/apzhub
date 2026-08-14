-- APZPEN assurance SoR (SPR-APZPEN-014). Document-oriented CE tables.

CREATE TABLE IF NOT EXISTS "apzpen_engagement" (
  "engagement_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_engagement_tenant_idx"
  ON "apzpen_engagement" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_engagement_tenant_updated_idx"
  ON "apzpen_engagement" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apzpen_finding" (
  "finding_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "engagement_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_finding_tenant_idx"
  ON "apzpen_finding" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_finding_engagement_idx"
  ON "apzpen_finding" ("engagement_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apzpen_certification_ledger" (
  "record_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "engagement_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "certified_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_cert_ledger_tenant_idx"
  ON "apzpen_certification_ledger" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_cert_ledger_engagement_idx"
  ON "apzpen_certification_ledger" ("engagement_id", "certified_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apzpen_graph_node" (
  "node_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_graph_node_tenant_idx"
  ON "apzpen_graph_node" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apzpen_graph_edge" (
  "edge_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_graph_edge_tenant_idx"
  ON "apzpen_graph_edge" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apzpen_evidence_object" (
  "object_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "document" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "apzpen_evidence_object_tenant_idx"
  ON "apzpen_evidence_object" ("tenant_id");
