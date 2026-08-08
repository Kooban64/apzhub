/**
 * APZQEP QX-PR-05 — Durable Orchestration SoR documents.
 * Authoritative artefacts from SYSTEM-OF-RECORD-CATALOGUE stored as typed documents.
 * Payload shapes owned by @apzhub/platform-orchestration.
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

/**
 * Generic durable document for Wave 5 orchestration artefacts.
 * artefact_kind aligns with SoR catalogue (flow_definition, flow_instance, …).
 */
export const qepQoDocument = pgTable(
  "qep_qo_document",
  {
    id: text("id").primaryKey(),
    artefactKind: varchar("artefact_kind", { length: 64 }).notNull(),
    artefactKey: text("artefact_key").notNull(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    orchestrationId: text("orchestration_id").notNull().default("orch_default"),
    correlationId: text("correlation_id"),
    status: varchar("status", { length: 64 }),
    payloadJson: jsonb("payload_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull().default("system"),
    updatedBy: text("updated_by").notNull().default("system"),
  },
  (t) => ({
    kindKeyUidx: uniqueIndex("qep_qo_document_kind_key_uidx").on(
      t.artefactKind,
      t.artefactKey,
    ),
    tenantKindIdx: index("qep_qo_document_tenant_kind_idx").on(
      t.tenantId,
      t.artefactKind,
    ),
    tenantUpdatedIdx: index("qep_qo_document_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
    correlationIdx: index("qep_qo_document_correlation_idx").on(
      t.tenantId,
      t.correlationId,
    ),
    orchKindIdx: index("qep_qo_document_orch_kind_idx").on(
      t.orchestrationId,
      t.artefactKind,
    ),
  }),
);

/** Trigger ingest idempotency (multi-instance safe). */
export const qepQoTriggerIdempotency = pgTable(
  "qep_qo_trigger_idempotency",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    triggerId: text("trigger_id").notNull(),
    seenAt: timestamp("seen_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantTriggerUidx: uniqueIndex("qep_qo_trigger_idempotency_uidx").on(
      t.tenantId,
      t.triggerId,
    ),
  }),
);

export const qepOrchestrationSchema = {
  qepQoDocument,
  qepQoTriggerIdempotency,
};
