/**
 * QEP Evidence Catalogue metadata schema — APZQEP-120-S05.
 * PostgreSQL is the first durable persistence implementation for the Evidence Catalogue.
 * Content bytes remain behind the Storage Platform (S03); integrity policy remains S04.
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

export type QepEvidenceHistoryEntryJson = {
  sequence: number;
  command: string;
  actorId: string;
  occurredAt: string;
  summary: string;
  fromStatus?: string;
  toStatus?: string;
};

export type QepEvidenceProvenanceJson = {
  kind: string;
  occurredAt: string;
  actorId: string;
  detail?: string;
};

export type QepEvidencePolicyRefJson = {
  policyId: string;
  policyKind: string;
};

/** Logical catalogue record — not blob storage. */
export const qepEvidence = pgTable(
  "qep_evidence",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    workspaceId: text("workspace_id"),
    status: varchar("status", { length: 64 }).notNull(),
    catalogueState: varchar("catalogue_state", { length: 32 })
      .notNull()
      .default("ACTIVE"),
    sourceKind: varchar("source_kind", { length: 64 }).notNull(),
    sourceSystemId: text("source_system_id"),
    classificationCategory: varchar("classification_category", { length: 64 }),
    classificationSensitivityLabel: text("classification_sensitivity_label"),
    mediaType: text("media_type"),
    byteSize: integer("byte_size"),
    contentHash: text("content_hash"),
    hashAlgorithm: varchar("hash_algorithm", { length: 32 }),
    storageLocator: text("storage_locator"),
    storageProviderKind: varchar("storage_provider_kind", { length: 32 }),
    integrityVerificationState: varchar("integrity_verification_state", {
      length: 32,
    }),
    integritySealed: boolean("integrity_sealed"),
    integrityLastVerifiedAt: timestamp("integrity_last_verified_at", {
      withTimezone: true,
    }),
    ownerId: text("owner_id").notNull(),
    retentionClass: text("retention_class").notNull(),
    retainUntil: timestamp("retain_until", { withTimezone: true }),
    legalHold: boolean("legal_hold").notNull().default(false),
    holdReason: text("hold_reason"),
    title: text("title"),
    description: text("description"),
    tagsJson: jsonb("tags_json").$type<string[]>().notNull().default([]),
    policyReferencesJson: jsonb("policy_references_json")
      .$type<QepEvidencePolicyRefJson[]>()
      .notNull()
      .default([]),
    version: integer("version").notNull().default(1),
    dispositionedAt: timestamp("dispositioned_at", { withTimezone: true }),
    dispositionedBy: text("dispositioned_by"),
    dispositionReason: text("disposition_reason"),
    dispositionMethod: text("disposition_method"),
    provenanceJson: jsonb("provenance_json")
      .$type<QepEvidenceProvenanceJson[]>()
      .notNull()
      .default([]),
    relationshipIdsJson: jsonb("relationship_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    sealedAt: timestamp("sealed_at", { withTimezone: true }),
    sealedBy: text("sealed_by"),
    lifecycleGovernanceJson: jsonb("lifecycle_governance_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    historyJson: jsonb("history_json")
      .$type<QepEvidenceHistoryEntryJson[]>()
      .notNull()
      .default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    index("qep_evidence_tenant_project_idx").on(table.tenantId, table.projectId),
    index("qep_evidence_tenant_status_idx").on(table.tenantId, table.status),
    index("qep_evidence_tenant_catalogue_state_idx").on(
      table.tenantId,
      table.catalogueState,
    ),
    index("qep_evidence_tenant_owner_idx").on(table.tenantId, table.ownerId),
    index("qep_evidence_tenant_classification_idx").on(
      table.tenantId,
      table.classificationCategory,
    ),
    index("qep_evidence_tenant_updated_idx").on(table.tenantId, table.updatedAt),
    index("qep_evidence_tenant_storage_locator_idx").on(
      table.tenantId,
      table.storageLocator,
    ),
  ],
);

export const qepEvidenceVersion = pgTable(
  "qep_evidence_version",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    evidenceId: text("evidence_id")
      .notNull()
      .references(() => qepEvidence.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    mediaType: text("media_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    contentHash: text("content_hash").notNull(),
    hashAlgorithm: varchar("hash_algorithm", { length: 32 }).notNull(),
    storageLocator: text("storage_locator").notNull(),
    integrityVerificationState: varchar("integrity_verification_state", {
      length: 32,
    }).notNull(),
    integritySealed: boolean("integrity_sealed").notNull().default(false),
    integrityLastVerifiedAt: timestamp("integrity_last_verified_at", {
      withTimezone: true,
    }),
    replacedAt: timestamp("replaced_at", { withTimezone: true }).notNull(),
    replacedBy: text("replaced_by").notNull(),
  },
  (table) => [
    uniqueIndex("qep_evidence_version_uidx").on(
      table.tenantId,
      table.evidenceId,
      table.version,
    ),
    index("qep_evidence_version_evidence_idx").on(table.tenantId, table.evidenceId),
  ],
);

export const qepEvidenceRelationship = pgTable(
  "qep_evidence_relationship",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    evidenceId: text("evidence_id")
      .notNull()
      .references(() => qepEvidence.id, { onDelete: "cascade" }),
    targetCapability: varchar("target_capability", { length: 128 }).notNull(),
    targetId: text("target_id").notNull(),
    relationType: varchar("relation_type", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("qep_evidence_relationship_link_uidx").on(
      table.tenantId,
      table.evidenceId,
      table.targetCapability,
      table.targetId,
      table.relationType,
    ),
    index("qep_evidence_relationship_evidence_idx").on(
      table.tenantId,
      table.evidenceId,
    ),
    index("qep_evidence_relationship_target_idx").on(
      table.tenantId,
      table.targetCapability,
      table.targetId,
    ),
  ],
);

export const qepEvidenceAudit = pgTable(
  "qep_evidence_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    evidenceId: text("evidence_id").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id").notNull(),
    outcome: varchar("outcome", { length: 16 }).notNull(),
    correlationId: text("correlation_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    detailsJson: jsonb("details_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
  },
  (table) => [
    index("qep_evidence_audit_evidence_idx").on(table.tenantId, table.evidenceId),
    index("qep_evidence_audit_occurred_idx").on(table.tenantId, table.occurredAt),
  ],
);

export const qepEvidenceCollection = pgTable(
  "qep_evidence_collection",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    name: text("name").notNull(),
    purpose: text("purpose").notNull(),
    status: varchar("status", { length: 64 }).notNull(),
    memberEvidenceIdsJson: jsonb("member_evidence_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    sealedSetId: text("sealed_set_id"),
    revision: integer("revision").notNull().default(1),
    historyJson: jsonb("history_json")
      .$type<QepEvidenceHistoryEntryJson[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    index("qep_evidence_collection_tenant_project_idx").on(
      table.tenantId,
      table.projectId,
    ),
  ],
);

export const qepEvidenceSet = pgTable(
  "qep_evidence_set",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    sourceCollectionId: text("source_collection_id").notNull(),
    memberEvidenceIdsJson: jsonb("member_evidence_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    sealHash: text("seal_hash").notNull(),
    sealedAt: timestamp("sealed_at", { withTimezone: true }).notNull(),
    sealedBy: text("sealed_by").notNull(),
    purpose: text("purpose").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    index("qep_evidence_set_collection_idx").on(
      table.tenantId,
      table.sourceCollectionId,
    ),
  ],
);

export const qepEvidenceAccessGrant = pgTable(
  "qep_evidence_access_grant",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    evidenceId: text("evidence_id"),
    scope: text("scope"),
    principalId: text("principal_id").notNull(),
    action: text("action").notNull(),
    effect: varchar("effect", { length: 16 }).notNull().default("allow"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("qep_evidence_access_grant_principal_idx").on(
      table.tenantId,
      table.principalId,
    ),
    index("qep_evidence_access_grant_evidence_idx").on(
      table.tenantId,
      table.evidenceId,
    ),
  ],
);

/** Append-only lifecycle transition history — APZQEP-120-S06. */
export const qepEvidenceLifecycleHistory = pgTable(
  "qep_evidence_lifecycle_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    evidenceId: text("evidence_id").notNull(),
    projectId: text("project_id"),
    workspaceId: text("workspace_id"),
    sourceState: varchar("source_state", { length: 32 }).notNull(),
    targetState: varchar("target_state", { length: 32 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    reasonCode: varchar("reason_code", { length: 64 }).notNull(),
    reasonText: text("reason_text"),
    actorId: text("actor_id").notNull(),
    actorType: varchar("actor_type", { length: 32 }).notNull().default("user"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    correlationId: text("correlation_id"),
    causationId: text("causation_id"),
    revisionBefore: integer("revision_before"),
    revisionAfter: integer("revision_after"),
    policyDecisionJson: jsonb("policy_decision_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
  },
  (table) => [
    index("qep_evidence_lifecycle_history_evidence_idx").on(
      table.tenantId,
      table.evidenceId,
      table.occurredAt,
    ),
    index("qep_evidence_lifecycle_history_tenant_occurred_idx").on(
      table.tenantId,
      table.occurredAt,
    ),
  ],
);

export const qepEvidenceSchema = {
  qepEvidence,
  qepEvidenceVersion,
  qepEvidenceRelationship,
  qepEvidenceAudit,
  qepEvidenceCollection,
  qepEvidenceSet,
  qepEvidenceAccessGrant,
  qepEvidenceLifecycleHistory,
};
