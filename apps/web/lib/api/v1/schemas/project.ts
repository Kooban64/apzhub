import { z } from "zod";

import { globalIdWithPrefix, paginationQuerySchema } from "./common";

const projectSortFields = [
  "name",
  "createdAt",
  "updatedAt",
  "identifier",
  "status",
] as const;

export const projectListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(projectSortFields).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["active", "archived", "all"]).optional(),
    workspaceId: globalIdWithPrefix("ws").optional(),
  })
  .strict();

export const projectIdParamSchema = globalIdWithPrefix("proj");

const projectStatusValues = [
  "draft",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;

export const createProjectBodySchema = z
  .object({
    workspaceId: globalIdWithPrefix("ws"),
    name: z.string().min(1).max(200),
    identifier: z
      .string()
      .min(1)
      .max(32)
      .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "Invalid project identifier"),
    description: z.string().max(4000).optional(),
    leadId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    identifier: z
      .string()
      .min(1)
      .max(32)
      .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "Invalid project identifier")
      .optional(),
    description: z.string().max(4000).optional(),
    leadId: z.string().min(1).max(128).nullable().optional(),
    status: z.enum(projectStatusValues).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
