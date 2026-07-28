/**
 * QEP Verification HTTP schemas (APZQEP-ENG-040B Part 2).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepVerificationIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP verification identifier format");

const qepVerificationSubjectInputSchema = z
  .object({
    kind: z.string().min(1).max(64),
    artefactId: z.string().min(1).max(128),
    contentVersionId: z.string().min(1).max(128).optional(),
    baselineId: z.string().min(1).max(128).optional(),
    externalUri: z.string().min(1).max(2048).optional(),
  })
  .strict();

const qepVerificationAuthoritySchema = z
  .object({
    kind: z.string().min(1).max(64),
    actorId: z.string().min(1).max(128),
  })
  .strict();

const qepVerificationContextSchema = z
  .object({
    baselineId: z.string().min(1).max(128).optional(),
    contentVersionId: z.string().min(1).max(128).optional(),
    immutable: z.boolean().optional(),
  })
  .strict();

const qepVerificationScopeSchema = z
  .object({
    kind: z.enum(["product", "project", "release", "baseline", "tenant_global"]),
    referenceId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const qepVerificationListQuerySchema = paginationQuerySchema
  .extend({
    status: z.string().min(1).max(32).optional(),
    outcome: z.string().min(1).max(32).optional(),
    subjectKind: z.string().min(1).max(64).optional(),
    subjectArtefactId: z.string().min(1).max(128).optional(),
    authorityActorId: z.string().min(1).max(128).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepVerificationCreateBodySchema = z
  .object({
    subject: qepVerificationSubjectInputSchema,
    authority: qepVerificationAuthoritySchema,
    context: qepVerificationContextSchema.optional(),
    scope: qepVerificationScopeSchema.optional(),
    priority: z.string().min(1).max(32).optional(),
    origin: z.string().min(1).max(32).optional(),
    rationale: z.string().max(4000).optional(),
    reason: z.string().max(4000).optional(),
    comment: z.string().max(4000).optional(),
    metadata: z.record(z.string().max(512)).optional(),
  })
  .strict();

export const qepVerificationAssignBodySchema = z
  .object({
    assigneeId: z.string().min(1).max(128),
  })
  .strict();

export const qepVerificationCompleteBodySchema = z
  .object({
    outcome: z.string().min(1).max(32),
    rationale: z.string().max(4000).optional(),
    comment: z.string().max(4000).optional(),
  })
  .strict();

export const qepVerificationRejectBodySchema = qepVerificationCompleteBodySchema;

export const qepVerificationSupersedeBodySchema = z
  .object({
    successorVerificationId: z.string().min(1).max(128),
  })
  .strict();

export const qepVerificationMetadataBodySchema = z
  .object({
    metadata: z.record(z.string().max(512)),
  })
  .strict();

export const qepVerificationRationaleBodySchema = z
  .object({
    rationale: z.string().min(1).max(4000),
  })
  .strict();

export const qepVerificationPriorityBodySchema = z
  .object({
    priority: z.string().min(1).max(32),
  })
  .strict();

export type QepVerificationListQuery = z.infer<typeof qepVerificationListQuerySchema>;
export type QepVerificationCreateBody = z.infer<typeof qepVerificationCreateBodySchema>;
export type QepVerificationAssignBody = z.infer<typeof qepVerificationAssignBodySchema>;
export type QepVerificationCompleteBody = z.infer<
  typeof qepVerificationCompleteBodySchema
>;
export type QepVerificationRejectBody = z.infer<typeof qepVerificationRejectBodySchema>;
export type QepVerificationSupersedeBody = z.infer<
  typeof qepVerificationSupersedeBodySchema
>;
export type QepVerificationMetadataBody = z.infer<
  typeof qepVerificationMetadataBodySchema
>;
export type QepVerificationRationaleBody = z.infer<
  typeof qepVerificationRationaleBodySchema
>;
export type QepVerificationPriorityBody = z.infer<
  typeof qepVerificationPriorityBodySchema
>;
