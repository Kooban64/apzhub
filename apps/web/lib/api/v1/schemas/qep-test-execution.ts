/**
 * QEP Test Execution HTTP schemas (APZQEP-ENG-100D, OES-ENG-090A PART-04).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepExecutionIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test execution identifier format");

export const qepExecutionPlanIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test plan identifier format");

export const qepExecutionStepOrderParamSchema = z.coerce.number().int().min(1);

const EXECUTION_STATUSES = [
  "draft",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "submitted_for_review",
  "accepted",
  "rejected",
  "cancelled",
  "superseded",
] as const;

export const qepExecutionActionParamSchema = z.enum([
  "prepare",
  "assign",
  "start",
  "pause",
  "block",
  "resume",
  "complete",
  "submitForReview",
  "accept",
  "reject",
  "cancel",
  "supersede",
]);

const sourceVersionRefSchema = z
  .object({
    capability: z.string().min(1).max(64),
    id: z.string().min(1).max(128),
    versionLabel: z.string().min(1).max(64),
  })
  .strict();

const sourceRefsSchema = z
  .object({
    planRef: sourceVersionRefSchema.optional(),
    specRef: sourceVersionRefSchema.optional(),
    planItemId: z.string().min(1).max(128).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.planRef || value.specRef), {
    message: "At least one of planRef or specRef is required",
  });

const executionStatusEnum = z.enum(EXECUTION_STATUSES);

export const qepExecutionListQuerySchema = paginationQuerySchema
  .extend({
    status: executionStatusEnum.optional(),
    assigneeId: z.string().min(1).max(128).optional(),
    reviewerId: z.string().min(1).max(128).optional(),
    ownerId: z.string().min(1).max(128).optional(),
    planId: z.string().min(1).max(128).optional(),
    specId: z.string().min(1).max(128).optional(),
    projectId: z.string().min(1).max(128).optional(),
    workspaceId: z.string().min(1).max(128).optional(),
    reviewQueue: z.enum(["true", "false"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepExecutionCreateBodySchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    projectId: z.string().min(1).max(128),
    workspaceId: z.string().min(1).max(128),
    mode: z.string().min(1).max(32).optional(),
    sourceRefs: sourceRefsSchema,
    ownerId: z.string().min(1).max(128).optional(),
    context: z.record(z.string().max(512)).optional(),
    executionNumber: z.string().min(1).max(64).optional(),
    supersedesId: z.string().min(1).max(128).optional(),
  })
  .strict();

const recordStepResultShape = {
  order: z.number().int().min(1),
  outcome: z.string().min(1).max(32),
  actualResult: z.string().max(8000).optional(),
  skipReason: z.string().max(2000).optional(),
  blockReason: z.string().max(2000).optional(),
  notApplicableReason: z.string().max(2000).optional(),
  comment: z.string().max(2000).optional(),
  evidenceIds: z.array(z.string().min(1).max(128)).optional(),
  startedAt: z.string().min(1).max(64).optional(),
  completedAt: z.string().min(1).max(64).optional(),
};

export const qepExecutionIngestBodySchema = z
  .object({
    executionId: z.string().min(1).max(128).optional(),
    expectedRevision: z.number().int().min(0).optional(),
    submissionId: z.string().min(1).max(128).optional(),
    sourceSystemId: z.string().min(1).max(128),
    agentIdentity: z.string().min(1).max(128),
    idempotencyKey: z.string().min(1).max(256),
    payloadHash: z.string().min(1).max(256),
    signatureMetadata: z.string().max(2000).optional(),
    isComplete: z.boolean(),
    automationExecutionId: z.string().min(1).max(128).optional(),
    stepResults: z.array(z.object(recordStepResultShape).strict()).optional(),
    create: z
      .object({
        projectId: z.string().min(1).max(128),
        workspaceId: z.string().min(1).max(128),
        sourceRefs: sourceRefsSchema,
        ownerId: z.string().min(1).max(128).optional(),
        executionNumber: z.string().min(1).max(64).optional(),
        id: z.string().min(1).max(128).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const qepExecutionExpectedRevisionBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepExecutionAssignBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    executorId: z.string().min(1).max(128).optional(),
    reviewerId: z.string().min(1).max(128).optional(),
    agentIdentity: z.string().min(1).max(128).optional(),
    allowReassignInProgress: z.boolean().optional(),
  })
  .strict();

export const qepExecutionReasonBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    reason: z.string().min(1).max(2000),
  })
  .strict();

export const qepExecutionCancelBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    reason: z.string().max(2000).optional(),
  })
  .strict();

export const qepExecutionAcceptBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    outcomeOverride: z.string().min(1).max(32).optional(),
  })
  .strict();

export const qepExecutionSupersedeBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    successorExecutionId: z.string().min(1).max(128),
  })
  .strict();

export const qepExecutionActionBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    reason: z.string().min(1).max(2000).optional(),
    executorId: z.string().min(1).max(128).optional(),
    reviewerId: z.string().min(1).max(128).optional(),
    agentIdentity: z.string().min(1).max(128).optional(),
    allowReassignInProgress: z.boolean().optional(),
    outcomeOverride: z.string().min(1).max(32).optional(),
    successorExecutionId: z.string().min(1).max(128).optional(),
  })
  .strict();

/**
 * `order` is derived from the `stepId` path parameter (OES PART-04) rather
 * than duplicated in the request body.
 */
export const qepExecutionRecordStepResultBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    ...recordStepResultShape,
    order: recordStepResultShape.order.optional(),
  })
  .strict();

export const qepExecutionAssociateEvidenceBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    id: z.string().min(1).max(128).optional(),
    uri: z.string().min(1).max(2000),
    integrityHash: z.string().min(1).max(256).optional(),
    stepOrder: z.number().int().min(1).optional(),
  })
  .strict();

export const qepExecutionRecordObservationBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    id: z.string().min(1).max(128).optional(),
    body: z.string().min(1).max(8000),
    severityHint: z.enum(["info", "warning", "critical"]).optional(),
    structured: z.record(z.string().max(512)).optional(),
  })
  .strict();

export type QepExecutionStatus = (typeof EXECUTION_STATUSES)[number];
export type QepExecutionListQuery = z.infer<typeof qepExecutionListQuerySchema>;
export type QepExecutionCreateBody = z.infer<typeof qepExecutionCreateBodySchema>;
export type QepExecutionIngestBody = z.infer<typeof qepExecutionIngestBodySchema>;
export type QepExecutionExpectedRevisionBody = z.infer<
  typeof qepExecutionExpectedRevisionBodySchema
>;
export type QepExecutionAssignBody = z.infer<typeof qepExecutionAssignBodySchema>;
export type QepExecutionReasonBody = z.infer<typeof qepExecutionReasonBodySchema>;
export type QepExecutionCancelBody = z.infer<typeof qepExecutionCancelBodySchema>;
export type QepExecutionAcceptBody = z.infer<typeof qepExecutionAcceptBodySchema>;
export type QepExecutionSupersedeBody = z.infer<typeof qepExecutionSupersedeBodySchema>;
export type QepExecutionActionBody = z.infer<typeof qepExecutionActionBodySchema>;
export type QepExecutionRecordStepResultBody = z.infer<
  typeof qepExecutionRecordStepResultBodySchema
>;
export type QepExecutionAssociateEvidenceBody = z.infer<
  typeof qepExecutionAssociateEvidenceBodySchema
>;
export type QepExecutionRecordObservationBody = z.infer<
  typeof qepExecutionRecordObservationBodySchema
>;
