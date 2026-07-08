CREATE TABLE "law_document" (
	"document_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"client_id" text,
	"document_reference" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"document_type" varchar(32) NOT NULL,
	"document_status" varchar(32) NOT NULL,
	"document_category_id" varchar(64) NOT NULL,
	"folder_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"created_by_user_id" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_document_tenant_reference_uidx" ON "law_document" USING btree ("tenant_id","document_reference");
--> statement-breakpoint
CREATE INDEX "law_document_tenant_idx" ON "law_document" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_document_tenant_matter_idx" ON "law_document" USING btree ("tenant_id","matter_id");
--> statement-breakpoint
CREATE TABLE "law_task" (
	"task_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"client_id" text,
	"document_id" text,
	"task_reference" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"task_status" varchar(32) NOT NULL,
	"task_priority" varchar(32) NOT NULL,
	"assignee_user_id" text NOT NULL,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"workflow_step_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"archived_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_task_tenant_reference_uidx" ON "law_task" USING btree ("tenant_id","task_reference");
--> statement-breakpoint
CREATE INDEX "law_task_tenant_idx" ON "law_task" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_task_tenant_matter_idx" ON "law_task" USING btree ("tenant_id","matter_id");
--> statement-breakpoint
CREATE INDEX "law_task_tenant_document_idx" ON "law_task" USING btree ("tenant_id","document_id");
