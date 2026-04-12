CREATE TABLE "launch_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"service_id" text NOT NULL,
	"launch_method" text NOT NULL,
	"readiness_at_decision" text,
	"outcome" text NOT NULL,
	"reason_code" text,
	"user_message" text NOT NULL,
	"operator_message" text,
	"correlation_id" text DEFAULT '' NOT NULL,
	"auth_session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "launch_events_created_at_idx" ON "launch_events" USING btree ("created_at");