CREATE TABLE "law_client" (
	"client_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_reference" varchar(64) NOT NULL,
	"display_name" text NOT NULL,
	"client_type" varchar(32) NOT NULL,
	"status" varchar(32) NOT NULL,
	"primary_contact_id" text,
	"billing_address_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_client_tenant_reference_uidx" ON "law_client" USING btree ("tenant_id","client_reference");
--> statement-breakpoint
CREATE INDEX "law_client_tenant_idx" ON "law_client" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_matter" (
	"matter_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" text NOT NULL,
	"matter_reference" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"matter_type_id" varchar(64) NOT NULL,
	"matter_status" varchar(32) NOT NULL,
	"practice_area_id" varchar(64) NOT NULL,
	"priority" varchar(32) NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"court_id" text,
	"judge_id" text,
	"lead_attorney_id" text NOT NULL,
	"team_member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_matter_tenant_reference_uidx" ON "law_matter" USING btree ("tenant_id","matter_reference");
--> statement-breakpoint
CREATE INDEX "law_matter_tenant_idx" ON "law_matter" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_matter_tenant_client_idx" ON "law_matter" USING btree ("tenant_id","client_id");
--> statement-breakpoint
CREATE TABLE "law_outbox_event" (
	"outbox_event_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"aggregate_type" varchar(64) NOT NULL,
	"aggregate_id" text NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "law_outbox_event_tenant_idx" ON "law_outbox_event" USING btree ("tenant_id");
