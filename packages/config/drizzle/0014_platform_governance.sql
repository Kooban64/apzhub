CREATE TABLE IF NOT EXISTS "platform_capability" (
  "capability_id" text PRIMARY KEY NOT NULL,
  "capability_key" text NOT NULL,
  "capability_type" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "version" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_capability_key_uidx"
  ON "platform_capability" ("capability_key");

CREATE TABLE IF NOT EXISTS "platform_capability_dependency" (
  "dependency_id" text PRIMARY KEY NOT NULL,
  "capability_id" text NOT NULL,
  "depends_on_capability_key" text NOT NULL,
  "dependency_type" text DEFAULT 'required' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_capability_dependency_pair_uidx"
  ON "platform_capability_dependency" ("capability_id", "depends_on_capability_key");

CREATE TABLE IF NOT EXISTS "platform_governance_enablement" (
  "enablement_id" text PRIMARY KEY NOT NULL,
  "scope_type" text NOT NULL,
  "scope_key" text DEFAULT '' NOT NULL,
  "target_type" text NOT NULL,
  "target_key" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_governance_enablement_scope_target_uidx"
  ON "platform_governance_enablement" ("scope_type", "scope_key", "target_type", "target_key");

CREATE TABLE IF NOT EXISTS "platform_provisioning_record" (
  "provisioning_id" text PRIMARY KEY NOT NULL,
  "scope_type" text NOT NULL,
  "scope_key" text NOT NULL,
  "target_type" text NOT NULL,
  "target_key" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "message" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "platform_feature_flag" (
  "flag_key" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "default_enabled" boolean DEFAULT false NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "platform_feature_flag_override" (
  "override_id" text PRIMARY KEY NOT NULL,
  "flag_key" text NOT NULL,
  "scope_type" text NOT NULL,
  "scope_key" text DEFAULT '' NOT NULL,
  "enabled" boolean NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_feature_flag_override_scope_uidx"
  ON "platform_feature_flag_override" ("flag_key", "scope_type", "scope_key");

DO $$ BEGIN
  ALTER TABLE "platform_capability_dependency"
    ADD CONSTRAINT "platform_capability_dependency_capability_id_fk"
    FOREIGN KEY ("capability_id") REFERENCES "platform_capability"("capability_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_feature_flag_override"
    ADD CONSTRAINT "platform_feature_flag_override_flag_key_fk"
    FOREIGN KEY ("flag_key") REFERENCES "platform_feature_flag"("flag_key") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
