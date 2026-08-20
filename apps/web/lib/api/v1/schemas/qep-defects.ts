import { z } from "zod";

export const qepDefectIdParamSchema = z.string().min(1).max(128);

export const qepDefectCreateBodySchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(8000).optional(),
  projectId: z.string().max(128).optional(),
  severity: z.enum(["critical", "major", "minor", "trivial"]).optional(),
  priority: z.enum(["p0", "p1", "p2", "p3", "p4"]).optional(),
  category: z.string().max(200).optional(),
  environment: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  applicationVersion: z.string().max(200).optional(),
  releaseReference: z.string().max(200).optional(),
  assigneeId: z.string().max(128).optional(),
  reviewerId: z.string().max(128).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  sessionId: z.string().max(128).optional(),
  stepId: z.string().max(128).optional(),
  evidenceIds: z.array(z.string().max(128)).max(100).optional(),
  suiteId: z.string().max(128).optional(),
  planId: z.string().max(128).optional(),
  testExecutionId: z.string().max(128).optional(),
});

export const qepDefectFromExecutionBodySchema = z.object({
  sessionId: z.string().min(1).max(128),
  stepId: z.string().max(128).optional(),
  title: z.string().max(500).optional(),
  description: z.string().max(8000).optional(),
  severity: z.enum(["critical", "major", "minor", "trivial"]).optional(),
  priority: z.enum(["p0", "p1", "p2", "p3", "p4"]).optional(),
});

export const qepDefectListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  sessionId: z.string().optional(),
  suiteId: z.string().optional(),
  query: z.string().optional(),
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  sortBy: z
    .enum(["title", "updatedAt", "createdAt", "severity", "priority"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const qepDefectUpdateBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(8000).optional(),
  severity: z.enum(["critical", "major", "minor", "trivial"]).optional(),
  priority: z.enum(["p0", "p1", "p2", "p3", "p4"]).optional(),
  category: z.string().max(200).optional(),
  environment: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  applicationVersion: z.string().max(200).optional(),
  releaseReference: z.string().max(200).optional(),
  assigneeId: z.string().max(128).optional(),
  reviewerId: z.string().max(128).optional(),
  tags: z.array(z.string().max(64)).max(50).optional(),
  resolution: z.string().max(4000).optional(),
  rootCause: z.string().max(4000).optional(),
  verificationNotes: z.string().max(4000).optional(),
  duplicateOfDefectId: z.string().max(128).optional(),
  expectedRevision: z.number().int().nonnegative().optional(),
});

export const qepDefectLifecycleBodySchema = z.object({
  status: z.enum([
    "new",
    "triaged",
    "assigned",
    "in_progress",
    "fixed",
    "ready_for_retest",
    "verified",
    "rejected",
    "duplicate",
    "wont_fix",
    "closed",
    "archived",
  ]),
  reason: z.string().max(2000).optional(),
});

export const qepDefectAssignBodySchema = z.object({
  assigneeId: z.string().min(1).max(128),
});

export const qepDefectEvidenceBodySchema = z.object({
  evidenceId: z.string().min(1).max(128),
  note: z.string().max(2000).optional(),
});

export const qepDefectRelationshipBodySchema = z.object({
  kind: z.enum([
    "execution_session",
    "execution_step",
    "test_execution",
    "evidence",
    "suite",
    "execution_plan",
    "defect",
    "release",
    "environment",
    "requirement_future",
    "exploratory_session",
    "experience_verification",
    "quality_observation",
    "quality_issue",
    "experience_criterion",
    "experience_context",
  ]),
  targetId: z.string().min(1).max(128),
  label: z.string().max(500).optional(),
});
