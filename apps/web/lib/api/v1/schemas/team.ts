import { z } from "zod";

import { globalIdWithPrefix, paginationQuerySchema } from "./common";

/**
 * TeamService is project-scoped membership (not a standalone Team entity).
 * Routes require workspace-neutral projectId query parameter.
 */
export const teamListQuerySchema = paginationQuerySchema
  .extend({
    projectId: globalIdWithPrefix("proj"),
    sort: z.enum(["role", "joinedAt"]).optional(),
  })
  .strict();

export const teamMemberIdParamSchema = globalIdWithPrefix("member");

export const teamMemberGetQuerySchema = z
  .object({
    projectId: globalIdWithPrefix("proj"),
  })
  .strict();
