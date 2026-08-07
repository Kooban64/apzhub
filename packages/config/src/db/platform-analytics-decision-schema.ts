import {
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const platformAnalyticsDecisionPack = pgTable(
  "platform_analytics_decision_pack",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    questionId: text("question_id").notNull(),
    question: text("question").notNull(),
    audienceRole: text("audience_role").notNull(),
    indicators: jsonb("indicators").$type<unknown[]>().notNull().default([]),
    supportingEvidence: jsonb("supporting_evidence")
      .$type<string[]>()
      .notNull()
      .default([]),
    trendSummary: text("trend_summary").notNull(),
    recommendedActions: jsonb("recommended_actions")
      .$type<string[]>()
      .notNull()
      .default([]),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_analytics_decision_pack_tenant_idx").on(t.tenantId)],
);

export const platformAnalyticsTrendPoint = pgTable(
  "platform_analytics_trend_point",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    domain: text("domain").notNull(),
    label: text("label").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    value: doublePrecision("value").notNull(),
    unit: text("unit").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_analytics_trend_point_domain_idx").on(t.tenantId, t.domain)],
);

export const platformAnalyticsDecisionKpi = pgTable(
  "platform_analytics_decision_kpi",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    owner: text("owner").notNull(),
    targetValue: doublePrecision("target_value").notNull(),
    currentValue: doublePrecision("current_value").notNull(),
    unit: text("unit").notNull(),
    domain: text("domain").notNull(),
    status: text("status").notNull(),
    history: jsonb("history")
      .$type<{ at: string; value: number }[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_analytics_decision_kpi_tenant_idx").on(t.tenantId)],
);

export const platformAnalyticsDecisionTimeline = pgTable(
  "platform_analytics_decision_timeline",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    title: text("title").notNull(),
    decision: text("decision").notNull(),
    rationale: text("rationale").notNull(),
    decidedBy: text("decided_by").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
    evidenceRefs: jsonb("evidence_refs").$type<string[]>().notNull().default([]),
    relatedQuestionId: text("related_question_id"),
    relatedProduct: text("related_product"),
    sourceRecordRef: text("source_record_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_analytics_decision_timeline_tenant_idx").on(t.tenantId)],
);

export const platformAnalyticsDecisionSchema = {
  platformAnalyticsDecisionPack,
  platformAnalyticsTrendPoint,
  platformAnalyticsDecisionKpi,
  platformAnalyticsDecisionTimeline,
};
