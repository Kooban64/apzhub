-- APZSEARCH-016: Durable search publication journal (Product Indexing Orchestration)

CREATE TABLE IF NOT EXISTS "platform_search_publication_journal" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "entity_id" text NOT NULL,
  "entity_type" text NOT NULL,
  "product_id" text NOT NULL,
  "operation" varchar(32) NOT NULL,
  "payload_json" text NOT NULL,
  "payload_hash" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "attempt_count" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 5 NOT NULL,
  "next_attempt_at" timestamp with time zone,
  "last_error" text,
  "correlation_id" text NOT NULL,
  "actor_user_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_pub_journal_tenant_idx"
  ON "platform_search_publication_journal" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_pub_journal_status_idx"
  ON "platform_search_publication_journal" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_pub_journal_claim_idx"
  ON "platform_search_publication_journal" ("status", "next_attempt_at", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_pub_journal_dedupe_idx"
  ON "platform_search_publication_journal" ("tenant_id", "entity_id", "operation", "payload_hash");
