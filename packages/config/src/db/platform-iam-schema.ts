/**
 * Platform Identity Administration metadata schema (APZIDENTITY-001).
 * Distinct from Authentication scaffolding (platform_tenant / platform_user_tenant).
 * Metadata only — no credentials, sessions, tokens, or provisioning.
 */
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformIamUser = pgTable("platform_iam_user", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  authSubjectRef: text("auth_subject_ref"),
  email: text("email"),
  displayName: text("display_name").notNull(),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  revision: integer("revision").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamGroup = pgTable(
  "platform_iam_group",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_group_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformIamRole = pgTable(
  "platform_iam_role",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_role_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformIamPermissionAssignment = pgTable(
  "platform_iam_permission_assignment",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    subjectKind: varchar("subject_kind", { length: 64 }).notNull(),
    subjectId: text("subject_id").notNull(),
    permissionKey: text("permission_key").notNull(),
    roleId: text("role_id"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const platformIamOrganization = pgTable(
  "platform_iam_organization",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_organization_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformIamTenant = pgTable(
  "platform_iam_tenant",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("platform_iam_tenant_key_uidx").on(table.key)],
);

export const platformIamDepartment = pgTable(
  "platform_iam_department",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_department_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformIamPosition = pgTable(
  "platform_iam_position",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_position_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformIamEmployment = pgTable("platform_iam_employment", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id").notNull(),
  organisationId: text("organisation_id").notNull(),
  departmentId: text("department_id"),
  positionId: text("position_id"),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamServiceAssignment = pgTable("platform_iam_service_assignment", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  subjectKind: varchar("subject_kind", { length: 64 }).notNull(),
  subjectId: text("subject_id").notNull(),
  serviceCapability: varchar("service_capability", { length: 64 }).notNull(),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamMembership = pgTable("platform_iam_membership", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id").notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  targetId: text("target_id").notNull(),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamInvitation = pgTable("platform_iam_invitation", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  email: text("email").notNull(),
  invitedUserId: text("invited_user_id"),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  expiresAt: text("expires_at"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamActivation = pgTable("platform_iam_activation", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id").notNull(),
  activatedAt: text("activated_at").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamDeactivation = pgTable("platform_iam_deactivation", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id").notNull(),
  deactivatedAt: text("deactivated_at").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamStatus = pgTable("platform_iam_status", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  subjectKind: varchar("subject_kind", { length: 64 }).notNull(),
  subjectId: text("subject_id").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  effectiveAt: text("effective_at").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamPolicy = pgTable(
  "platform_iam_policy",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_iam_policy_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformIamAudit = pgTable("platform_iam_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id"),
  action: varchar("action", { length: 64 }).notNull(),
  actorUserId: text("actor_user_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamHistory = pgTable("platform_iam_history", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id"),
  summary: text("summary").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamReference = pgTable("platform_iam_reference", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id"),
  kind: varchar("kind", { length: 64 }).notNull(),
  target: text("target").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamMetadata = pgTable("platform_iam_metadata", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  userId: text("user_id"),
  key: text("key").notNull(),
  value: text("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformIamSchema = {
  platformIamUser,
  platformIamGroup,
  platformIamRole,
  platformIamPermissionAssignment,
  platformIamOrganization,
  platformIamTenant,
  platformIamDepartment,
  platformIamPosition,
  platformIamEmployment,
  platformIamServiceAssignment,
  platformIamMembership,
  platformIamInvitation,
  platformIamActivation,
  platformIamDeactivation,
  platformIamStatus,
  platformIamPolicy,
  platformIamAudit,
  platformIamHistory,
  platformIamReference,
  platformIamMetadata,
};
