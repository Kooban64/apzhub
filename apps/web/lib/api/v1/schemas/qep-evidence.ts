/**
 * QEP Evidence HTTP schemas (APZQEP-ENG-110F, OES-ENG-091A PART-04).
 */

import { z } from "zod";

import { EVIDENCE_API_ACTION_KEYS } from "@apzhub/qep-evidence/api";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const qepEvidenceIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid QEP evidence identifier format");

export const qepEvidenceCollectionIdParamSchema = qepEvidenceIdParamSchema;
export const qepEvidenceSetIdParamSchema = qepEvidenceIdParamSchema;
export const qepEvidenceGrantIdParamSchema = qepEvidenceIdParamSchema;

export const qepEvidenceActionParamSchema = z.enum(
  EVIDENCE_API_ACTION_KEYS as unknown as [string, ...string[]],
);

const EVIDENCE_STATUSES = [
  "captured",
  "validated",
  "classified",
  "associated",
  "in_review",
  "approved",
  "rejected",
  "quarantined",
  "sealed",
  "retained",
  "archived",
  "disposed",
] as const;

export const qepEvidenceListQuerySchema = paginationQuerySchema
  .extend({
    projectId: z.string().min(1).max(128).optional(),
    workspaceId: z.string().min(1).max(128).optional(),
    status: z.enum(EVIDENCE_STATUSES).optional(),
    text: z.string().min(1).max(256).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const qepEvidenceCaptureBodySchema = z
  .object({
    projectId: z.string().min(1).max(128),
    workspaceId: z.string().min(1).max(128).optional(),
    ownerId: z.string().min(1).max(128).optional(),
    sourceKind: z.string().min(1).max(64).default("manual_upload"),
    sourceSystemId: z.string().min(1).max(128).optional(),
    mediaType: z.string().min(1).max(128),
    contentBase64: z.string().min(1),
    contentHash: z.string().min(1).max(256),
    hashAlgorithm: z.string().min(1).max(64).optional(),
    title: z.string().max(512).optional(),
    description: z.string().max(4000).optional(),
    tags: z.array(z.string().min(1).max(64)).max(50).optional(),
    classification: z.string().min(1).max(64).optional(),
  })
  .strict();

export const qepEvidenceActionBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    reason: z.string().max(2000).optional(),
    category: z.string().max(128).optional(),
    classification: z.string().max(128).optional(),
    sensitivityLabel: z.string().max(128).optional(),
    title: z.string().max(512).optional(),
    description: z.string().max(4000).optional(),
    tags: z.array(z.string().min(1).max(64)).max(50).optional(),
    mediaType: z.string().max(128).optional(),
    contentBase64: z.string().optional(),
    contentHash: z.string().max(256).optional(),
    hashAlgorithm: z.string().max(64).optional(),
    method: z.string().max(64).optional(),
    confirm: z.boolean().optional(),
  })
  .strict();

export const qepEvidenceAssociateBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    targetCapability: z.string().min(1).max(64),
    targetId: z.string().min(1).max(128),
    relationType: z.string().min(1).max(64),
  })
  .strict();

export const qepEvidenceVerifyBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    providedActualHash: z.string().min(1).max(256),
  })
  .strict();

export const qepEvidenceAccessCheckBodySchema = z
  .object({
    evidenceId: z.string().min(1).max(128),
    principalId: z.string().min(1).max(128),
    action: z.string().min(1).max(64),
  })
  .strict();

export const qepEvidenceCollectionCreateBodySchema = z
  .object({
    projectId: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    purpose: z.string().min(1).max(512),
  })
  .strict();

export const qepEvidenceCollectionMemberBodySchema = z
  .object({
    evidenceId: z.string().min(1).max(128),
    expectedRevision: z.number().int().min(0),
  })
  .strict();

export const qepEvidenceCollectionSealBodySchema = z
  .object({
    expectedRevision: z.number().int().min(0),
    sealHash: z.string().min(1).max(256),
  })
  .strict();

export const qepEvidenceGrantAccessBodySchema = z
  .object({
    principalId: z.string().min(1).max(128),
    action: z.string().min(1).max(64),
  })
  .strict();
