/**
 * QEP Traceability HTTP schemas (APZQEP-ENG-030A Part 2).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepTraceLinkIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP trace link identifier format");

export const qepTraceEndpointKindParamSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(idPattern, "Invalid QEP trace endpoint kind format");

export const qepTraceEndpointArtefactIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP trace endpoint artefact identifier format");

const qepTraceEndpointInputSchema = z
  .object({
    kind: z.string().min(1).max(64),
    artefactId: z.string().min(1).max(128),
    contentVersionId: z.string().min(1).max(128).optional(),
    baselineId: z.string().min(1).max(128).optional(),
    externalUri: z.string().min(1).max(2048).optional(),
  })
  .strict();

const qepTraceScopeSchema = z
  .object({
    kind: z.enum(["product", "project", "release", "baseline"]),
    referenceId: z.string().min(1).max(128).optional(),
  })
  .strict();

const qepTraceContextSchema = z
  .object({
    baselineId: z.string().min(1).max(128).optional(),
    contentVersionId: z.string().min(1).max(128).optional(),
    immutable: z.boolean().optional(),
  })
  .strict();

const qepTraceAuthoritySchema = z
  .object({
    kind: z.string().min(1).max(64),
    actorId: z.string().min(1).max(128),
  })
  .strict();

const qepTraceProvenanceSchema = z
  .object({
    actorId: z.string().min(1).max(128),
    correlationId: z.string().min(1).max(128),
    sourceSystem: z.string().min(1).max(128).optional(),
    importBatchId: z.string().min(1).max(128).optional(),
    rationaleRef: z.string().min(1).max(256).optional(),
  })
  .strict();

export const qepTraceLinkListQuerySchema = paginationQuerySchema
  .extend({
    type: z.string().min(1).max(64).optional(),
    lifecycleState: z.enum(["draft", "validated", "approved", "retired", "superseded"]).optional(),
    sourceKind: z.string().min(1).max(64).optional(),
    sourceArtefactId: z.string().min(1).max(128).optional(),
    targetKind: z.string().min(1).max(64).optional(),
    targetArtefactId: z.string().min(1).max(128).optional(),
    artefactId: z.string().min(1).max(128).optional(),
    direction: z.enum(["inbound", "outbound", "both"]).optional(),
    scopeReferenceId: z.string().min(1).max(128).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepTraceLinkEndpointQuerySchema = z
  .object({
    direction: z.enum(["inbound", "outbound", "both"]).optional(),
  })
  .strict();

export const qepTraceLinkCreateBodySchema = z
  .object({
    type: z.string().min(1).max(64),
    source: qepTraceEndpointInputSchema,
    target: qepTraceEndpointInputSchema,
    direction: z.string().min(1).max(32).optional(),
    strength: z.string().min(1).max(32).optional(),
    confidence: z.string().min(1).max(32).optional(),
    origin: z.string().min(1).max(32).optional(),
    authority: qepTraceAuthoritySchema,
    provenance: qepTraceProvenanceSchema,
    scope: qepTraceScopeSchema.optional(),
    context: qepTraceContextSchema.optional(),
    rationale: z.string().max(4000).optional(),
    metadata: z.record(z.string().max(512)).optional(),
  })
  .strict();

export const qepTraceLinkSupersedeBodySchema = z
  .object({
    successorTraceId: z.string().min(1).max(128),
  })
  .strict();

export const qepTraceLinkConfidenceBodySchema = z
  .object({
    confidence: z.string().min(1).max(32),
  })
  .strict();

export const qepTraceLinkAuthorityBodySchema = z
  .object({
    authority: qepTraceAuthoritySchema,
  })
  .strict();

export const qepTraceLinkScopeBodySchema = z
  .object({
    scope: qepTraceScopeSchema,
  })
  .strict();

export const qepTraceLinkRationaleBodySchema = z
  .object({
    rationale: z.string().min(1).max(4000),
  })
  .strict();

export const qepTraceLinkMetadataBodySchema = z
  .object({
    metadata: z.record(z.string().max(512)),
  })
  .strict();

export const qepTraceLinkOriginBodySchema = z
  .object({
    origin: z.string().min(1).max(32),
  })
  .strict();

export const qepTraceLinkEndpointBodySchema = z
  .object({
    role: z.enum(["source", "target"]),
    endpoint: qepTraceEndpointInputSchema,
  })
  .strict();

export type QepTraceLinkListQuery = z.infer<typeof qepTraceLinkListQuerySchema>;
export type QepTraceLinkEndpointQuery = z.infer<typeof qepTraceLinkEndpointQuerySchema>;
export type QepTraceLinkCreateBody = z.infer<typeof qepTraceLinkCreateBodySchema>;
export type QepTraceLinkSupersedeBody = z.infer<typeof qepTraceLinkSupersedeBodySchema>;
export type QepTraceLinkConfidenceBody = z.infer<typeof qepTraceLinkConfidenceBodySchema>;
export type QepTraceLinkAuthorityBody = z.infer<typeof qepTraceLinkAuthorityBodySchema>;
export type QepTraceLinkScopeBody = z.infer<typeof qepTraceLinkScopeBodySchema>;
export type QepTraceLinkRationaleBody = z.infer<typeof qepTraceLinkRationaleBodySchema>;
export type QepTraceLinkMetadataBody = z.infer<typeof qepTraceLinkMetadataBodySchema>;
export type QepTraceLinkOriginBody = z.infer<typeof qepTraceLinkOriginBodySchema>;
export type QepTraceLinkEndpointBody = z.infer<typeof qepTraceLinkEndpointBodySchema>;
