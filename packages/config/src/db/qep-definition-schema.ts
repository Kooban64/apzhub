/**
 * APZQEP Phase 2 — User Story + Acceptance Criterion SoR.
 * Requirement remains qep_requirement. Legacy JSON is archive/compat only.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const qepUserStory = pgTable(
  "qep_user_story",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    storyKey: varchar("story_key", { length: 32 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    storyType: varchar("story_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    priority: varchar("priority", { length: 32 }).notNull(),
    estimatePoints: integer("estimate_points"),
    ownerUserId: text("owner_user_id"),
    originType: varchar("origin_type", { length: 32 }).notNull(),
    originReference: text("origin_reference"),
    acceptedBy: text("accepted_by"),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by"),
  },
  (t) => ({
    tenantAppKeyUidx: uniqueIndex("qep_user_story_tenant_app_key_uidx").on(
      t.tenantId,
      t.applicationId,
      t.storyKey,
    ),
    tenantReqIdx: index("qep_user_story_tenant_requirement_idx").on(
      t.tenantId,
      t.requirementId,
    ),
    tenantAppIdx: index("qep_user_story_tenant_application_idx").on(
      t.tenantId,
      t.applicationId,
    ),
  }),
);

export const qepAcceptanceCriterion = pgTable(
  "qep_acceptance_criterion",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    userStoryId: text("user_story_id"),
    criterionKey: varchar("criterion_key", { length: 32 }).notNull(),
    text: text("text").notNull(),
    required: boolean("required").notNull().default(true),
    status: varchar("status", { length: 32 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    originType: varchar("origin_type", { length: 32 }).notNull(),
    originReference: text("origin_reference"),
    acceptedBy: text("accepted_by"),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    legacySourceKind: varchar("legacy_source_kind", { length: 64 }),
    legacySourceIndex: integer("legacy_source_index"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by"),
  },
  (t) => ({
    tenantAppKeyUidx: uniqueIndex("qep_acceptance_criterion_tenant_app_key_uidx").on(
      t.tenantId,
      t.applicationId,
      t.criterionKey,
    ),
    legacySourceUidx: uniqueIndex("qep_acceptance_criterion_legacy_source_uidx")
      .on(t.tenantId, t.requirementId, t.legacySourceKind, t.legacySourceIndex)
      .where(sql`${t.legacySourceKind} IS NOT NULL`),
    tenantReqIdx: index("qep_acceptance_criterion_tenant_requirement_idx").on(
      t.tenantId,
      t.requirementId,
    ),
    tenantStoryIdx: index("qep_acceptance_criterion_tenant_story_idx").on(
      t.tenantId,
      t.userStoryId,
    ),
  }),
);

export const qepAcceptanceCriterionVerification = pgTable(
  "qep_acceptance_criterion_verification",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    criterionId: text("criterion_id").notNull(),
    assetKind: varchar("asset_kind", { length: 64 }).notNull(),
    assetId: text("asset_id").notNull(),
    latestResult: varchar("latest_result", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    criterionAssetUidx: uniqueIndex("qep_ac_verification_criterion_asset_uidx").on(
      t.criterionId,
      t.assetKind,
      t.assetId,
    ),
    tenantCriterionIdx: index("qep_ac_verification_tenant_criterion_idx").on(
      t.tenantId,
      t.criterionId,
    ),
  }),
);

export const qepDefinitionKeyCounter = pgTable(
  "qep_definition_key_counter",
  {
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    nextValue: integer("next_value").notNull(),
  },
  (t) => ({
    pk: uniqueIndex("qep_definition_key_counter_pk").on(
      t.tenantId,
      t.applicationId,
      t.kind,
    ),
  }),
);

export const qepDefinitionSchema = {
  qepUserStory,
  qepAcceptanceCriterion,
  qepAcceptanceCriterionVerification,
  qepDefinitionKeyCounter,
};
