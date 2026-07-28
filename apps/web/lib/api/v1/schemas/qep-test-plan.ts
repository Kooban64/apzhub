/**
 * QEP Test Plan HTTP schemas (APZQEP-ENG-060B Part 2).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepTestPlanIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test plan identifier format");

export const qepTestPlanNumberParamSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(idPattern, "Invalid QEP test plan number format");

export const qepTestPlanItemIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test plan item identifier format");

const scopeSchema = z
  .object({
    class: z.string().min(1).max(64),
    label: z.string().max(256).optional(),
    externalRef: z.string().max(256).optional(),
  })
  .strict();

export const qepTestPlanListQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().min(1).max(256).optional(),
    status: z.string().min(1).max(32).optional(),
    ownerId: z.string().min(1).max(128).optional(),
    leadId: z.string().min(1).max(128).optional(),
    priority: z.string().min(1).max(32).optional(),
    planType: z.string().min(1).max(64).optional(),
    number: z.string().min(1).max(64).optional(),
    scheduledFrom: z.string().min(1).max(64).optional(),
    scheduledTo: z.string().min(1).max(64).optional(),
    includeArchived: z.enum(["true", "false"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepTestPlanCreateBodySchema = z
  .object({
    title: z.string().min(1).max(256),
    objective: z.string().max(4000).optional(),
    description: z.string().max(8000).optional(),
    scope: scopeSchema,
    priority: z.string().min(1).max(32).optional(),
    ownerId: z.string().min(1).max(128).optional(),
    externalReferences: z.array(z.string().max(256)).optional(),
  })
  .strict();

export const qepTestPlanUpdateContentBodySchema = z
  .object({
    title: z.string().min(1).max(256).optional(),
    description: z.string().max(8000).nullable().optional(),
    objective: z.string().max(4000).optional(),
    scope: scopeSchema.optional(),
    priority: z.string().min(1).max(32).optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanUpdateMetadataBodySchema = z
  .object({
    metadata: z.record(z.string().max(512)),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanTransferOwnershipBodySchema = z
  .object({
    ownerId: z.string().min(1).max(128),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanUpdateAssignmentBodySchema = z
  .object({
    leadId: z.string().min(1).max(128).nullable().optional(),
    assigneeIds: z.array(z.string().min(1).max(128)).optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanUpdateScheduleBodySchema = z
  .object({
    plannedStart: z.string().min(1).max(64).nullable().optional(),
    plannedEnd: z.string().min(1).max(64).nullable().optional(),
    milestoneRef: z.string().min(1).max(128).nullable().optional(),
    timezone: z.string().min(1).max(64).nullable().optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanAddItemBodySchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    specificationId: z.string().min(1).max(128),
    specificationVersionPin: z.string().min(1).max(64).optional(),
    sequence: z.number().int().min(0).optional(),
    itemStatus: z.string().min(1).max(32).optional(),
    notes: z.string().max(2000).optional(),
    requirementRefs: z.array(z.string().max(128)).optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanUpdateItemBodySchema = z
  .object({
    specificationVersionPin: z.string().min(1).max(64).nullable().optional(),
    sequence: z.number().int().min(0).optional(),
    itemStatus: z.string().min(1).max(32).optional(),
    notes: z.string().max(2000).nullable().optional(),
    requirementRefs: z.array(z.string().max(128)).nullable().optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanRemoveItemBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanReorderItemsBodySchema = z
  .object({
    orderedItemIds: z.array(z.string().min(1).max(128)).min(1),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanExpectedRevisionBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanApproveBodySchema = z
  .object({
    comment: z.string().max(4000).optional(),
    allowSelfApproval: z.boolean().optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanRejectBodySchema = z
  .object({
    comment: z.string().min(1).max(4000),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanSupersedeBodySchema = z
  .object({
    successorId: z.string().min(1).max(128).optional(),
    successorNumber: z.string().min(1).max(64).optional(),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepTestPlanCloneBodySchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    number: z.string().min(1).max(64).optional(),
    title: z.string().min(1).max(256).optional(),
  })
  .strict();

export type QepTestPlanListQuery = z.infer<typeof qepTestPlanListQuerySchema>;
export type QepTestPlanCreateBody = z.infer<typeof qepTestPlanCreateBodySchema>;
export type QepTestPlanUpdateContentBody = z.infer<typeof qepTestPlanUpdateContentBodySchema>;
export type QepTestPlanUpdateMetadataBody = z.infer<typeof qepTestPlanUpdateMetadataBodySchema>;
export type QepTestPlanTransferOwnershipBody = z.infer<
  typeof qepTestPlanTransferOwnershipBodySchema
>;
export type QepTestPlanUpdateAssignmentBody = z.infer<
  typeof qepTestPlanUpdateAssignmentBodySchema
>;
export type QepTestPlanUpdateScheduleBody = z.infer<typeof qepTestPlanUpdateScheduleBodySchema>;
export type QepTestPlanAddItemBody = z.infer<typeof qepTestPlanAddItemBodySchema>;
export type QepTestPlanUpdateItemBody = z.infer<typeof qepTestPlanUpdateItemBodySchema>;
export type QepTestPlanRemoveItemBody = z.infer<typeof qepTestPlanRemoveItemBodySchema>;
export type QepTestPlanReorderItemsBody = z.infer<typeof qepTestPlanReorderItemsBodySchema>;
export type QepTestPlanExpectedRevisionBody = z.infer<
  typeof qepTestPlanExpectedRevisionBodySchema
>;
export type QepTestPlanApproveBody = z.infer<typeof qepTestPlanApproveBodySchema>;
export type QepTestPlanRejectBody = z.infer<typeof qepTestPlanRejectBodySchema>;
export type QepTestPlanSupersedeBody = z.infer<typeof qepTestPlanSupersedeBodySchema>;
export type QepTestPlanCloneBody = z.infer<typeof qepTestPlanCloneBodySchema>;
