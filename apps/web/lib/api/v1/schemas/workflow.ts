/**
 * Workflow HTTP Zod schemas (APZHUB-PLATFORM-WORKFLOW-005).
 * Opaque platform IDs — never provider-native shapes.
 */
import { z } from "zod";

import { paginationQuerySchema } from "./common";

const workflowIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/, "Invalid Workflow platform identifier");

export const workflowDefinitionIdParamSchema = workflowIdSchema;
export const workflowRunIdParamSchema = workflowIdSchema;
export const workflowScheduleIdParamSchema = workflowIdSchema;
export const workflowTaskIdParamSchema = workflowIdSchema;
export const workflowApprovalIdParamSchema = workflowIdSchema;

export const workflowDefinitionsListQuerySchema = paginationQuerySchema
  .extend({
    query: z.string().min(1).max(200).optional(),
    lifecycle: z
      .enum(["draft", "active", "inactive", "archived", "deprecated", "restored"])
      .optional(),
  })
  .strict();

export const workflowRunsListQuerySchema = paginationQuerySchema
  .extend({
    workflowId: workflowIdSchema.optional(),
    status: z.string().min(1).max(64).optional(),
  })
  .strict();

export const createWorkflowRunBodySchema = z
  .object({
    workflowId: workflowIdSchema,
    versionId: workflowIdSchema.optional(),
    input: z
      .object({
        values: z.record(z.unknown()),
        parameterKeys: z.array(z.string()).optional(),
      })
      .optional(),
    correlationId: z.string().min(1).max(128).optional(),
    triggerId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const cancelWorkflowRunBodySchema = z
  .object({
    reason: z.string().min(1).max(1000).optional(),
  })
  .strict()
  .optional();

export const createWorkflowScheduleBodySchema = z
  .object({
    workflowId: workflowIdSchema,
    versionId: workflowIdSchema.optional(),
    triggerId: workflowIdSchema.optional(),
    cron: z.string().min(1).max(200),
    timezone: z.string().min(1).max(64).optional(),
  })
  .strict();

export const patchWorkflowScheduleBodySchema = z
  .object({
    status: z.enum(["armed", "paused", "retired"]),
  })
  .strict();

export const workflowSchedulesListQuerySchema = z
  .object({
    workflowId: workflowIdSchema.optional(),
  })
  .strict();

export const workflowTasksListQuerySchema = paginationQuerySchema
  .extend({
    runId: workflowIdSchema.optional(),
    status: z.string().min(1).max(64).optional(),
    kind: z.enum(["manual", "approval", "human"]).optional(),
    assigneePrincipalId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const patchWorkflowTaskBodySchema = z
  .object({
    action: z.enum(["claim", "complete"]),
    formValues: z.record(z.unknown()).optional(),
  })
  .strict();

export const patchWorkflowApprovalBodySchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    comment: z.string().max(4000).optional(),
  })
  .strict();

export const workflowNotificationsListQuerySchema = paginationQuerySchema.strict();
