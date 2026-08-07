import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformKnowledgeObject = pgTable(
  "platform_knowledge_object",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: jsonb("body").$type<Record<string, unknown>>().notNull().default({}),
    owner: text("owner").notNull(),
    version: integer("version").notNull().default(1),
    status: text("status").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    relatedProducts: jsonb("related_products").$type<string[]>().notNull().default([]),
    relatedCapabilities: jsonb("related_capabilities")
      .$type<string[]>()
      .notNull()
      .default([]),
    libraryCategory: text("library_category"),
    decisionRef: text("decision_ref"),
    reviewDate: timestamp("review_date", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    versionHistory: jsonb("version_history").$type<unknown[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_knowledge_object_tenant_idx").on(t.tenantId, t.kind),
    index("platform_knowledge_object_title_idx").on(t.tenantId, t.title),
  ],
);

export const platformKnowledgeMemorySchema = {
  platformKnowledgeObject,
};
