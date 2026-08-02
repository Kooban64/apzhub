import { z } from "zod";

export const qepExecutionSessionIdParamSchema = z.string().min(1).max(128);

export const qepExecutionSessionCreateBodySchema = z.object({
  handoffId: z.string().min(1).max(128),
});

export const qepExecutionSessionListQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  ownerId: z.string().optional(),
  assigneeId: z.string().optional(),
  planId: z.string().optional(),
  handoffId: z.string().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "updatedAt", "createdAt", "percentComplete"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const qepExecutionSessionLifecycleBodySchema = z.object({
  action: z.enum(["open", "pause", "resume", "block", "complete", "cancel", "archive"]),
  reason: z.string().max(1000).optional(),
});

export const qepExecutionSessionStepResultBodySchema = z.object({
  stepId: z.string().min(1),
  outcome: z.enum([
    "pass",
    "fail",
    "block",
    "skip",
    "not_applicable",
    "deferred",
    "not_executed",
  ]),
  comment: z.string().max(4000).optional(),
  failureNotes: z.string().max(4000).optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export const qepExecutionSessionAmendBodySchema = z.object({
  stepId: z.string().min(1),
  outcome: z.enum([
    "pass",
    "fail",
    "block",
    "skip",
    "not_applicable",
    "deferred",
    "not_executed",
  ]),
  reason: z.string().min(1).max(2000),
  comment: z.string().max(4000).optional(),
});

export const qepExecutionSessionEvidenceBodySchema = z.object({
  evidenceId: z.string().min(1).max(128),
  stepId: z.string().optional(),
  note: z.string().max(2000).optional(),
});
