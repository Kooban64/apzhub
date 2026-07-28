/**
 * QEP Test Specifications metadata schema (APZQEP-ENG-050B, ARCH-011).
 * Platform metadata SoR for Test Specification aggregates — domain rules remain
 * in `@apzhub/qep-test-specifications`.
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

export const qepTestSpecification = pgTable(
  "qep_test_specifications",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    number: text("number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    objective: text("objective").notNull(),
    scope: text("scope").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    type: varchar("type", { length: 64 }).notNull(),
    priority: varchar("priority", { length: 16 }).notNull(),
    complexity: varchar("complexity", { length: 16 }).notNull(),
    classification: text("classification").notNull(),
    owner: text("owner").notNull(),
    author: text("author").notNull(),
    reviewer: text("reviewer"),
    majorVersion: integer("major_version").notNull().default(0),
    minorVersion: integer("minor_version").notNull().default(1),
    versionLabel: varchar("version_label", { length: 32 }).notNull(),
    isAuthoritative: boolean("is_authoritative").notNull().default(false),
    preconditionsJson: jsonb("preconditions_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    postconditionsJson: jsonb("postconditions_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    acceptanceCriteriaJson: jsonb("acceptance_criteria_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    risksJson: jsonb("risks_json")
      .$type<Array<{ id: string; summary: string; severity?: string }>>()
      .notNull()
      .default([]),
    dependenciesJson: jsonb("dependencies_json")
      .$type<
        Array<{
          id: string;
          summary: string;
          referenceKind?: string;
          referenceId?: string;
        }>
      >()
      .notNull()
      .default([]),
    tagsJson: jsonb("tags_json").$type<string[]>().notNull().default([]),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    predecessorSpecificationId: text("predecessor_specification_id"),
    successorSpecificationId: text("successor_specification_id"),
    comparisonNotes: text("comparison_notes"),
    approvalDecision: varchar("approval_decision", { length: 16 }),
    approvalDecidedAt: timestamp("approval_decided_at", { withTimezone: true }),
    approvalDecidedBy: text("approval_decided_by"),
    approvalReviewComment: text("approval_review_comment"),
    approvalApprovalComment: text("approval_approval_comment"),
    revision: integer("revision").notNull().default(1),
    reviewStartedAt: timestamp("review_started_at", { withTimezone: true }),
    reviewStartedBy: text("review_started_by"),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    versionLineageJson: jsonb("version_lineage_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    correlationId: text("correlation_id").notNull(),
  },
  (table) => [
    index("qep_test_specifications_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_test_specifications_tenant_status_idx").on(table.tenantId, table.status),
    index("qep_test_specifications_tenant_number_idx").on(table.tenantId, table.number),
    index("qep_test_specifications_tenant_owner_idx").on(table.tenantId, table.owner),
    index("qep_test_specifications_tenant_class_idx").on(
      table.tenantId,
      table.classification,
    ),
    index("qep_test_specifications_tenant_auth_idx").on(
      table.tenantId,
      table.isAuthoritative,
    ),
  ],
);

export const qepTestSpecificationVersion = pgTable(
  "qep_test_specification_versions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    specificationId: text("specification_id")
      .notNull()
      .references(() => qepTestSpecification.id),
    specificationNumber: text("specification_number").notNull(),
    majorVersion: integer("major_version").notNull(),
    minorVersion: integer("minor_version").notNull(),
    versionLabel: varchar("version_label", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    isAuthoritative: boolean("is_authoritative").notNull().default(false),
    predecessorSpecificationId: text("predecessor_specification_id"),
    successorSpecificationId: text("successor_specification_id"),
    comparisonNotes: text("comparison_notes"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    uniqueIndex("qep_test_specification_versions_lineage_uidx").on(
      table.tenantId,
      table.specificationNumber,
      table.versionLabel,
    ),
    index("qep_test_specification_versions_tenant_number_idx").on(
      table.tenantId,
      table.specificationNumber,
    ),
  ],
);

export const qepTestSpecificationRelationship = pgTable(
  "qep_test_specification_relationships",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    specificationId: text("specification_id")
      .notNull()
      .references(() => qepTestSpecification.id),
    kind: varchar("kind", { length: 64 }).notNull(),
    artefactId: text("artefact_id").notNull(),
    owningDomain: text("owning_domain"),
    label: text("label"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    uniqueIndex("qep_test_specification_relationships_uidx").on(
      table.tenantId,
      table.specificationId,
      table.kind,
      table.artefactId,
    ),
    index("qep_test_specification_relationships_spec_idx").on(
      table.tenantId,
      table.specificationId,
    ),
  ],
);

export const qepTestSpecificationHistory = pgTable(
  "qep_test_specification_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    specificationId: text("specification_id")
      .notNull()
      .references(() => qepTestSpecification.id),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    sequence: integer("sequence").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("qep_test_specification_history_seq_uidx").on(
      table.tenantId,
      table.specificationId,
      table.sequence,
    ),
    index("qep_test_specification_history_spec_idx").on(
      table.tenantId,
      table.specificationId,
    ),
  ],
);

export const qepTestSpecificationsSchema = {
  qepTestSpecification,
  qepTestSpecificationVersion,
  qepTestSpecificationRelationship,
  qepTestSpecificationHistory,
};
