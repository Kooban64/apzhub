/**
 * Zod schemas for Platform Configuration HTTP API (APZCONFIG-003).
 * Metadata / lifecycle only — no runtime apply, secrets, or env injection.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const configurationIdParamSchema = idParam("configuration");
export const configurationNamespaceIdParamSchema = idParam("namespace");
export const configurationGroupIdParamSchema = idParam("group");
export const configurationVersionIdParamSchema = idParam("version");
export const configurationOverrideIdParamSchema = idParam("override");
export const configurationReferenceIdParamSchema = idParam("reference");
export const configurationAuditIdParamSchema = idParam("audit");
export const configurationScopeIdParamSchema = idParam("scope");

export const configurationLifecycleStatusSchema = z.enum([
  "draft",
  "validated",
  "approved",
  "published",
  "deprecated",
  "archived",
]);

export const configurationHierarchyLevelSchema = z.enum([
  "platform",
  "tenant",
  "organisation",
  "product",
  "environment",
  "user",
]);

export const configurationScopeKindSchema = z.enum([
  "global",
  "tenant",
  "organisation",
  "product",
  "environment",
  "user",
]);

export const configurationValueKindSchema = z.enum([
  "string",
  "number",
  "boolean",
  "json",
  "array",
  "object",
  "null",
]);

export const configurationReferenceKindSchema = z.enum([
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "workflow",
  "search",
  "notifications",
  "future",
]);

const configurationScopeSchema = z
  .object({
    kind: configurationScopeKindSchema,
    tenantId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    productId: z.string().min(1).max(128).optional(),
    environmentId: z.string().min(1).max(128).optional(),
    userId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const configurationsListQuerySchema = paginationQuerySchema
  .extend({
    status: configurationLifecycleStatusSchema.optional(),
    namespaceId: z.string().min(1).max(128).optional(),
    groupId: z.string().min(1).max(128).optional(),
    hierarchyLevel: configurationHierarchyLevelSchema.optional(),
    scopeKind: configurationScopeKindSchema.optional(),
  })
  .strict();

export const createConfigurationBodySchema = z
  .object({
    namespaceKey: z.string().min(1).max(128),
    namespaceName: z.string().min(1).max(256).optional(),
    groupKey: z.string().min(1).max(128).optional(),
    groupName: z.string().min(1).max(256).optional(),
    key: z.string().min(1).max(128),
    displayName: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    valueKind: configurationValueKindSchema,
    hierarchyLevel: configurationHierarchyLevelSchema,
    scope: configurationScopeSchema,
    organisationId: z.string().min(1).max(128).optional(),
    inheritsFromConfigurationId: z.string().min(1).max(128).optional(),
    references: z
      .array(
        z
          .object({
            kind: configurationReferenceKindSchema,
            resourceId: z.string().min(1).max(256),
            label: z.string().max(256).optional(),
          })
          .strict(),
      )
      .max(50)
      .optional(),
  })
  .strict();

export const updateConfigurationBodySchema = z
  .object({
    hierarchyLevel: configurationHierarchyLevelSchema.optional(),
    scope: configurationScopeSchema.optional(),
    inheritsFromConfigurationId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(128).nullable().optional(),
    revision: z.number().int().positive().optional(),
  })
  .strict();

export const transitionConfigurationBodySchema = z
  .object({
    to: configurationLifecycleStatusSchema,
    reason: z.string().max(512).optional(),
  })
  .strict();

export const createConfigurationNamespaceBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateConfigurationNamespaceBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const createConfigurationGroupBodySchema = z
  .object({
    namespaceId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateConfigurationGroupBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const createConfigurationVersionBodySchema = z
  .object({
    label: z.string().max(256).optional(),
    valueKind: configurationValueKindSchema,
    payload: z.string().max(65536),
  })
  .strict();

export const overridesListQuerySchema = paginationQuerySchema
  .extend({
    configurationId: z.string().min(1).max(128),
  })
  .strict();

export const createConfigurationOverrideBodySchema = z
  .object({
    configurationId: z.string().min(1).max(128),
    hierarchyLevel: configurationHierarchyLevelSchema,
    scope: configurationScopeSchema,
    valueKind: configurationValueKindSchema,
    payload: z.string().max(65536),
  })
  .strict();

export const updateConfigurationOverrideBodySchema = z
  .object({
    hierarchyLevel: configurationHierarchyLevelSchema.optional(),
    scope: configurationScopeSchema.optional(),
    valueKind: configurationValueKindSchema.optional(),
    payload: z.string().max(65536).optional(),
  })
  .strict();

export const validateConfigurationMetadataBodySchema = z
  .object({
    hierarchyLevel: configurationHierarchyLevelSchema,
    scope: configurationScopeSchema,
    status: configurationLifecycleStatusSchema.optional(),
    namespaceId: z.string().min(1).max(128).optional(),
    groupId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const configurationAuditListQuerySchema = paginationQuerySchema
  .extend({
    configurationId: z.string().min(1).max(128).optional(),
  })
  .strict();
