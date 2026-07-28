/**
 * QEP Test Specification HTTP schemas (APZQEP-ENG-050B Part 2).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepTestSpecificationIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test specification identifier format");

export const qepTestSpecificationRelationshipIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP test specification relationship identifier format");

const riskSchema = z
  .object({
    id: z.string().min(1).max(128),
    summary: z.string().min(1).max(512),
    severity: z.string().min(1).max(32).optional(),
  })
  .strict();

const dependencySchema = z
  .object({
    id: z.string().min(1).max(128),
    summary: z.string().min(1).max(512),
    referenceKind: z.string().min(1).max(64).optional(),
    referenceId: z.string().min(1).max(128).optional(),
  })
  .strict();

const draftContentSchema = z
  .object({
    title: z.string().min(1).max(256).optional(),
    description: z.string().max(8000).optional(),
    objective: z.string().max(4000).optional(),
    scope: z.string().max(4000).optional(),
    type: z.string().min(1).max(64).optional(),
    priority: z.string().min(1).max(32).optional(),
    complexity: z.string().min(1).max(32).optional(),
    classification: z.string().min(1).max(64).optional(),
    preconditions: z.array(z.string().max(512)).optional(),
    postconditions: z.array(z.string().max(512)).optional(),
    acceptanceCriteria: z.array(z.string().max(512)).optional(),
    risks: z.array(riskSchema).optional(),
    dependencies: z.array(dependencySchema).optional(),
    tags: z.array(z.string().min(1).max(64)).optional(),
  })
  .strict();

export const qepTestSpecificationListQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().min(1).max(256).optional(),
    status: z.string().min(1).max(32).optional(),
    type: z.string().min(1).max(64).optional(),
    owner: z.string().min(1).max(128).optional(),
    classification: z.string().min(1).max(64).optional(),
    priority: z.string().min(1).max(32).optional(),
    number: z.string().min(1).max(64).optional(),
    isAuthoritative: z.enum(["true", "false"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepTestSpecificationCreateBodySchema = z
  .object({
    number: z.string().min(1).max(64),
    title: z.string().min(1).max(256),
    description: z.string().max(8000),
    objective: z.string().max(4000),
    scope: z.string().max(4000),
    type: z.string().min(1).max(64),
    classification: z.string().min(1).max(64),
    owner: z.string().min(1).max(128),
    author: z.string().min(1).max(128),
    priority: z.string().min(1).max(32).optional(),
    complexity: z.string().min(1).max(32).optional(),
    reviewer: z.string().min(1).max(128).optional(),
    preconditions: z.array(z.string().max(512)).optional(),
    postconditions: z.array(z.string().max(512)).optional(),
    acceptanceCriteria: z.array(z.string().max(512)).optional(),
    risks: z.array(riskSchema).optional(),
    dependencies: z.array(dependencySchema).optional(),
    tags: z.array(z.string().min(1).max(64)).optional(),
    metadata: z.record(z.string().max(512)).optional(),
  })
  .strict();

export const qepTestSpecificationUpdateDraftBodySchema = z
  .object({
    content: draftContentSchema.optional(),
    metadata: z.record(z.string().max(512)).optional(),
  })
  .strict();

export const qepTestSpecificationSubmitReviewBodySchema = z
  .object({
    reviewerId: z.string().min(1).max(128),
  })
  .strict();

export const qepTestSpecificationApproveBodySchema = z
  .object({
    approvalComment: z.string().max(4000).optional(),
  })
  .strict();

export const qepTestSpecificationRejectBodySchema = z
  .object({
    reviewComment: z.string().min(1).max(4000),
  })
  .strict();

export const qepTestSpecificationSupersedeBodySchema = z
  .object({
    successorSpecificationId: z.string().min(1).max(128).optional(),
    createSuccessor: z
      .object({
        id: z.string().min(1).max(128).optional(),
        bump: z.enum(["major", "minor"]),
        title: z.string().min(1).max(256).optional(),
        description: z.string().max(8000).optional(),
        objective: z.string().max(4000).optional(),
        comparisonNotes: z.string().max(4000).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const qepTestSpecificationAddRelationshipBodySchema = z
  .object({
    id: z.string().min(1).max(128),
    kind: z.string().min(1).max(64),
    artefactId: z.string().min(1).max(128),
    owningDomain: z.string().min(1).max(64).optional(),
    label: z.string().min(1).max(256).optional(),
  })
  .strict();

export type QepTestSpecificationListQuery = z.infer<
  typeof qepTestSpecificationListQuerySchema
>;
export type QepTestSpecificationCreateBody = z.infer<
  typeof qepTestSpecificationCreateBodySchema
>;
export type QepTestSpecificationUpdateDraftBody = z.infer<
  typeof qepTestSpecificationUpdateDraftBodySchema
>;
export type QepTestSpecificationSubmitReviewBody = z.infer<
  typeof qepTestSpecificationSubmitReviewBodySchema
>;
export type QepTestSpecificationApproveBody = z.infer<
  typeof qepTestSpecificationApproveBodySchema
>;
export type QepTestSpecificationRejectBody = z.infer<
  typeof qepTestSpecificationRejectBodySchema
>;
export type QepTestSpecificationSupersedeBody = z.infer<
  typeof qepTestSpecificationSupersedeBodySchema
>;
export type QepTestSpecificationAddRelationshipBody = z.infer<
  typeof qepTestSpecificationAddRelationshipBodySchema
>;
