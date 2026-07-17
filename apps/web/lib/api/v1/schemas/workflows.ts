/**
 * Zod schemas for Platform Workflow HTTP API (APZWORKFLOW-003).
 * Metadata / lifecycle only — no execution, n8n, or schedule bodies.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export const workflowIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid workflow identifier format");

export const workflowVersionIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid version identifier format");

export const workflowTemplateIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid template identifier format");

export const workflowCategoryIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid category identifier format");

export const workflowFolderIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid folder identifier format");

export const workflowLifecycleSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
  "deprecated",
  "restored",
]);

export const workflowValueTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "json",
]);

export const workflowNodeKindSchema = z.enum(["trigger", "action", "condition"]);

const workflowConfigValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

const workflowConfigSchema = z.record(workflowConfigValueSchema);

export const workflowGraphNodeSchema = z
  .object({
    id: z.string().min(1).max(128),
    nodeKind: workflowNodeKindSchema,
    kind: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    config: workflowConfigSchema,
  })
  .strict();

export const workflowConnectionSchema = z
  .object({
    id: z.string().min(1).max(128),
    sourceNodeId: z.string().min(1).max(128),
    targetNodeId: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    config: workflowConfigSchema.optional(),
  })
  .strict();

export const workflowGraphSnapshotSchema = z
  .object({
    nodes: z.array(workflowGraphNodeSchema).max(500),
    connections: z.array(workflowConnectionSchema).max(1000),
  })
  .strict();

export const workflowVariableSchema = z
  .object({
    id: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    valueType: workflowValueTypeSchema,
    defaultValue: workflowConfigValueSchema.optional(),
    required: z.boolean().optional(),
  })
  .strict();

export const workflowParameterSchema = z
  .object({
    id: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    valueType: z.enum(["string", "number", "boolean"]),
    required: z.boolean().optional(),
    defaultValue: workflowConfigValueSchema.optional(),
  })
  .strict();

export const workflowTriggerSchema = z
  .object({
    id: z.string().min(1).max(128),
    kind: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    config: workflowConfigSchema,
  })
  .strict();

export const workflowActionSchema = z
  .object({
    id: z.string().min(1).max(128),
    kind: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    config: workflowConfigSchema,
  })
  .strict();

export const workflowConditionSchema = z
  .object({
    id: z.string().min(1).max(128),
    kind: z.string().min(1).max(128),
    label: z.string().max(256).optional(),
    config: workflowConfigSchema,
  })
  .strict();

export const workflowsListQuerySchema = paginationQuerySchema
  .extend({
    query: z.string().min(1).max(256).optional(),
    lifecycle: workflowLifecycleSchema.optional(),
    categoryId: z.string().min(1).max(128).optional(),
    folderId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const createWorkflowBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(4000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    folderId: z.string().min(1).max(128).optional(),
    templateId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateWorkflowBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(4000).optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    folderId: z.string().min(1).max(128).nullable().optional(),
  })
  .strict();

export const transitionWorkflowBodySchema = z
  .object({
    to: workflowLifecycleSchema,
    reason: z.string().max(1000).optional(),
  })
  .strict();

export const createWorkflowVersionBodySchema = z
  .object({
    graph: workflowGraphSnapshotSchema,
    variables: z.array(workflowVariableSchema).max(200).optional(),
    parameters: z.array(workflowParameterSchema).max(200).optional(),
    triggers: z.array(workflowTriggerSchema).max(50).optional(),
    actions: z.array(workflowActionSchema).max(200).optional(),
    conditions: z.array(workflowConditionSchema).max(200).optional(),
    connections: z.array(workflowConnectionSchema).max(1000).optional(),
    changeSummary: z.string().max(1000).optional(),
  })
  .strict();

export const createWorkflowTemplateBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(4000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    graph: workflowGraphSnapshotSchema,
    parameters: z.array(workflowParameterSchema).max(200).optional(),
    variables: z.array(workflowVariableSchema).max(200).optional(),
  })
  .strict();

export const updateWorkflowTemplateBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(4000).optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    graph: workflowGraphSnapshotSchema.optional(),
    parameters: z.array(workflowParameterSchema).max(200).optional(),
    variables: z.array(workflowVariableSchema).max(200).optional(),
  })
  .strict();

export const createWorkflowCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(256),
    description: z.string().max(4000).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    parentCategoryId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const createWorkflowFolderBodySchema = z
  .object({
    name: z.string().min(1).max(256),
    organisationId: z.string().min(1).max(128).optional(),
    parentFolderId: z.string().min(1).max(128).optional(),
    path: z.string().min(1).max(1024),
  })
  .strict();

export const validateWorkflowBodySchema = z
  .object({
    workflowId: z.string().min(1).max(128).optional(),
    versionId: z.string().min(1).max(128).optional(),
    lifecycle: workflowLifecycleSchema.optional(),
    graph: workflowGraphSnapshotSchema.optional(),
    variables: z.array(workflowVariableSchema).max(200).optional(),
    parameters: z.array(workflowParameterSchema).max(200).optional(),
    triggers: z.array(workflowTriggerSchema).max(50).optional(),
    actions: z.array(workflowActionSchema).max(200).optional(),
    conditions: z.array(workflowConditionSchema).max(200).optional(),
    connections: z.array(workflowConnectionSchema).max(1000).optional(),
    versionNumber: z.number().int().min(1).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    folderId: z.string().min(1).max(128).optional(),
    templateId: z.string().min(1).max(128).optional(),
  })
  .strict();
