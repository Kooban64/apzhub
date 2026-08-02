import { z } from "zod";

export const qepReportingDashboardIdSchema = z.enum([
  "executive",
  "qa_manager",
  "test_lead",
  "tester",
  "release",
  "coverage",
  "defect",
  "execution",
  "quality_trend",
  "portfolio",
]);

export const qepReportingTemplateIdSchema = z.enum([
  "coverage_summary",
  "execution_summary",
  "defect_summary",
  "requirement_gaps",
  "release_readiness",
  "quality_trends",
]);

export const qepReportingMetricsQuerySchema = z.object({
  projectId: z.string().optional(),
  keys: z.string().optional(),
});

export const qepReportingTrendsBodySchema = z.object({
  keys: z.array(z.string()).min(1).max(20),
  projectId: z.string().optional(),
});

export const qepReportingGenerateBodySchema = z.object({
  templateId: qepReportingTemplateIdSchema,
  projectId: z.string().optional(),
  name: z.string().max(500).optional(),
});

export const qepReportingSavedCreateBodySchema = z.object({
  name: z.string().min(1).max(500),
  templateId: qepReportingTemplateIdSchema,
  projectId: z.string().max(128).optional(),
  filters: z
    .object({
      projectId: z.string().optional(),
      releaseReference: z.string().optional(),
      environment: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      groupBy: z.string().optional(),
    })
    .optional(),
  sharedWith: z.array(z.string()).max(50).optional(),
});

export const qepReportingSavedUpdateBodySchema = z.object({
  name: z.string().min(1).max(500).optional(),
  filters: z
    .object({
      projectId: z.string().optional(),
      releaseReference: z.string().optional(),
      environment: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      groupBy: z.string().optional(),
    })
    .optional(),
  sharedWith: z.array(z.string()).max(50).optional(),
});

export const qepReportingReportIdParamSchema = z.string().min(1).max(128);
