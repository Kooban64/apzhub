/**
 * Analytics HTTP Zod schemas (APZHUB-PLATFORM-ANALYTICS-005).
 * Platform analytics IDs use opaque shapes (not fixed 32-hex global IDs).
 */
import { z } from "zod";

import { paginationQuerySchema } from "./common";

const analyticsIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/,
    "Invalid Analytics platform identifier",
  );

export const analyticsDashboardIdParamSchema = analyticsIdSchema;
export const analyticsSavedIdParamSchema = analyticsIdSchema;

export const analyticsDashboardListQuerySchema = paginationQuerySchema
  .extend({
    categoryId: analyticsIdSchema.optional(),
    status: z.enum(["draft", "published", "deprecated", "archived"]).optional(),
    tag: z.string().min(1).max(64).optional(),
  })
  .strict();

export const createAnalyticsSavedBodySchema = z
  .object({
    id: analyticsIdSchema.optional(),
    dashboardId: analyticsIdSchema,
    name: z.string().min(1).max(200),
    description: z.string().max(4000).optional(),
    filterSnapshot: z.record(z.unknown()).optional(),
    parameterSnapshot: z.record(z.unknown()).optional(),
    status: z.enum(["draft", "published", "deprecated", "archived"]).optional(),
  })
  .strict();

export const updateAnalyticsSavedBodySchema = z
  .object({
    dashboardId: analyticsIdSchema.optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).nullable().optional(),
    filterSnapshot: z.record(z.unknown()).nullable().optional(),
    parameterSnapshot: z.record(z.unknown()).nullable().optional(),
    status: z.enum(["draft", "published", "deprecated", "archived"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });
