/**
 * Zod schemas for Platform Administration HTTP API (APZADMIN-003).
 * Metadata / lifecycle only — no workbench, runtime admin, or user management.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const administrationModuleIdParamSchema = idParam("module");
export const administrationCategoryIdParamSchema = idParam("category");
export const administrationSectionIdParamSchema = idParam("section");
export const administrationActionIdParamSchema = idParam("action");
export const administrationPermissionIdParamSchema = idParam("permission");
export const administrationRegistrationIdParamSchema = idParam("registration");
export const administrationPolicyIdParamSchema = idParam("policy");
export const administrationCapabilityIdParamSchema = idParam("capability");
export const administrationNavigationIdParamSchema = idParam("navigation");
export const administrationShortcutIdParamSchema = idParam("shortcut");
export const administrationDashboardIdParamSchema = idParam("dashboard");
export const administrationWidgetIdParamSchema = idParam("widget");
export const administrationMetadataIdParamSchema = idParam("metadata");
export const administrationReferenceIdParamSchema = idParam("reference");
export const administrationAuditIdParamSchema = idParam("audit");
export const administrationHistoryIdParamSchema = idParam("history");
export const administrationDiagnosticIdParamSchema = idParam("diagnostic");

export const administrationLifecycleStatusSchema = z.enum([
  "draft",
  "registered",
  "active",
  "deprecated",
  "archived",
]);

export const administrationModuleKeySchema = z.enum([
  "identity",
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "search",
  "workflow",
  "workflow-engine",
  "notifications",
  "configuration",
  "future",
]);

export const administrationActionKindSchema = z.enum([
  "view",
  "manage",
  "configure",
  "diagnose",
  "audit",
  "maintain",
]);

export const administrationNavigationVisibilitySchema = z.enum([
  "visible",
  "hidden",
  "permission-gated",
]);

export const administrationPolicyKindSchema = z.enum([
  "access",
  "audit",
  "retention",
  "operational",
]);

export const administrationReferenceKindSchema = z.enum([
  "module",
  "capability",
  "documentation",
  "external",
]);

export const administrationWidgetKindSchema = z.enum([
  "card",
  "chart",
  "table",
  "summary",
  "metric",
]);

export const modulesListQuerySchema = paginationQuerySchema
  .extend({
    status: administrationLifecycleStatusSchema.optional(),
    key: administrationModuleKeySchema.optional(),
  })
  .strict();

export const createAdministrationModuleBodySchema = z
  .object({
    key: administrationModuleKeySchema,
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateAdministrationModuleBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    organisationId: z.string().min(1).max(128).nullable().optional(),
  })
  .strict();

export const transitionAdministrationModuleBodySchema = z
  .object({
    to: administrationLifecycleStatusSchema,
    reason: z.string().max(512).optional(),
  })
  .strict();

export const createAdministrationCategoryBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    ordering: z.number().int().optional(),
    moduleId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateAdministrationCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    ordering: z.number().int().optional(),
  })
  .strict();

export const createAdministrationSectionBodySchema = z
  .object({
    categoryId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    ordering: z.number().int().optional(),
  })
  .strict();

export const updateAdministrationSectionBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    ordering: z.number().int().optional(),
  })
  .strict();

export const createAdministrationActionBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    kind: administrationActionKindSchema,
    description: z.string().max(2000).optional(),
    moduleId: z.string().min(1).max(128).optional(),
    sectionId: z.string().min(1).max(128).optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).optional(),
  })
  .strict();

export const updateAdministrationActionBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    kind: administrationActionKindSchema.optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).nullable().optional(),
  })
  .strict();

export const createAdministrationPermissionBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const updateAdministrationPermissionBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const createAdministrationRegistrationBodySchema = z
  .object({
    moduleKey: administrationModuleKeySchema,
    version: z.string().min(1).max(64),
    notes: z.string().max(2000).optional(),
  })
  .strict();

export const updateAdministrationRegistrationBodySchema = z
  .object({
    version: z.string().min(1).max(64).optional(),
    notes: z.string().max(2000).nullable().optional(),
    status: administrationLifecycleStatusSchema.optional(),
  })
  .strict();

export const createAdministrationPolicyBodySchema = z
  .object({
    kind: administrationPolicyKindSchema,
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    moduleId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateAdministrationPolicyBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    kind: administrationPolicyKindSchema.optional(),
  })
  .strict();

export const createAdministrationCapabilityBodySchema = z
  .object({
    moduleId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    owner: z.string().min(1).max(256),
    version: z.string().min(1).max(64),
    description: z.string().max(2000).optional(),
    enabled: z.boolean().optional(),
    available: z.boolean().optional(),
    healthy: z.boolean().optional(),
    certified: z.boolean().optional(),
    productionReady: z.boolean().optional(),
    limitations: z.array(z.string().max(512)).max(50).optional(),
    documentation: z.string().max(4000).optional(),
  })
  .strict();

export const updateAdministrationCapabilityBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    enabled: z.boolean().optional(),
    available: z.boolean().optional(),
    healthy: z.boolean().optional(),
    certified: z.boolean().optional(),
    productionReady: z.boolean().optional(),
    limitations: z.array(z.string().max(512)).max(50).nullable().optional(),
    owner: z.string().min(1).max(256).optional(),
    version: z.string().min(1).max(64).optional(),
    documentation: z.string().max(4000).nullable().optional(),
  })
  .strict();

export const createAdministrationNavigationBodySchema = z
  .object({
    moduleId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    label: z.string().min(1).max(256),
    ordering: z.number().int(),
    visibility: administrationNavigationVisibilitySchema,
    categoryId: z.string().min(1).max(128).optional(),
    sectionId: z.string().min(1).max(128).optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).optional(),
    iconKey: z.string().max(128).optional(),
    routePath: z.string().max(512).optional(),
  })
  .strict();

export const updateAdministrationNavigationBodySchema = z
  .object({
    label: z.string().min(1).max(256).optional(),
    ordering: z.number().int().optional(),
    visibility: administrationNavigationVisibilitySchema.optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).nullable().optional(),
    iconKey: z.string().max(128).nullable().optional(),
    routePath: z.string().max(512).nullable().optional(),
  })
  .strict();

export const createAdministrationShortcutBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    label: z.string().min(1).max(256),
    ordering: z.number().int(),
    moduleId: z.string().min(1).max(128).optional(),
    actionId: z.string().min(1).max(128).optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).optional(),
  })
  .strict();

export const updateAdministrationShortcutBodySchema = z
  .object({
    label: z.string().min(1).max(256).optional(),
    ordering: z.number().int().optional(),
    permissionKeys: z.array(z.string().min(1).max(128)).max(50).nullable().optional(),
  })
  .strict();

export const createAdministrationDashboardBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    ordering: z.number().int().optional(),
    moduleId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateAdministrationDashboardBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    ordering: z.number().int().optional(),
  })
  .strict();

export const createAdministrationWidgetBodySchema = z
  .object({
    dashboardId: z.string().min(1).max(128).optional(),
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    kind: administrationWidgetKindSchema,
    ordering: z.number().int().optional(),
  })
  .strict();

export const updateAdministrationWidgetBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    kind: administrationWidgetKindSchema.optional(),
    ordering: z.number().int().optional(),
  })
  .strict();

export const createAdministrationMetadataBodySchema = z
  .object({
    moduleId: z.string().min(1).max(128),
    labels: z.record(z.string(), z.string()).optional(),
    tags: z.array(z.string().max(128)).max(50).optional(),
    notes: z.string().max(4000).optional(),
  })
  .strict();

export const updateAdministrationMetadataBodySchema = z
  .object({
    labels: z.record(z.string(), z.string()).nullable().optional(),
    tags: z.array(z.string().max(128)).max(50).nullable().optional(),
    notes: z.string().max(4000).nullable().optional(),
  })
  .strict();

export const createAdministrationReferenceBodySchema = z
  .object({
    moduleId: z.string().min(1).max(128),
    kind: administrationReferenceKindSchema,
    resourceId: z.string().min(1).max(256),
    label: z.string().max(256).optional(),
  })
  .strict();

export const administrationModuleScopedListQuerySchema = paginationQuerySchema
  .extend({
    moduleId: z.string().min(1).max(128),
  })
  .strict();

export const administrationAuditListQuerySchema = paginationQuerySchema
  .extend({
    moduleId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const administrationOptionalModuleListQuerySchema = paginationQuerySchema.strict();
