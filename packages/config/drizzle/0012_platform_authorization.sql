CREATE TABLE IF NOT EXISTS "platform_authorization_permission" (
  "permission_key" text PRIMARY KEY NOT NULL,
  "namespace" text NOT NULL,
  "description" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "platform_authorization_role" (
  "role_id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "scope" text NOT NULL,
  "tenant_id" text,
  "product_key" text,
  "parent_role_id" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_authorization_role_scope_uidx"
  ON "platform_authorization_role" ("slug", "scope", "tenant_id", "product_key");

CREATE TABLE IF NOT EXISTS "platform_authorization_role_permission" (
  "role_id" text NOT NULL,
  "permission_key" text NOT NULL,
  "grant_type" text DEFAULT 'allow' NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_authorization_role_permission_uidx"
  ON "platform_authorization_role_permission" ("role_id", "permission_key");

CREATE TABLE IF NOT EXISTS "platform_authorization_role_assignment" (
  "assignment_id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "role_id" text NOT NULL,
  "tenant_id" text,
  "product_key" text,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_authorization_role_assignment_uidx"
  ON "platform_authorization_role_assignment" ("user_id", "role_id", "tenant_id", "product_key");

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role"
    ADD CONSTRAINT "platform_authorization_role_tenant_id_platform_tenant_tenant_id_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "platform_tenant"("tenant_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role_assignment"
    ADD CONSTRAINT "platform_authorization_role_assignment_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role_assignment"
    ADD CONSTRAINT "platform_authorization_role_assignment_role_id_platform_authorization_role_role_id_fk"
    FOREIGN KEY ("role_id") REFERENCES "platform_authorization_role"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role_assignment"
    ADD CONSTRAINT "platform_authorization_role_assignment_tenant_id_platform_tenant_tenant_id_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "platform_tenant"("tenant_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role_permission"
    ADD CONSTRAINT "platform_authorization_role_permission_role_id_platform_authorization_role_role_id_fk"
    FOREIGN KEY ("role_id") REFERENCES "platform_authorization_role"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_authorization_role_permission"
    ADD CONSTRAINT "platform_authorization_role_permission_permission_key_platform_authorization_permission_permission_key_fk"
    FOREIGN KEY ("permission_key") REFERENCES "platform_authorization_permission"("permission_key") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
