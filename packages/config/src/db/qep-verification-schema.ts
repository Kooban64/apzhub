/**
 * QEP Verification metadata schema (APZQEP-ENG-040B Part 2, ARCH-009).
 * Platform metadata only — Verifications are the QEP Verification bounded
 * context's own System of Record: governed decision records over artefacts
 * owned by other bounded contexts (requirements, trace links, test cases, etc).
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Verification (ARCH-009) — governed decision record over an artefact. */
export const qepVerification = pgTable(
  "qep_verification",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    outcome: varchar("outcome", { length: 32 }),

    subjectKind: varchar("subject_kind", { length: 64 }).notNull(),
    subjectArtefactId: text("subject_artefact_id").notNull(),
    subjectContentVersionId: text("subject_content_version_id"),
    subjectBaselineId: text("subject_baseline_id"),
    subjectExternalUri: text("subject_external_uri"),
    subjectOwningDomain: text("subject_owning_domain").notNull(),

    authorityKind: varchar("authority_kind", { length: 32 }).notNull(),
    authorityActorId: text("authority_actor_id").notNull(),

    contextBaselineId: text("context_baseline_id"),
    contextContentVersionId: text("context_content_version_id"),
    contextImmutable: boolean("context_immutable").notNull().default(false),

    scopeKind: varchar("scope_kind", { length: 32 }).notNull(),
    scopeReferenceId: text("scope_reference_id"),

    priority: varchar("priority", { length: 16 }).notNull(),
    origin: varchar("origin", { length: 32 }).notNull(),

    rationale: text("rationale"),
    reason: text("reason"),
    comment: text("comment"),
    resultSummary: text("result_summary"),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    decisionOutcome: varchar("decision_outcome", { length: 32 }),
    decisionAt: timestamp("decision_at", { withTimezone: true }),
    decisionBy: text("decision_by"),
    decisionRationale: text("decision_rationale"),
    decisionComment: text("decision_comment"),

    revision: integer("revision").notNull().default(1),

    assignedTo: text("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    startedBy: text("started_by"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: text("completed_by"),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    supersededBy: text("superseded_by"),
    successorVerificationId: text("successor_verification_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    correlationId: text("correlation_id").notNull(),
  },
  (table) => [
    index("qep_verification_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_verification_tenant_status_idx").on(table.tenantId, table.status),
    index("qep_verification_tenant_outcome_idx").on(table.tenantId, table.outcome),
    index("qep_verification_tenant_subject_idx").on(
      table.tenantId,
      table.subjectKind,
      table.subjectArtefactId,
    ),
    index("qep_verification_tenant_authority_idx").on(
      table.tenantId,
      table.authorityKind,
      table.authorityActorId,
    ),
    index("qep_verification_tenant_scope_idx").on(
      table.tenantId,
      table.scopeKind,
      table.scopeReferenceId,
    ),
  ],
);

export const qepVerificationHistory = pgTable(
  "qep_verification_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    verificationId: text("verification_id")
      .notNull()
      .references(() => qepVerification.id),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    sequence: integer("sequence").notNull(),
  },
  (table) => [
    uniqueIndex("qep_verification_history_seq_uidx").on(
      table.tenantId,
      table.verificationId,
      table.sequence,
    ),
    index("qep_verification_history_verification_idx").on(
      table.tenantId,
      table.verificationId,
    ),
  ],
);

export const qepVerificationSchema = {
  qepVerification,
  qepVerificationHistory,
};
