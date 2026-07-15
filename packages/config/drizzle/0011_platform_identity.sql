CREATE TABLE IF NOT EXISTS "platform_tenant" (
  "tenant_id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_tenant_slug_uidx" ON "platform_tenant" ("slug");

CREATE TABLE IF NOT EXISTS "platform_user_tenant" (
  "membership_id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "tenant_id" text NOT NULL REFERENCES "platform_tenant"("tenant_id") ON DELETE CASCADE,
  "is_primary" boolean DEFAULT false NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_user_tenant_user_tenant_uidx"
  ON "platform_user_tenant" ("user_id", "tenant_id");

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "active_tenant_id" text;
