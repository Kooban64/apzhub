/**
 * Time HTTP Zod schemas (APZHUB-TIME-HTTP-001).
 * Time domain IDs use vendor-neutral prefixes; length is not fixed to 32-hex
 * (in-memory and future Kimai-mapped IDs both accepted).
 */
import { z } from "zod";

import { paginationQuerySchema } from "./common";

function timeIdWithPrefix(prefix: string) {
  return z
    .string()
    .min(1)
    .max(128)
    .regex(
      new RegExp(`^${prefix}_[A-Za-z0-9]+$`),
      `Expected Time ID with prefix '${prefix}_'`,
    );
}

export const timesheetIdParamSchema = timeIdWithPrefix("tts");
export const timeEntryIdParamSchema = timesheetIdParamSchema;
export const timeActivityIdParamSchema = timeIdWithPrefix("tact");
export const timeCustomerIdParamSchema = timeIdWithPrefix("tcust");
export const timeProjectIdParamSchema = timeIdWithPrefix("tproj");
export const timeTagIdParamSchema = timeIdWithPrefix("ttag");

export const timeListQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().min(1).max(200).optional(),
  })
  .strict();

export const timeSearchQuerySchema = z
  .object({
    q: z.string().min(1).max(200).optional(),
    query: z.string().min(1).max(200).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.q ?? value.query), {
    message: "Query parameter 'q' or 'query' is required.",
  });

export const createTimesheetBodySchema = z
  .object({
    description: z.string().max(4000).optional(),
    startedAt: z.string().datetime().optional(),
    activityId: timeIdWithPrefix("tact").optional(),
    customerId: timeIdWithPrefix("tcust").optional(),
    projectId: timeIdWithPrefix("tproj").optional(),
    tagIds: z.array(timeIdWithPrefix("ttag")).max(50).optional(),
    billable: z.boolean().optional(),
  })
  .strict();

export const updateTimesheetBodySchema = z
  .object({
    description: z.string().max(4000).optional(),
    activityId: timeIdWithPrefix("tact").nullable().optional(),
    customerId: timeIdWithPrefix("tcust").nullable().optional(),
    projectId: timeIdWithPrefix("tproj").nullable().optional(),
    tagIds: z.array(timeIdWithPrefix("ttag")).max(50).optional(),
    billable: z.boolean().optional(),
    endedAt: z.string().datetime().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export const createTimeActivityBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(4000).optional(),
    projectId: timeIdWithPrefix("tproj").optional(),
  })
  .strict();

export const updateTimeActivityBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).optional(),
    projectId: timeIdWithPrefix("tproj").nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export const createTimeCustomerBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    number: z.string().min(1).max(64).optional(),
  })
  .strict();

export const updateTimeCustomerBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    number: z.string().min(1).max(64).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export const createTimeProjectBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    customerId: timeIdWithPrefix("tcust").optional(),
  })
  .strict();

export const updateTimeProjectBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    customerId: timeIdWithPrefix("tcust").nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export const createTimeTagBodySchema = z
  .object({
    name: z.string().min(1).max(100),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Expected #RRGGBB colour")
      .optional(),
  })
  .strict();

export const updateTimeTagBodySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Expected #RRGGBB colour")
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });
