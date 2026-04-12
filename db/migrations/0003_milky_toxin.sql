CREATE TABLE "access_subject_bundle_assignments" (
	"subject_id" text NOT NULL,
	"bundle_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "access_subject_bundle_assignments_subject_id_bundle_id_pk" PRIMARY KEY("subject_id","bundle_id")
);
--> statement-breakpoint
CREATE TABLE "access_subject_flags" (
	"subject_id" text PRIMARY KEY NOT NULL,
	"suspended" boolean,
	"bundles_from_db" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_subject_service_overrides" (
	"subject_id" text NOT NULL,
	"service_id" text NOT NULL,
	"effective_role" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "access_subject_service_overrides_subject_id_service_id_pk" PRIMARY KEY("subject_id","service_id")
);
--> statement-breakpoint
CREATE INDEX "access_subject_bundle_assignments_subject_idx" ON "access_subject_bundle_assignments" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "access_subject_flags_bundles_from_db_idx" ON "access_subject_flags" USING btree ("bundles_from_db");--> statement-breakpoint
CREATE INDEX "access_subject_service_overrides_subject_idx" ON "access_subject_service_overrides" USING btree ("subject_id");