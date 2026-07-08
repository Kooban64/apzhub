CREATE TABLE "law_calendar_event" (
	"calendar_event_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"client_id" text,
	"task_id" text,
	"document_id" text,
	"time_entry_id" text,
	"calendar_event_reference" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"event_type" varchar(32) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"court_id" text,
	"owner_user_id" text NOT NULL,
	"reminder_minutes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calendar_event_status" varchar(32) NOT NULL,
	"location" text,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_calendar_event_tenant_reference_uidx" ON "law_calendar_event" USING btree ("tenant_id","calendar_event_reference");
--> statement-breakpoint
CREATE INDEX "law_calendar_event_tenant_idx" ON "law_calendar_event" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_calendar_event_tenant_matter_idx" ON "law_calendar_event" USING btree ("tenant_id","matter_id");
--> statement-breakpoint
CREATE TABLE "law_time_entry" (
	"time_entry_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"task_id" text,
	"document_id" text,
	"time_entry_reference" varchar(64) NOT NULL,
	"user_id" text NOT NULL,
	"entry_date" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"narrative" text NOT NULL,
	"activity_code" varchar(64),
	"billable" boolean DEFAULT true NOT NULL,
	"billing_status" varchar(32) NOT NULL,
	"rate" real DEFAULT 0 NOT NULL,
	"amount" real DEFAULT 0 NOT NULL,
	"approved_by_user_id" text,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_time_entry_tenant_reference_uidx" ON "law_time_entry" USING btree ("tenant_id","time_entry_reference");
--> statement-breakpoint
CREATE INDEX "law_time_entry_tenant_idx" ON "law_time_entry" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_time_entry_tenant_matter_idx" ON "law_time_entry" USING btree ("tenant_id","matter_id");
