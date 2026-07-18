/**
 * Zod schemas for Platform Reporting HTTP API (APZREPORT-002).
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;

export const reportTemplateIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid template identifier format");

export const reportMetadataIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid metadata identifier format");

export const reportOutputFormatSchema = z.enum([
  "html",
  "markdown",
  "pdf",
  "docx",
  "json",
  "csv",
]);

export const reportingListQuerySchema = paginationQuerySchema
  .extend({
    reportType: z.string().min(1).max(128).optional(),
  })
  .strict();

export const reportingTemplatesQuerySchema = z
  .object({
    reportType: z.string().min(1).max(128).optional(),
  })
  .strict();

const reportParametersSchema = z
  .object({
    metrics: z.record(z.union([z.string(), z.number()])).optional(),
    tables: z
      .record(
        z.object({
          columns: z.array(z.string()),
          rows: z.array(z.array(z.string())),
        }),
      )
      .optional(),
    lists: z.record(z.array(z.string())).optional(),
    summaries: z.record(z.string()).optional(),
    text: z.record(z.string()).optional(),
    metadata: z.record(z.string()).optional(),
  })
  .strict()
  .optional();

export const validateReportBodySchema = z
  .object({
    reportType: z.string().min(1).max(128),
    templateId: z.string().min(1).max(128).optional(),
    outputFormat: reportOutputFormatSchema,
    parameters: reportParametersSchema,
  })
  .strict();

export const generateReportBodySchema = z
  .object({
    reportType: z.string().min(1).max(128),
    templateId: z.string().min(1).max(128).optional(),
    outputFormat: reportOutputFormatSchema,
    parameters: reportParametersSchema,
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const previewReportBodySchema = generateReportBodySchema;

const reportBlockSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("heading"),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      text: z.string(),
    })
    .strict(),
  z.object({ kind: z.literal("paragraph"), text: z.string() }).strict(),
  z
    .object({
      kind: z.literal("metric"),
      label: z.string(),
      value: z.string(),
      unit: z.string().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("table"),
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .strict(),
  z
    .object({
      kind: z.literal("list"),
      ordered: z.boolean().optional(),
      items: z.array(z.string()),
    })
    .strict(),
  z.object({ kind: z.literal("summary"), text: z.string() }).strict(),
]);

const canonicalReportDocumentSchema = z
  .object({
    id: z.string().min(1),
    reportType: z.string().min(1),
    templateId: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    generatedAt: z.string().min(1),
    generatedBy: z.string().min(1),
    tenantId: z.string().min(1),
    organisationId: z.string().optional(),
    version: z.string().min(1),
    revision: z.number().int(),
    header: z.string().optional(),
    footer: z.string().optional(),
    branding: z
      .object({
        productName: z.string().optional(),
        organisationName: z.string().optional(),
        footerText: z.string().optional(),
      })
      .strict()
      .optional(),
    metadata: z.record(z.string()),
    metrics: z.array(z.object({ label: z.string(), value: z.string() }).strict()),
    sections: z.array(
      z
        .object({
          id: z.string(),
          title: z.string(),
          blocks: z.array(reportBlockSchema),
        })
        .strict(),
    ),
  })
  .strict();

export const renderReportBodySchema = z
  .object({
    document: canonicalReportDocumentSchema,
    outputFormat: reportOutputFormatSchema,
  })
  .strict();
