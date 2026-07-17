/**
 * Zod schemas for Workflow Engine HTTP API (APZWORKFLOW-008).
 * Read-only metadata — no execution / schedule / mutation bodies.
 */

import { z } from "zod";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const workflowEngineIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid workflow engine identifier format");

export const workflowEngineTemplateIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid workflow engine template identifier format");

export const workflowEngineListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.string().min(1).max(512).optional(),
});
