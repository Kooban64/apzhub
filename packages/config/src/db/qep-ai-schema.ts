/**
 * APZQEP Phase 7 — one typed AI Proposal aggregate.
 * Not a second SoR. Existing QEP domains remain authoritative.
 */
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const qepAiProposal = pgTable(
  "qep_ai_proposal",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    environmentId: text("environment_id"),
    proposalType: varchar("proposal_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    targetId: text("target_id"),
    originalContent: jsonb("original_content").notNull(),
    reviewedContent: jsonb("reviewed_content").notNull(),
    contextRefs: jsonb("context_refs").notNull(),
    fingerprints: jsonb("fingerprints").notNull(),
    sourceAuthorised: boolean("source_authorised").notNull(),
    evidenceExtractUsed: boolean("evidence_extract_used").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    generatedBy: text("generated_by").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    decisionNote: text("decision_note"),
    resultingRecordId: text("resulting_record_id"),
    resultingRecordKind: text("resulting_record_kind"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    appIdx: index("qep_ai_proposal_app_idx").on(t.tenantId, t.applicationId),
    statusIdx: index("qep_ai_proposal_status_idx").on(t.tenantId, t.status),
  }),
);

export const qepAiSchema = {
  qepAiProposal,
};
