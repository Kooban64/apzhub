import { z } from "zod";

export const qepExecutionPlanIdParamSchema = z.string().min(1).max(128);

export const qepExecutionPlanCreateBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  projectId: z.string().min(1).max(128).optional(),
  suiteId: z.string().min(1).max(128),
  suiteVersion: z.number().int().positive().optional(),
  priority: z.enum(["low", "normal", "high", "critical"]).optional(),
  risk: z.string().max(100).optional(),
  releaseReference: z.string().max(200).optional(),
  milestoneReference: z.string().max(200).optional(),
  iterationReference: z.string().max(200).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  scope: z
    .object({
      mode: z
        .enum(["complete_suite", "selected_sections", "selected_children", "filtered"])
        .optional(),
      sectionIds: z.array(z.string()).optional(),
      childSuiteIds: z.array(z.string()).optional(),
      includeTags: z.array(z.string()).optional(),
      excludeTags: z.array(z.string()).optional(),
      priorities: z.array(z.string()).optional(),
      riskLevels: z.array(z.string()).optional(),
      notes: z.string().max(2000).optional(),
    })
    .optional(),
  assignments: z
    .object({
      testLeadId: z.string().optional(),
      testerIds: z.array(z.string()).optional(),
      reviewerIds: z.array(z.string()).optional(),
      approverIds: z.array(z.string()).optional(),
      responsibleTeamId: z.string().optional(),
      observerIds: z.array(z.string()).optional(),
    })
    .optional(),
  environmentReferences: z
    .array(
      z.object({
        referenceId: z.string(),
        label: z.string(),
        kind: z.string().optional(),
      }),
    )
    .optional(),
  configurationReferences: z
    .array(
      z.object({
        referenceId: z.string(),
        label: z.string(),
        kind: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .optional(),
  schedule: z
    .object({
      plannedStartAt: z.string().optional(),
      plannedEndAt: z.string().optional(),
      timezone: z.string().optional(),
      deadlineAt: z.string().optional(),
      executionWindowNotes: z.string().optional(),
      schedulingConstraints: z.string().optional(),
      scheduleStatus: z.enum(["unset", "planned", "confirmed"]).optional(),
    })
    .optional(),
  customMetadata: z.record(z.string(), z.unknown()).optional(),
});

export const qepExecutionPlanUpdateBodySchema = qepExecutionPlanCreateBodySchema
  .partial()
  .extend({
    ownerId: z.string().min(1).max(128).optional(),
    expectedRevision: z.number().int().nonnegative().optional(),
  });

export const qepExecutionPlanListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  readinessState: z.string().optional(),
  suiteId: z.string().optional(),
  ownerId: z.string().optional(),
  assigneeId: z.string().optional(),
  query: z.string().optional(),
  sortBy: z
    .enum(["name", "updatedAt", "createdAt", "priority", "plannedStartAt"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const qepExecutionPlanLifecycleBodySchema = z.object({
  status: z.enum([
    "draft",
    "in_review",
    "approved",
    "ready",
    "scheduled",
    "handed_off",
    "cancelled",
    "archived",
    "retired",
  ]),
  reason: z.string().max(1000).optional(),
});

export const qepExecutionPlanScheduleBodySchema = z.object({
  plannedStartAt: z.string().optional(),
  plannedEndAt: z.string().optional(),
  timezone: z.string().optional(),
  deadlineAt: z.string().optional(),
  executionWindowNotes: z.string().optional(),
  schedulingConstraints: z.string().optional(),
  scheduleStatus: z.enum(["unset", "planned", "confirmed"]).optional(),
});

export const qepExecutionPlanAssignBodySchema = z.object({
  testLeadId: z.string().optional(),
  testerIds: z.array(z.string()).optional(),
  reviewerIds: z.array(z.string()).optional(),
  approverIds: z.array(z.string()).optional(),
  responsibleTeamId: z.string().optional(),
  observerIds: z.array(z.string()).optional(),
});
