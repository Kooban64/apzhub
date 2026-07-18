/**
 * Zod schemas for Platform Search HTTP API (APZSEARCH-007).
 * Rejects raw engine filter syntax, index UIDs, unbounded pages, semantic/vector.
 * Never accepts client-authoritative tenant/org/roles/permissions.
 */

import { z } from "zod";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

/** Field names that must never be client-supplied filters (isolation plane). */
export const SEARCH_ISOLATION_FILTER_FIELDS = [
  "tenantId",
  "tenant_id",
  "organisationId",
  "organizationId",
  "organisation_id",
  "organization_id",
  "classification",
  "permissions",
  "roles",
] as const;

const meiliRawFilterPattern =
  /[=<>]|AND\s|OR\s|NOT\s|IN\s+\[|_geoRadius|_geoBoundingBox|TO\s/i;

export const searchIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid search identifier format");

export const searchProviderIdParamSchema = searchIdParamSchema;
export const searchConfigurationIdParamSchema = searchIdParamSchema;
export const searchCollectionIdParamSchema = searchIdParamSchema;
export const searchSourceIdParamSchema = searchIdParamSchema;
export const searchScopeIdParamSchema = searchIdParamSchema;
export const searchProfileIdParamSchema = searchIdParamSchema;

const searchFieldNameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z][a-zA-Z0-9_.]*$/, "Invalid filter/sort field name")
  .refine(
    (field) =>
      !SEARCH_ISOLATION_FILTER_FIELDS.includes(
        field as (typeof SEARCH_ISOLATION_FILTER_FIELDS)[number],
      ),
    { message: "Filter field is reserved for platform isolation" },
  )
  .refine((field) => !meiliRawFilterPattern.test(field), {
    message: "Raw engine filter syntax is not allowed",
  });

const searchFilterValueSchema = z.union([
  z.string().max(512),
  z.number(),
  z.boolean(),
  z.array(z.string().max(128)).max(50),
]);

export const searchFilterSchema = z
  .object({
    field: searchFieldNameSchema,
    op: z.enum(["eq", "neq", "in", "nin", "exists", "range"]),
    value: searchFilterValueSchema.optional(),
    from: z.union([z.string().max(128), z.number()]).optional(),
    to: z.union([z.string().max(128), z.number()]).optional(),
  })
  .strict()
  .superRefine((filter, ctx) => {
    const encoded = JSON.stringify(filter);
    if (meiliRawFilterPattern.test(encoded) && /[=<>]|AND|OR|NOT|_geo/.test(encoded)) {
      // Structured ops are fine; reject only when value embeds raw Meili expressions.
      if (
        typeof filter.value === "string" &&
        meiliRawFilterPattern.test(filter.value)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Raw engine filter expressions are not allowed in filter values",
          path: ["value"],
        });
      }
    }
  });

export const searchSortSchema = z
  .object({
    field: searchFieldNameSchema,
    direction: z.enum(["asc", "desc"]),
  })
  .strict();

