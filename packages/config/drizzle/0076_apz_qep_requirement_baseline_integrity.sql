-- APZQEP-ENG-020E Part 3: baseline integrity metadata (algorithm, schema, verification).
ALTER TABLE "qep_requirement_baseline"
  ADD COLUMN IF NOT EXISTS "integrity_algorithm" varchar(32),
  ADD COLUMN IF NOT EXISTS "integrity_schema_version" varchar(64),
  ADD COLUMN IF NOT EXISTS "integrity_verification_status" varchar(32),
  ADD COLUMN IF NOT EXISTS "integrity_verified_at" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "qep_requirement_baseline"
    ADD CONSTRAINT "qep_requirement_baseline_integrity_locked_chk"
    CHECK (
      ("status" = 'draft')
      OR (
        "status" IN ('locked', 'archived')
        AND "integrity_fingerprint" IS NOT NULL
        AND "integrity_algorithm" IS NOT NULL
        AND "integrity_schema_version" IS NOT NULL
        AND "integrity_verification_status" IS NOT NULL
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
