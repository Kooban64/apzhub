/**
 * QEP Requirements metadata schema (APZQEP-ENG-020B).
 * Platform metadata only — requirement business SoR for QEP bounded context.
 */
import { sql } from "drizzle-orm";
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

export type QepRequirementOwnerJson = {
  userId: string;
  displayName?: string;
};

export type QepRequirementAcceptanceCriteriaJson = {
  items: string[];
};

export type QepRequirementAttributesJson = {
  tags: string[];
  custom: Record<string, string>;
};

export type QepRequirementReferenceJson = {
  system: string;
  externalId: string;
  label?: string;
};

export type QepRequirementBaselineJson = {
  baselineId: string;
  label: string;
};

export type QepRequirementContentVersionSnapshotJson = Record<string, unknown>;

export const qepRequirement = pgTable(
  "qep_requirement",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    type: varchar("type", { length: 64 }).notNull(),
    status: varchar("status", { length: 64 }).notNull(),
    priority: varchar("priority", { length: 64 }).notNull(),
    category: text("category"),
    ownerJson: jsonb("owner_json").$type<QepRequirementOwnerJson>(),
    approvalState: varchar("approval_state", { length: 64 }).notNull(),
    versionMajor: integer("version_major").notNull().default(1),
    versionMinor: integer("version_minor").notNull().default(0),
    versionPatch: integer("version_patch").notNull().default(0),
    acceptanceCriteriaJson: jsonb("acceptance_criteria_json").$type<
      QepRequirementAcceptanceCriteriaJson
    >(),
    attributesJson: jsonb("attributes_json")
      .$type<QepRequirementAttributesJson>()
      .notNull()
      .default({ tags: [], custom: {} }),
    referencesJson: jsonb("references_json")
      .$type<QepRequirementReferenceJson[]>()
      .notNull()
      .default([]),
    baselineJson: jsonb("baseline_json").$type<QepRequirementBaselineJson>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by"),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("qep_requirement_tenant_key_active_uidx")
      .on(table.tenantId, table.key)
      .where(sql`${table.archivedAt} IS NULL`),
    index("qep_requirement_tenant_project_idx").on(table.tenantId, table.projectId),
    index("qep_requirement_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const qepRequirementAudit = pgTable("qep_requirement_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  requirementId: text("requirement_id").notNull(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  correlationId: text("correlation_id").notNull(),
  detailsJson: jsonb("details_json")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const qepRequirementLifecycleHistory = pgTable(
  "qep_requirement_lifecycle_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    previousState: varchar("previous_state", { length: 64 }).notNull(),
    newState: varchar("new_state", { length: 64 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    reason: text("reason"),
    comments: text("comments"),
    correlationId: text("correlation_id").notNull(),
    revision: integer("revision"),
    metadataJson: jsonb("metadata_json").$type<Record<string, string>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qep_requirement_lifecycle_history_requirement_idx").on(
      table.tenantId,
      table.requirementId,
      table.createdAt,
    ),
  ],
);

/** Append-only content history; parent requirement consistency is enforced by the service. */
export const qepRequirementContentVersion = pgTable(
  "qep_requirement_content_version",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    parentVersionNumber: integer("parent_version_number"),
    parentVersionId: text("parent_version_id"),
    snapshotJson: jsonb("snapshot_json").$type<QepRequirementContentVersionSnapshotJson>().notNull(),
    snapshotSchemaVersion: varchar("snapshot_schema_version", { length: 64 }).notNull(),
    hashAlgorithm: varchar("hash_algorithm", { length: 32 }).notNull(),
    snapshotHash: text("snapshot_hash").notNull(),
    changeReason: text("change_reason").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sourceRevision: integer("source_revision").notNull(),
    correlationId: text("correlation_id").notNull(),
  },
  (table) => [
    uniqueIndex("qep_requirement_content_version_requirement_number_uidx").on(
      table.tenantId,
      table.requirementId,
      table.versionNumber,
    ),
    index("qep_requirement_content_version_latest_idx").on(
      table.tenantId,
      table.requirementId,
      table.versionNumber,
    ),
    index("qep_requirement_content_version_id_idx").on(table.tenantId, table.id),
  ],
);

/** Configuration-management baseline; membership rows are immutable after lock. */
export const qepRequirementBaseline = pgTable(
  "qep_requirement_baseline",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    baselineNumber: integer("baseline_number").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: text("locked_by"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by"),
    integrityFingerprint: text("integrity_fingerprint"),
    integrityAlgorithm: varchar("integrity_algorithm", { length: 32 }),
    integritySchemaVersion: varchar("integrity_schema_version", { length: 64 }),
    integrityVerificationStatus: varchar("integrity_verification_status", { length: 32 }),
    integrityVerifiedAt: timestamp("integrity_verified_at", { withTimezone: true }),
    correlationId: text("correlation_id").notNull(),
  },
  (table) => [
    uniqueIndex("qep_requirement_baseline_number_uidx").on(table.tenantId, table.baselineNumber),
    index("qep_requirement_baseline_id_idx").on(table.tenantId, table.id),
    index("qep_requirement_baseline_number_idx").on(table.tenantId, table.baselineNumber),
    index("qep_requirement_baseline_history_idx").on(table.tenantId, table.createdAt),
    index("qep_requirement_baseline_status_idx").on(table.tenantId, table.status),
    index("qep_requirement_baseline_owner_idx").on(table.tenantId, table.ownerUserId),
  ],
);

export const qepRequirementBaselineItem = pgTable(
  "qep_requirement_baseline_item",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    baselineId: text("baseline_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    contentVersionId: text("content_version_id").notNull(),
    contentVersionNumber: integer("content_version_number").notNull(),
    includedBy: text("included_by").notNull(),
    includedAt: timestamp("included_at", { withTimezone: true }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("qep_requirement_baseline_item_version_uidx").on(
      table.tenantId,
      table.baselineId,
      table.contentVersionId,
    ),
    uniqueIndex("qep_requirement_baseline_item_requirement_uidx").on(
      table.tenantId,
      table.baselineId,
      table.requirementId,
    ),
    index("qep_requirement_baseline_item_baseline_idx").on(
      table.tenantId,
      table.baselineId,
      table.displayOrder,
    ),
    index("qep_requirement_baseline_item_requirement_idx").on(table.tenantId, table.requirementId),
    index("qep_requirement_baseline_item_content_version_idx").on(
      table.tenantId,
      table.contentVersionId,
    ),
  ],
);

/** Requirements Relationship Engine SoR (APZQEP-ENG-020F Part 2). */
export const qepRequirementsRelationship = pgTable(
  "qep_requirements_relationship",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    relationshipType: varchar("relationship_type", { length: 64 }).notNull(),
    lifecycleState: varchar("lifecycle_state", { length: 32 }).notNull(),
    sourceMode: varchar("source_mode", { length: 64 }).notNull(),
    sourceRequirementId: text("source_requirement_id").notNull(),
    sourceContentVersionId: text("source_content_version_id"),
    targetMode: varchar("target_mode", { length: 64 }).notNull(),
    targetRequirementId: text("target_requirement_id").notNull(),
    targetContentVersionId: text("target_content_version_id"),
    strength: varchar("strength", { length: 32 }).notNull(),
    criticality: varchar("criticality", { length: 32 }).notNull(),
    classification: varchar("classification", { length: 64 }).notNull(),
    scopeKind: varchar("scope_kind", { length: 32 }).notNull(),
    scopeReferenceId: text("scope_reference_id"),
    rationale: text("rationale"),
    duplicateKey: text("duplicate_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    activatedBy: text("activated_by"),
    deprecatedAt: timestamp("deprecated_at", { withTimezone: true }),
    deprecatedBy: text("deprecated_by"),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    retiredBy: text("retired_by"),
    correlationId: text("correlation_id").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    index("qep_req_rel_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_req_rel_tenant_type_idx").on(table.tenantId, table.relationshipType),
    index("qep_req_rel_tenant_lifecycle_idx").on(table.tenantId, table.lifecycleState),
    index("qep_req_rel_tenant_source_idx").on(table.tenantId, table.sourceRequirementId),
    index("qep_req_rel_tenant_target_idx").on(table.tenantId, table.targetRequirementId),
    index("qep_req_rel_tenant_scope_idx").on(
      table.tenantId,
      table.scopeKind,
      table.scopeReferenceId,
    ),
    index("qep_req_rel_tenant_source_cv_idx").on(
      table.tenantId,
      table.sourceContentVersionId,
    ),
    index("qep_req_rel_tenant_target_cv_idx").on(
      table.tenantId,
      table.targetContentVersionId,
    ),
    uniqueIndex("qep_req_rel_active_duplicate_uidx")
      .on(table.tenantId, table.duplicateKey)
      .where(sql`${table.lifecycleState} IN ('active', 'deprecated')`),
  ],
);

export const qepRequirementsRelationshipHistory = pgTable(
  "qep_requirements_relationship_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    relationshipId: text("relationship_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    sequence: integer("sequence").notNull(),
  },
  (table) => [
    uniqueIndex("qep_req_rel_history_seq_uidx").on(
      table.tenantId,
      table.relationshipId,
      table.sequence,
    ),
    index("qep_req_rel_history_rel_idx").on(table.tenantId, table.relationshipId),
  ],
);

/** Seeded normative taxonomy definitions (tenant-scoped for isolation). */
export const qepRequirementsRelationshipTaxonomy = pgTable(
  "qep_requirements_relationship_taxonomy",
  {
    tenantId: text("tenant_id").notNull(),
    relationshipType: varchar("relationship_type", { length: 64 }).notNull(),
    displayName: text("display_name").notNull(),
    description: text("description").notNull(),
    symmetric: varchar("symmetric", { length: 8 }).notNull(),
    inverseLabel: text("inverse_label").notNull(),
    cyclePolicy: varchar("cycle_policy", { length: 64 }).notNull(),
    rationalePolicy: varchar("rationale_policy", { length: 32 }).notNull(),
    defaultStrength: varchar("default_strength", { length: 32 }).notNull(),
    certificationRelevant: varchar("certification_relevant", { length: 32 }).notNull(),
    baselineProjectionDefault: varchar("baseline_projection_default", {
      length: 64,
    }).notNull(),
    strictTraceabilityDefault: varchar("strict_traceability_default", {
      length: 8,
    }).notNull(),
    highlightInTraceability: varchar("highlight_in_traceability", {
      length: 8,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qep_req_rel_taxonomy_uidx").on(table.tenantId, table.relationshipType),
  ],
);

export const qepRequirementsSchema = {
  qepRequirement,
  qepRequirementAudit,
  qepRequirementLifecycleHistory,
  qepRequirementContentVersion,
  qepRequirementBaseline,
  qepRequirementBaselineItem,
  qepRequirementsRelationship,
  qepRequirementsRelationshipHistory,
  qepRequirementsRelationshipTaxonomy,
};
