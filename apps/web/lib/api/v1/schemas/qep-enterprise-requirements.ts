import { z } from "zod";

export const qepEnterpriseRequirementIdParamSchema = z.string().min(1).max(128);

export const qepEnterpriseRequirementCreateBodySchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(8000).optional(),
  projectId: z.string().max(128).optional(),
  category: z
    .enum([
      "business",
      "functional",
      "non_functional",
      "compliance",
      "security",
      "performance",
      "operational",
      "custom",
    ])
    .optional(),
  priority: z.enum(["p0", "p1", "p2", "p3", "p4"]).optional(),
  criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
  risk: z.enum(["critical", "high", "medium", "low"]).optional(),
  ownerId: z.string().max(128).optional(),
  releaseReference: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  application: z.string().max(200).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
});

export const qepEnterpriseRequirementListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  risk: z.string().optional(),
  ownerId: z.string().optional(),
  suiteId: z.string().optional(),
  query: z.string().optional(),
  uncoveredOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  highRiskOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  sortBy: z.enum(["title", "updatedAt", "createdAt", "priority", "risk"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const qepEnterpriseRequirementUpdateBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(8000).optional(),
  category: z
    .enum([
      "business",
      "functional",
      "non_functional",
      "compliance",
      "security",
      "performance",
      "operational",
      "custom",
    ])
    .optional(),
  priority: z.enum(["p0", "p1", "p2", "p3", "p4"]).optional(),
  criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
  risk: z.enum(["critical", "high", "medium", "low"]).optional(),
  ownerId: z.string().max(128).optional(),
  releaseReference: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  application: z.string().max(200).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  expectedRevision: z.number().int().nonnegative().optional(),
});

export const qepEnterpriseRequirementLifecycleBodySchema = z.object({
  status: z.enum([
    "draft",
    "under_review",
    "approved",
    "active",
    "deprecated",
    "archived",
    "retired",
  ]),
  reason: z.string().max(2000).optional(),
});

export const qepEnterpriseRequirementLinkSuiteBodySchema = z.object({
  suiteId: z.string().min(1).max(128),
  suiteName: z.string().max(500).optional(),
});
