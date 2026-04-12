CREATE TABLE "access_service_realizations" (
	"user_id" text NOT NULL,
	"service_id" text NOT NULL,
	"realization_status" text NOT NULL,
	"active_job_id" uuid,
	"last_job_summary" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "access_service_realizations_user_id_service_id_pk" PRIMARY KEY("user_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "provisioning_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"job_id" uuid,
	"user_id" text,
	"correlation_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provisioning_job_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"outcome" text NOT NULL,
	"error_code" text,
	"error_message" text,
	"log_context_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "provisioning_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"service_id" text NOT NULL,
	"job_type" text NOT NULL,
	"desired_effective_role" text,
	"status" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"idempotency_key" text NOT NULL,
	"trigger_source" text NOT NULL,
	"requested_by" text,
	"correlation_id" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"manual_action_reason" text,
	"last_error_code" text,
	"last_error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"subject_label" text NOT NULL,
	"payload_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verification_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_service_realizations" ADD CONSTRAINT "access_service_realizations_active_job_id_provisioning_jobs_id_fk" FOREIGN KEY ("active_job_id") REFERENCES "public"."provisioning_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provisioning_audit_events" ADD CONSTRAINT "provisioning_audit_events_job_id_provisioning_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."provisioning_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provisioning_job_attempts" ADD CONSTRAINT "provisioning_job_attempts_job_id_provisioning_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."provisioning_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_service_realizations_active_job_idx" ON "access_service_realizations" USING btree ("active_job_id");--> statement-breakpoint
CREATE INDEX "provisioning_audit_events_job_created_idx" ON "provisioning_audit_events" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX "provisioning_audit_events_type_created_idx" ON "provisioning_audit_events" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "provisioning_job_attempts_job_idx" ON "provisioning_job_attempts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "provisioning_jobs_status_scheduled_idx" ON "provisioning_jobs" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "provisioning_jobs_user_service_idx" ON "provisioning_jobs" USING btree ("user_id","service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "provisioning_jobs_idempotency_active_unique" ON "provisioning_jobs" USING btree ("idempotency_key") WHERE "provisioning_jobs"."status" in ('queued', 'running', 'awaiting_manual');