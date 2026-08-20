/**
 * APZQEP Phase 6 — Quality Risk, Quality Gate definition/evaluation,
 * Certification Exception. Certification itself remains F4 `qep_qo_document`.
 * Evidence, Defect, Application, and Environment remain existing SoRs.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const qepQualityRisk = pgTable(
  "qep_quality_risk",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    number: varchar("number", { length: 32 }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    severity: varchar("severity", { length: 16 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    owner: text("owner"),
    domain: text("domain"),
    impact: varchar("impact", { length: 16 }),
    likelihood: varchar("likelihood", { length: 16 }),
    waiverNote: text("waiver_note"),
    evidenceRef: text("evidence_ref"),
    legacyRiskId: text("legacy_risk_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    numberUidx: uniqueIndex("qep_quality_risk_number_uidx").on(
      t.tenantId,
      t.applicationId,
      t.number,
    ),
    appIdx: index("qep_quality_risk_app_idx").on(t.tenantId, t.applicationId),
  }),
);

export const qepQualityRiskHistory = pgTable(
  "qep_quality_risk_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    riskId: text("risk_id").notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    fromStatus: varchar("from_status", { length: 16 }),
    toStatus: varchar("to_status", { length: 16 }),
    fromSeverity: varchar("from_severity", { length: 16 }),
    toSeverity: varchar("to_severity", { length: 16 }),
    note: text("note"),
    actorId: text("actor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    riskIdx: index("qep_quality_risk_history_risk_idx").on(t.tenantId, t.riskId),
  }),
);

export const qepQualityRiskSignal = pgTable(
  "qep_quality_risk_signal",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    riskId: text("risk_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    riskIdx: index("qep_quality_risk_signal_risk_idx").on(t.tenantId, t.riskId),
  }),
);

export const qepQualityGateDefinition = pgTable(
  "qep_quality_gate_definition",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    number: varchar("number", { length: 32 }).notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    gateType: varchar("gate_type", { length: 16 }).notNull(),
    lifecycle: varchar("lifecycle", { length: 16 }).notNull(),
    version: integer("version").notNull(),
    conditionKind: varchar("condition_kind", { length: 64 }).notNull(),
    conditionOperator: varchar("condition_operator", { length: 8 }).notNull(),
    conditionValue: integer("condition_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    numberUidx: uniqueIndex("qep_quality_gate_definition_number_uidx").on(
      t.tenantId,
      t.applicationId,
      t.number,
    ),
    appIdx: index("qep_quality_gate_definition_app_idx").on(
      t.tenantId,
      t.applicationId,
    ),
  }),
);

export const qepQualityGateEvaluation = pgTable(
  "qep_quality_gate_evaluation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    gateDefinitionId: text("gate_definition_id").notNull(),
    definitionVersion: integer("definition_version").notNull(),
    definitionSnapshot: jsonb("definition_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    environmentId: text("environment_id").notNull(),
    environmentSnapshot: jsonb("environment_snapshot")
      .$type<{ id: string; name: string }>()
      .notNull(),
    changeEventId: text("change_event_id").notNull(),
    scmIdentity: jsonb("scm_identity").$type<Record<string, unknown>>(),
    factsUsed: jsonb("facts_used").$type<Record<string, unknown>>().notNull(),
    observedValue: integer("observed_value"),
    result: varchar("result", { length: 24 }).notNull(),
    reason: text("reason").notNull(),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
    evaluatedBy: text("evaluated_by").notNull(),
  },
  (t) => ({
    appIdx: index("qep_quality_gate_evaluation_app_idx").on(
      t.tenantId,
      t.applicationId,
    ),
    gateIdx: index("qep_quality_gate_evaluation_gate_idx").on(
      t.tenantId,
      t.gateDefinitionId,
    ),
    contextIdx: index("qep_quality_gate_evaluation_ctx_idx").on(
      t.tenantId,
      t.applicationId,
      t.changeEventId,
    ),
  }),
);

export const qepCertificationException = pgTable(
  "qep_certification_exception",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    environmentId: text("environment_id").notNull(),
    changeEventId: text("change_event_id").notNull(),
    gateDefinitionId: text("gate_definition_id").notNull(),
    gateEvaluationId: text("gate_evaluation_id").notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    authorisedBy: text("authorised_by").notNull(),
    authorisedAt: timestamp("authorised_at", { withTimezone: true }).notNull(),
    revokedBy: text("revoked_by"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => ({
    ctxIdx: index("qep_certification_exception_ctx_idx").on(
      t.tenantId,
      t.applicationId,
      t.changeEventId,
    ),
  }),
);

export const qepAssuranceSchema = {
  qepQualityRisk,
  qepQualityRiskHistory,
  qepQualityRiskSignal,
  qepQualityGateDefinition,
  qepQualityGateEvaluation,
  qepCertificationException,
};
