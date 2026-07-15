/**
 * Zod schemas for Platform Document HTTP API (APZDOCS-004).
 * Metadata only — no binary upload/download bodies.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const documentIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid document identifier format");

export const documentVersionIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid version identifier format");

export const documentTagIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid tag identifier format");

export const documentsListQuerySchema = paginationQuerySchema
  .extend({
    query: z.string().min(1).max(256).optional(),
    status: z.string().min(1).max(64).optional(),
    classification: z.string().min(1).max(64).optional(),
    documentType: z.string().min(1).max(64).optional(),
    tagName: z.string().min(1).max(128).optional(),
  })
  .strict();

export const createDocumentBodySchema = z
  .object({
    title: z.string().min(1).max(512),
    description: z.string().max(4000).optional(),
    documentType: z.string().min(1).max(64).optional(),
    classification: z.string().min(1).max(64).optional(),
    customClassification: z.string().max(128).optional(),
    mimeType: z.string().max(255).optional(),
    byteLength: z.number().int().min(0).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    tagNames: z.array(z.string().min(1).max(128)).max(50).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    folderId: z.string().min(1).max(128).optional(),
    checksumHex: z.string().min(1).max(128).optional(),
    checksumAlgorithm: z.enum(["sha256", "sha512", "md5"]).optional(),
  })
  .strict();

export const updateDocumentMetadataBodySchema = z
  .object({
    title: z.string().min(1).max(512).optional(),
    description: z.string().max(4000).optional(),
    mimeType: z.string().max(255).optional(),
    byteLength: z.number().int().min(0).optional(),
    custom: z.record(z.string()).optional(),
  })
  .strict();

export const classifyDocumentBodySchema = z
  .object({
    classification: z.string().min(1).max(64),
    customCode: z.string().max(128).optional(),
    label: z.string().max(256).optional(),
  })
  .strict();

export const tagDocumentBodySchema = z
  .object({
    tagNames: z.array(z.string().min(1).max(128)).min(1).max(50),
  })
  .strict();

export const assignFolderBodySchema = z
  .object({
    folderId: z.string().min(1).max(128).nullable(),
  })
  .strict();

export const assignCollectionBodySchema = z
  .object({
    collectionId: z.string().min(1).max(128).nullable(),
  })
  .strict();

export const applyRetentionBodySchema = z
  .object({
    retentionId: z.string().min(1).max(128).nullable(),
  })
  .strict();

export const relateDocumentBodySchema = z
  .object({
    kind: z.string().min(1).max(64),
    targetDocumentId: z.string().min(1).max(128).optional(),
    reference: z
      .object({
        product: z.string().min(1).max(64),
        externalId: z.string().min(1).max(256),
        label: z.string().max(256).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
