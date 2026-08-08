/**
 * APZQEP QX-PR-03 — Durable Quality Intelligence SoR.
 * PostgreSQL is the production Source of Record for Wave 3 QI artefacts.
 * Payload shapes owned by @apzhub/platform-quality-intelligence (stored as jsonb).
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const qepQiObservation = pgTable(
  "qep_qi_observation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    correlationId: text("correlation_id").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    observationJson: jsonb("observation_json")
      .$type<Record<string, unknown>>()
      .notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_qi_observation_tenant_idx").on(t.tenantId),
    tenantRecordedIdx: index("qep_qi_observation_tenant_recorded_idx").on(
      t.tenantId,
      t.recordedAt,
    ),
    correlationIdx: index("qep_qi_observation_correlation_idx").on(
      t.tenantId,
      t.correlationId,
    ),
  }),
);

export const qepQiSignal = pgTable(
  "qep_qi_signal",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
    signalJson: jsonb("signal_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("qep_qi_signal_tenant_idx").on(t.tenantId),
    tenantKindIdx: index("qep_qi_signal_tenant_kind_idx").on(t.tenantId, t.kind),
    tenantCalculatedIdx: index("qep_qi_signal_tenant_calculated_idx").on(
      t.tenantId,
      t.calculatedAt,
    ),
  }),
);

export const qepQiRecommendation = pgTable(
  "qep_qi_recommendation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    explanationId: text("explanation_id").notNull(),
    correlationId: text("correlation_id").notNull(),
    recommendationJson: jsonb("recommendation_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    revision: integer("revision").notNull().default(1),
    proposedAt: timestamp("proposed_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_qi_recommendation_tenant_idx").on(t.tenantId),
    tenantStatusIdx: index("qep_qi_recommendation_tenant_status_idx").on(
      t.tenantId,
      t.status,
    ),
    tenantUpdatedIdx: index("qep_qi_recommendation_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
    explanationIdx: index("qep_qi_recommendation_explanation_idx").on(t.explanationId),
  }),
);

export const qepQiExplanation = pgTable(
  "qep_qi_explanation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    explanationJson: jsonb("explanation_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_qi_explanation_tenant_idx").on(t.tenantId),
    tenantProviderIdx: index("qep_qi_explanation_tenant_provider_idx").on(
      t.tenantId,
      t.providerId,
    ),
  }),
);

export const qepQiScore = pgTable(
  "qep_qi_score",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    dimension: varchar("dimension", { length: 32 }).notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
    scoreJson: jsonb("score_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("qep_qi_score_tenant_idx").on(t.tenantId),
    tenantDimensionIdx: index("qep_qi_score_tenant_dimension_idx").on(
      t.tenantId,
      t.dimension,
    ),
    tenantCalculatedIdx: index("qep_qi_score_tenant_calculated_idx").on(
      t.tenantId,
      t.calculatedAt,
    ),
  }),
);

export const qepQiAudit = pgTable(
  "qep_qi_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    recommendationId: text("recommendation_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    auditJson: jsonb("audit_json").$type<Record<string, unknown>>().notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_qi_audit_tenant_idx").on(t.tenantId),
    tenantOccurredIdx: index("qep_qi_audit_tenant_occurred_idx").on(
      t.tenantId,
      t.occurredAt,
    ),
    recommendationIdx: index("qep_qi_audit_recommendation_idx").on(t.recommendationId),
  }),
);

export const qepQualityIntelligenceSchema = {
  qepQiObservation,
  qepQiSignal,
  qepQiRecommendation,
  qepQiExplanation,
  qepQiScore,
  qepQiAudit,
};
