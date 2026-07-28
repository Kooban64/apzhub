/**
 * QEP Requirements HTTP schemas (APZQEP-ENG-020B).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepRequirementIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP requirement identifier format");

export const qepContentVersionNumberParamSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(2_147_483_647);

export const qepListQuerySchema = paginationQuerySchema
  .extend({
    projectId: z.string().min(1).max(128).optional(),
    status: z.string().min(1).max(64).optional(),
    includeArchived: z.enum(["true", "false"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepSearchQuerySchema = qepListQuerySchema
  .extend({
    q: z.string().min(1).max(512),
  })
  .strict();

export const qepRequirementCreateBodySchema = z
  .object({
    projectId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    title: z.string().min(1).max(512),
    description: z.string().max(8192).optional(),
    type: z.string().min(1).max(64),
    status: z.string().min(1).max(64).optional(),
    priority: z.string().min(1).max(64),
    category: z.string().max(128).optional(),
    changeReason: z.string().min(1).max(2048).optional(),
    owner: z
      .object({
        userId: z.string().min(1).max(128),
        displayName: z.string().max(256).optional(),
      })
      .strict()
      .optional(),
    acceptanceCriteriaItems: z.array(z.string().min(1).max(2048)).max(100).optional(),
    attributes: z
      .object({
        tags: z.array(z.string().min(1).max(64)).max(50).optional(),
        custom: z.record(z.string().max(512)).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const qepRequirementUpdateBodySchema = z
  .object({
    changeReason: z.string().min(1).max(2048),
    title: z.string().min(1).max(512).optional(),
    description: z.string().max(8192).nullable().optional(),
    type: z.string().min(1).max(64).optional(),
    priority: z.string().min(1).max(64).optional(),
    category: z.string().max(128).nullable().optional(),
    expectedRevision: z.number().int().min(1).optional(),
  })
  .strict();

export const qepContentVersionCompareBodySchema = z
  .object({
    baseVersionNumber: z.number().int().min(1),
    targetVersionNumber: z.number().int().min(1),
  })
  .strict();

export const qepRequirementTransitionBodySchema = z
  .object({
    action: z.string().min(1).max(64),
    reason: z.string().max(2048).optional(),
    comments: z.string().max(8192).optional(),
    expectedRevision: z.number().int().min(1).optional(),
    metadata: z.record(z.string().max(512)).optional(),
  })
  .strict();

export const qepBaselineIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP requirement baseline identifier format");

export const qepContentVersionIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP requirement content version identifier format");

export const qepBaselineListQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(["draft", "locked", "archived"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepBaselineCreateBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(4000).optional(),
  })
  .strict();

export const qepBaselineUpdateDraftBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).nullable().optional(),
  })
  .strict();

export const qepBaselineAddItemBodySchema = z
  .object({
    contentVersionId: z.string().min(1).max(128),
    requirementId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const qepBaselineCompareBodySchema = z
  .object({
    baseBaselineId: z.string().min(1).max(128),
    targetBaselineId: z.string().min(1).max(128),
  })
  .strict();

const relationshipIdPattern = /^rrl_[A-Za-z0-9_-]+$/;

export const qepRelationshipIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(
    relationshipIdPattern,
    "Invalid QEP requirement relationship identifier format",
  );

const qepRelationshipEndpointSchema = z
  .object({
    mode: z.enum(["requirement", "content_version_pinned"]),
    requirementId: z.string().min(1).max(128),
    contentVersionId: z.string().min(1).max(128).optional(),
  })
  .strict();

const qepRelationshipScopeSchema = z
  .object({
    kind: z.enum(["product", "project", "release", "baseline"]),
    referenceId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const qepRelationshipListQuerySchema = paginationQuerySchema
  .extend({
    type: z.string().min(1).max(64).optional(),
    lifecycleState: z.enum(["draft", "active", "deprecated", "retired"]).optional(),
    requirementId: z.string().min(1).max(128).optional(),
    direction: z.enum(["inbound", "outbound", "both"]).optional(),
    baselineId: z.string().min(1).max(128).optional(),
    contentVersionId: z.string().min(1).max(128).optional(),
    conflictsOnly: z.enum(["true", "false"]).optional(),
    supersessionOnly: z.enum(["true", "false"]).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepRelationshipCreateBodySchema = z
  .object({
    type: z.string().min(1).max(64),
    source: qepRelationshipEndpointSchema,
    target: qepRelationshipEndpointSchema,
    strength: z.enum(["mandatory", "recommended", "informational"]).optional(),
    criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
    classification: z
      .enum([
        "structural",
        "behavioural",
        "business",
        "regulatory",
        "security",
        "privacy",
        "safety",
        "quality",
        "operational",
        "data",
        "integration",
      ])
      .optional(),
    scope: qepRelationshipScopeSchema.optional(),
    rationale: z.string().max(4000).optional(),
    expectedRevision: z.number().int().min(1).optional(),
  })
  .strict();

export const qepRelationshipUpdateProfileBodySchema = z
  .object({
    strength: z.enum(["mandatory", "recommended", "informational"]).optional(),
    criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
    classification: z
      .enum([
        "structural",
        "behavioural",
        "business",
        "regulatory",
        "security",
        "privacy",
        "safety",
        "quality",
        "operational",
        "data",
        "integration",
      ])
      .optional(),
    scope: qepRelationshipScopeSchema.optional(),
    rationale: z.string().max(4000).optional(),
  })
  .strict();

export const qepRelationshipRationaleBodySchema = z
  .object({
    rationale: z.string().min(1).max(4000),
  })
  .strict();

export const qepRelationshipStrengthBodySchema = z
  .object({
    strength: z.enum(["mandatory", "recommended", "informational"]),
  })
  .strict();

export const qepRelationshipClassificationBodySchema = z
  .object({
    classification: z.enum([
      "structural",
      "behavioural",
      "business",
      "regulatory",
      "security",
      "privacy",
      "safety",
      "quality",
      "operational",
      "data",
      "integration",
    ]),
  })
  .strict();

export const qepRelationshipCriticalityBodySchema = z
  .object({
    criticality: z.enum(["critical", "high", "medium", "low"]),
  })
  .strict();

export const qepRelationshipScopeBodySchema = z
  .object({
    scope: qepRelationshipScopeSchema,
  })
  .strict();

export const qepRelationshipSupersedeBodySchema = z
  .object({
    successorRequirementId: z.string().min(1).max(128),
    predecessorRequirementId: z.string().min(1).max(128),
    successorContentVersionId: z.string().min(1).max(128).optional(),
    predecessorContentVersionId: z.string().min(1).max(128).optional(),
    scope: qepRelationshipScopeSchema.optional(),
    rationale: z.string().min(1).max(4000),
    strength: z.enum(["mandatory", "recommended", "informational"]).optional(),
    criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
    classification: z
      .enum([
        "structural",
        "behavioural",
        "business",
        "regulatory",
        "security",
        "privacy",
        "safety",
        "quality",
        "operational",
        "data",
        "integration",
      ])
      .optional(),
  })
  .strict();

export const qepRequirementRelationshipsQuerySchema = z
  .object({
    direction: z.enum(["inbound", "outbound", "both"]).optional(),
  })
  .strict();

export type QepListQuery = z.infer<typeof qepListQuerySchema>;
export type QepSearchQuery = z.infer<typeof qepSearchQuerySchema>;
export type QepRequirementCreateBody = z.infer<typeof qepRequirementCreateBodySchema>;
export type QepRequirementUpdateBody = z.infer<typeof qepRequirementUpdateBodySchema>;
export type QepContentVersionCompareBody = z.infer<
  typeof qepContentVersionCompareBodySchema
>;
export type QepBaselineListQuery = z.infer<typeof qepBaselineListQuerySchema>;
export type QepBaselineCreateBody = z.infer<typeof qepBaselineCreateBodySchema>;
export type QepBaselineUpdateDraftBody = z.infer<
  typeof qepBaselineUpdateDraftBodySchema
>;
export type QepBaselineAddItemBody = z.infer<typeof qepBaselineAddItemBodySchema>;
export type QepBaselineCompareBody = z.infer<typeof qepBaselineCompareBodySchema>;
export type QepRelationshipListQuery = z.infer<typeof qepRelationshipListQuerySchema>;
export type QepRelationshipCreateBody = z.infer<typeof qepRelationshipCreateBodySchema>;
export type QepRelationshipUpdateProfileBody = z.infer<
  typeof qepRelationshipUpdateProfileBodySchema
>;
export type QepRelationshipRationaleBody = z.infer<
  typeof qepRelationshipRationaleBodySchema
>;
export type QepRelationshipStrengthBody = z.infer<
  typeof qepRelationshipStrengthBodySchema
>;
export type QepRelationshipClassificationBody = z.infer<
  typeof qepRelationshipClassificationBodySchema
>;
export type QepRelationshipCriticalityBody = z.infer<
  typeof qepRelationshipCriticalityBodySchema
>;
export type QepRelationshipScopeBody = z.infer<typeof qepRelationshipScopeBodySchema>;
export type QepRelationshipSupersedeBody = z.infer<
  typeof qepRelationshipSupersedeBodySchema
>;