export const searchQuerySchema = z
  .object({
    keywords: z.string().min(1).max(512).optional(),
    phrase: z.string().min(1).max(512).optional(),
    filters: z.array(searchFilterSchema).max(32).optional(),
    sorts: z.array(searchSortSchema).max(8).optional(),
    scopes: z
      .array(
        z.enum([
          "platform",
          "organisation",
          "tenant",
          "workspace",
          "product",
          "personal",
        ]),
      )
      .max(8)
      .optional(),
    collections: z.array(searchIdParamSchema).max(32).optional(),
    products: z
      .array(
        z.enum([
          "projects",
          "support",
          "documents",
          "testing",
          "reporting",
          "workflow",
          "analytics",
          "identity",
          "administration",
        ]),
      )
      .max(16)
      .optional(),
    page: z.number().int().min(1).max(10_000).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    includeFacets: z.boolean().optional(),
    includeHighlights: z.boolean().optional(),
    includeSuggestions: z.boolean().optional(),
  })
  .strict()
  .superRefine((query, ctx) => {
    const forbidden = [
      "semantic",
      "vector",
      "embedding",
      "knn",
      "hybrid",
      "indexUid",
      "indexName",
      "filter",
      "meiliFilter",
    ] as const;
    for (const key of forbidden) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Field '${key}' is not supported on the public Search API`,
          path: [key],
        });
      }
    }
  });

/** Reject client attempts to override trusted isolation context. */
const forbiddenContextKeys = z
  .object({
    tenantId: z.never().optional(),
    organisationId: z.never().optional(),
    organizationId: z.never().optional(),
    roles: z.never().optional(),
    permissions: z.never().optional(),
    actorUserId: z.never().optional(),
  })
  .partial();

export const searchQueryBodySchema = z
  .object({
    query: searchQuerySchema,
    profileId: searchIdParamSchema.optional(),
    sessionId: searchIdParamSchema.optional(),
    correlationId: z.string().min(1).max(128).optional(),
  })
  .merge(forbiddenContextKeys)
  .strict();

export const searchValidateBodySchema = z
  .object({
    query: searchQuerySchema,
  })
  .merge(forbiddenContextKeys)
  .strict();

export const searchSuggestionsBodySchema = z
  .object({
    keywords: z.string().min(1).max(512),
    phrase: z.string().min(1).max(512).optional(),
    pageSize: z.number().int().min(1).max(20).optional(),
  })
  .merge(forbiddenContextKeys)
  .strict();

export const registerSearchProviderBodySchema = z
  .object({
    kind: z.enum([
      "opensearch",
      "elasticsearch",
      "postgresql_fts",
      "meilisearch",
      "typesense",
      "azure_ai_search",
      "vector_future",
      "custom",
    ]),
    label: z.string().min(1).max(256),
    enabled: z.boolean().optional(),
    ownership: z.enum(["platform", "tenant", "organisation"]).optional(),
    version: z.string().max(64).optional(),
  })
  .strict();

export const updateSearchProviderBodySchema = z
  .object({
    label: z.string().min(1).max(256).optional(),
    enabled: z.boolean().optional(),
    ownership: z.enum(["platform", "tenant", "organisation"]).optional(),
    version: z.string().max(64).optional(),
  })
  .strict();

export const createSearchConfigurationBodySchema = z
  .object({
    label: z.string().max(256).optional(),
    configuration: z
      .object({
        defaultPageSize: z.number().int().min(1).max(100),
        maxPageSize: z.number().int().min(1).max(100),
        maxKeywordLength: z.number().int().min(1).max(2048),
        allowedProviderKinds: z
          .array(
            z.enum([
              "opensearch",
              "elasticsearch",
              "postgresql_fts",
              "meilisearch",
              "typesense",
              "azure_ai_search",
              "vector_future",
              "custom",
            ]),
          )
          .min(1)
          .max(16),
        enforceTenantIsolation: z.literal(true),
        enforceOrganisationIsolation: z.literal(true),
        enforcePermissionFilter: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const updateSearchConfigurationBodySchema = z
  .object({
    label: z.string().max(256).optional(),
    configuration: createSearchConfigurationBodySchema.shape.configuration,
  })
  .strict();

export const createSearchCollectionBodySchema = z
  .object({
    name: z.string().min(1).max(256),
    scope: z.enum([
      "platform",
      "organisation",
      "tenant",
      "workspace",
      "product",
      "personal",
    ]),
    productIds: z
      .array(
        z.enum([
          "projects",
          "support",
          "documents",
          "testing",
          "reporting",
          "workflow",
          "analytics",
          "identity",
          "administration",
        ]),
      )
      .max(16)
      .optional(),
    enabled: z.boolean().optional(),
  })
  .strict();

export const updateSearchCollectionBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    enabled: z.boolean().optional(),
    productIds: createSearchCollectionBodySchema.shape.productIds,
  })
  .strict();

export const searchManagementValidationQueryBodySchema = searchValidateBodySchema;

export const searchManagementValidationConfigurationBodySchema = z
  .object({
    configuration: createSearchConfigurationBodySchema.shape.configuration,
  })
  .strict();
