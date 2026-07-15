CREATE TABLE IF NOT EXISTS "platform_user_preference" (
  "preference_id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "category" text NOT NULL,
  "preference_key" text NOT NULL,
  "value" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_user_preference_user_category_key_uidx"
  ON "platform_user_preference" ("user_id", "category", "preference_key");

CREATE TABLE IF NOT EXISTS "platform_user_favorite" (
  "favorite_id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "item_type" text NOT NULL,
  "item_key" text NOT NULL,
  "label" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_user_favorite_user_item_uidx"
  ON "platform_user_favorite" ("user_id", "item_type", "item_key");

CREATE TABLE IF NOT EXISTS "platform_user_recent_item" (
  "recent_id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "item_type" text NOT NULL,
  "item_key" text NOT NULL,
  "label" text NOT NULL,
  "accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_user_recent_item_user_item_uidx"
  ON "platform_user_recent_item" ("user_id", "item_type", "item_key");

CREATE TABLE IF NOT EXISTS "platform_user_workbench_layout" (
  "user_id" text PRIMARY KEY NOT NULL,
  "layout" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "platform_user_preference"
    ADD CONSTRAINT "platform_user_preference_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_user_favorite"
    ADD CONSTRAINT "platform_user_favorite_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_user_recent_item"
    ADD CONSTRAINT "platform_user_recent_item_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "platform_user_workbench_layout"
    ADD CONSTRAINT "platform_user_workbench_layout_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
