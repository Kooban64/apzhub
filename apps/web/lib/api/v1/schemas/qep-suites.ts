import { z } from "zod";

export const qepSuiteIdParamSchema = z.string().min(1).max(128);

export const qepSuiteCreateBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  projectId: z.string().min(1).max(128).optional(),
  parentSuiteId: z.string().min(1).max(128).optional(),
  folderPath: z.string().max(500).optional(),
  kind: z.enum(["standard", "shared", "reusable", "template", "reference"]).optional(),
  priority: z.enum(["low", "normal", "high", "critical"]).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  risk: z.string().max(100).optional(),
  businessArea: z.string().max(100).optional(),
  application: z.string().max(100).optional(),
  component: z.string().max(100).optional(),
  classification: z.string().max(100).optional(),
  customMetadata: z.record(z.string(), z.unknown()).optional(),
});

export const qepSuiteUpdateBodySchema = qepSuiteCreateBodySchema.partial().extend({
  ownerId: z.string().min(1).max(128).optional(),
});

export const qepSuiteListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  query: z.string().optional(),
  ownerId: z.string().optional(),
  sortBy: z.enum(["name", "updatedAt", "createdAt", "priority"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const qepSuiteLifecycleBodySchema = z.object({
  status: z.enum([
    "draft",
    "review",
    "approved",
    "published",
    "deprecated",
    "archived",
    "retired",
    "deleted",
  ]),
});

export const qepSuiteMoveBodySchema = z.object({
  parentSuiteId: z.string().min(1).max(128).nullable().optional(),
  folderPath: z.string().max(500).optional(),
});
