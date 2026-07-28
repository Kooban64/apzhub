/**
 * QEP Traceability metadata schema (APZQEP-ENG-030A Part 2, ARCH-007).
 * Platform metadata only — Trace Links are the QEP Traceability bounded
 * context's own System of Record, distinct from Requirements Relationships.
 */
import { sql } from "drizzle-orm";
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

/** Trace Link (ARCH-007) — governed cross-domain lineage edge. */
export const qepTraceLink = pgTable(
  "qep_trace_link",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    traceType: varchar("trace_type", { length: 64 }).notNull(),
    lifecycleState: varchar("lifecycle_state", { length: 32 }).notNull(),
    direction: varchar("direction", { length: 16 }).notNull(),
    strength: varchar("strength", { length: 32 }).notNull(),
    confidence: varchar("confidence", { length: 32 }).notNull(),
    origin: varchar("origin", { length: 32 }).notNull(),

    sourceKind: varchar("source_kind", { length: 64 }).notNull(),
    sourceArtefactId: text("source_artefact_id").notNull(),
    sourceContentVersionId: text("source_content_version_id"),
    sourceBaselineId: text("source_baseline_id"),
    sourceExternalUri: text("source_external_uri"),
    sourceOwningDomain: text("source_owning_domain").notNull(),

    targetKind: varchar("target_kind", { length: 64 }).notNull(),
    targetArtefactId: text("target_artefact_id").notNull(),
    targetContentVersionId: text("target_content_version_id"),
    targetBaselineId: text("target_baseline_id"),
    targetExternalUri: text("target_external_uri"),
    targetOwningDomain: text("target_owning_domain").notNull(),

    authorityKind: varchar("authority_kind", { length: 16 }).notNull(),
    authorityActorId: text("authority_actor_id").notNull(),

    provenanceActorId: text("provenance_actor_id").notNull(),
    provenanceCorrelationId: text("provenance_correlation_id").notNull(),
    provenanceSourceSystem: text("provenance_source_system"),
    provenanceImportBatchId: text("provenance_import_batch_id"),
    provenanceRationaleRef: text("provenance_rationale_ref"),

    scopeKind: varchar("scope_kind", { length: 32 }).notNull(),
    scopeReferenceId: text("scope_reference_id"),

    contextBaselineId: text("context_baseline_id"),
    contextContentVersionId: text("context_content_version_id"),
    contextImmutable: boolean("context_immutable").notNull().default(false),

    rationale: text("rationale"),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    duplicateKey: text("duplicate_key").notNull(),
    revision: integer("revision").notNull().default(1),

    successorTraceId: text("successor_trace_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    validatedBy: text("validated_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by"),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    retiredBy: text("retired_by"),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    supersededBy: text("superseded_by"),
    correlationId: text("correlation_id").notNull(),
  },
  (table) => [
    index("qep_trace_link_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_trace_link_tenant_type_idx").on(table.tenantId, table.traceType),
    index("qep_trace_link_tenant_lifecycle_idx").on(
      table.tenantId,
      table.lifecycleState,
    ),
    index("qep_trace_link_tenant_source_idx").on(
      table.tenantId,
      table.sourceKind,
      table.sourceArtefactId,
    ),
    index("qep_trace_link_tenant_target_idx").on(
      table.tenantId,
      table.targetKind,
      table.targetArtefactId,
    ),
    index("qep_trace_link_tenant_scope_idx").on(
      table.tenantId,
      table.scopeKind,
      table.scopeReferenceId,
    ),
    uniqueIndex("qep_trace_link_active_duplicate_uidx")
      .on(table.tenantId, table.duplicateKey)
      .where(sql`${table.lifecycleState} IN ('draft', 'validated', 'approved')`),
  ],
);

export const qepTraceLinkHistory = pgTable(
  "qep_trace_link_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    traceId: text("trace_id")
      .notNull()
      .references(() => qepTraceLink.id),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    sequence: integer("sequence").notNull(),
  },
  (table) => [
    uniqueIndex("qep_trace_link_history_seq_uidx").on(
      table.tenantId,
      table.traceId,
      table.sequence,
    ),
    index("qep_trace_link_history_trace_idx").on(table.tenantId, table.traceId),
  ],
);

/** Seeded normative taxonomy display metadata (tenant-scoped) — domain remains the authority. */
export const qepTraceLinkTaxonomy = pgTable(
  "qep_trace_link_taxonomy",
  {
    tenantId: text("tenant_id").notNull(),
    traceType: varchar("trace_type", { length: 64 }).notNull(),
    displayName: text("display_name").notNull(),
    description: text("description").notNull(),
    family: text("family").notNull(),
    allowedSourceKinds: jsonb("allowed_source_kinds")
      .$type<string[]>()
      .notNull()
      .default([]),
    allowedTargetKinds: jsonb("allowed_target_kinds")
      .$type<string[]>()
      .notNull()
      .default([]),
    directionDefault: varchar("direction_default", { length: 16 }).notNull(),
    symmetric: varchar("symmetric", { length: 8 }).notNull(),
    governanceClass: varchar("governance_class", { length: 32 }).notNull(),
    cyclePolicy: varchar("cycle_policy", { length: 32 }).notNull(),
    rationalePolicy: varchar("rationale_policy", { length: 32 }).notNull(),
    defaultStrength: varchar("default_strength", { length: 32 }).notNull(),
    projectionOnly: varchar("projection_only", { length: 8 }).notNull(),
    allowsSelfLink: varchar("allows_self_link", { length: 8 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qep_trace_link_taxonomy_uidx").on(table.tenantId, table.traceType),
  ],
);

export const qepTraceabilitySchema = {
  qepTraceLink,
  qepTraceLinkHistory,
  qepTraceLinkTaxonomy,
};
