import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformDeliveryAssignmentEvent = pgTable(
  "platform_delivery_assignment_event",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    assignmentId: text("assignment_id").notNull(),
    kind: text("kind").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    fromPrincipalId: text("from_principal_id"),
    toPrincipalId: text("to_principal_id"),
    note: text("note"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_delivery_assignment_event_assignment_idx").on(
      t.tenantId,
      t.assignmentId,
      t.at,
    ),
  ],
);

export const platformResponsibility = pgTable(
  "platform_responsibility",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    objectType: text("object_type").notNull(),
    objectId: text("object_id").notNull(),
    objectLabel: text("object_label").notNull(),
    dimension: text("dimension").notNull(),
    principalType: text("principal_type").notNull(),
    principalId: text("principal_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_responsibility_scope_idx").on(t.tenantId, t.scopeType, t.scopeId),
  ],
);

export const platformContinuityCase = pgTable(
  "platform_continuity_case",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    principalId: text("principal_id").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    actingOwnerUserId: text("acting_owner_user_id"),
    affectedCommitments: jsonb("affected_commitments")
      .$type<string[]>()
      .notNull()
      .default([]),
    affectedMilestones: jsonb("affected_milestones")
      .$type<string[]>()
      .notNull()
      .default([]),
    pendingDecisions: jsonb("pending_decisions")
      .$type<string[]>()
      .notNull()
      .default([]),
    openExceptions: jsonb("open_exceptions").$type<string[]>().notNull().default([]),
    agedWaitsChasing: jsonb("aged_waits_chasing")
      .$type<string[]>()
      .notNull()
      .default([]),
    recommendedReplacementRoles: jsonb("recommended_replacement_roles")
      .$type<string[]>()
      .notNull()
      .default([]),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_continuity_case_scope_idx").on(t.tenantId, t.scopeType, t.scopeId),
  ],
);

export const platformStakeholder = pgTable(
  "platform_stakeholder",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    principalType: text("principal_type").notNull(),
    principalId: text("principal_id").notNull(),
    interest: text("interest").notNull(),
    influence: text("influence").notNull().default("medium"),
    engagementCadence: text("engagement_cadence"),
    communicationPreference: text("communication_preference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_stakeholder_scope_idx").on(t.tenantId, t.scopeType, t.scopeId),
  ],
);

export const platformExternalParticipant = pgTable(
  "platform_external_participant",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    displayName: text("display_name").notNull(),
    organisation: text("organisation"),
    email: text("email"),
    linkedUserId: text("linked_user_id"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_external_participant_tenant_idx").on(t.tenantId)],
);

export const platformProjectsAccountabilitySchema = {
  platformDeliveryAssignmentEvent,
  platformResponsibility,
  platformContinuityCase,
  platformStakeholder,
  platformExternalParticipant,
};
