import { z } from "zod";

import { globalIdWithPrefix, paginationQuerySchema } from "./common";

const workspaceSortFields = ["name", "slug", "createdAt", "updatedAt"] as const;

export const workspaceListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(workspaceSortFields).optional(),
    status: z.string().min(1).max(64).optional(),
  })
  .strict();

export const workspaceIdParamSchema = globalIdWithPrefix("ws");
