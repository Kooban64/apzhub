-- Stream 6 IAM Completion — unify SoR extensions (no third IAM store)
-- Employment descriptive attributes; role-assignment provenance source;
-- team→role bindings; durable product assignment tables.

ALTER TABLE "platform_iam_employment"
  ADD COLUMN IF NOT EXISTS "staff_function_key" text;
--> statement-breakpoint
ALTER TABLE "platform_iam_employment"
  ADD COLUMN IF NOT EXISTS "job_title" text;
--> statement-breakpoint
ALTER TABLE "platform_iam_employment"
  ADD COLUMN IF NOT EXISTS "manager_user_id" text;
--> statement-breakpoint

ALTER TABLE "platform_authorization_role_assignment"
  ADD COLUMN IF NOT EXISTS "source_kind" text NOT NULL DEFAULT 'direct';
--> statement-breakpoint
ALTER TABLE "platform_authorization_role_assignment"
  ADD COLUMN IF NOT EXISTS "source_id" text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE "platform_authorization_role_assignment"
  SET "source_id" = '' WHERE "source_id" IS NULL;
--> statement-breakpoint

DROP INDEX IF EXISTS "platform_authorization_role_assignment_uidx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_authorization_role_assignment_uidx"
  ON "platform_authorization_role_assignment" (
    "user_id",
    "role_id",
    "tenant_id",
    "product_key",
    "source_kind",
    "source_id"
  );
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_authorization_team_role" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "team_id" text NOT NULL,
  "role_id" text NOT NULL,
  "product_key" text,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_authorization_team_role_uidx"
  ON "platform_authorization_team_role" ("tenant_id", "team_id", "role_id", "product_key");
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "platform_authorization_team_role"
    ADD CONSTRAINT "platform_authorization_team_role_tenant_id_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "platform_tenant"("tenant_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "platform_authorization_team_role"
    ADD CONSTRAINT "platform_authorization_team_role_role_id_fk"
    FOREIGN KEY ("role_id") REFERENCES "platform_authorization_role"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_product_org_subscription" (
  "id" text PRIMARY KEY NOT NULL,
  "organisation_id" text NOT NULL,
  "product_key" text NOT NULL,
  "plan_id" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_product_org_subscription_uidx"
  ON "platform_product_org_subscription" ("organisation_id", "product_key");
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "platform_product_org_subscription"
    ADD CONSTRAINT "platform_product_org_subscription_org_fk"
    FOREIGN KEY ("organisation_id") REFERENCES "platform_tenant"("tenant_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_product_user_grant" (
  "id" text PRIMARY KEY NOT NULL,
  "organisation_id" text NOT NULL,
  "user_id" text NOT NULL,
  "product_key" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_product_user_grant_uidx"
  ON "platform_product_user_grant" ("organisation_id", "user_id", "product_key");
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "platform_product_user_grant"
    ADD CONSTRAINT "platform_product_user_grant_org_fk"
    FOREIGN KEY ("organisation_id") REFERENCES "platform_tenant"("tenant_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "platform_product_user_grant"
    ADD CONSTRAINT "platform_product_user_grant_user_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
