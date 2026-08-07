/**
 * Postgres store for Projects ↔ Workflow approval bindings (Gate P1).
 */

import { getDb, platformProjectsApprovalBinding } from "@apzhub/config/db";
import type { ProjectsApprovalBinding } from "@apzhub/platform-service-contracts";
import { and, desc, eq } from "drizzle-orm";

import type { ProjectsWorkflowBridgeStore } from "./types";

function mapRow(
  row: typeof platformProjectsApprovalBinding.$inferSelect,
): ProjectsApprovalBinding {
  return Object.freeze({
    id: row.id,
    kind: row.kind as ProjectsApprovalBinding["kind"],
    projectId: row.projectId,
    subjectType: row.subjectType as ProjectsApprovalBinding["subjectType"],
    subjectId: row.subjectId,
    title: row.title,
    reason: row.reason ?? undefined,
    status: row.status as ProjectsApprovalBinding["status"],
    workflowRunId: row.workflowRunId ?? undefined,
    workflowTaskId: row.workflowTaskId ?? undefined,
    workflowUnavailableReason: row.workflowUnavailableReason ?? undefined,
    requestedBy: row.requestedBy,
    decidedBy: row.decidedBy ?? undefined,
    decidedAt: row.decidedAt?.toISOString(),
    comment: row.comment ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresProjectsWorkflowBridgeStore(): ProjectsWorkflowBridgeStore {
  return {
    async get(tenantId, bindingId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectsApprovalBinding)
        .where(
          and(
            eq(platformProjectsApprovalBinding.tenantId, tenantId),
            eq(platformProjectsApprovalBinding.id, bindingId),
          ),
        )
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async listForProject(tenantId, projectId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectsApprovalBinding)
        .where(
          and(
            eq(platformProjectsApprovalBinding.tenantId, tenantId),
            eq(platformProjectsApprovalBinding.projectId, projectId),
          ),
        )
        .orderBy(desc(platformProjectsApprovalBinding.updatedAt));
      return Object.freeze(rows.map(mapRow));
    },

    async findOpenForSubject(tenantId, projectId, subjectType, subjectId, kind) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectsApprovalBinding)
        .where(
          and(
            eq(platformProjectsApprovalBinding.tenantId, tenantId),
            eq(platformProjectsApprovalBinding.projectId, projectId),
            eq(platformProjectsApprovalBinding.subjectType, subjectType),
            eq(platformProjectsApprovalBinding.subjectId, subjectId),
            eq(platformProjectsApprovalBinding.kind, kind),
            eq(platformProjectsApprovalBinding.status, "pending"),
          ),
        )
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async findLatestForSubject(tenantId, projectId, subjectType, subjectId, kind) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectsApprovalBinding)
        .where(
          and(
            eq(platformProjectsApprovalBinding.tenantId, tenantId),
            eq(platformProjectsApprovalBinding.projectId, projectId),
            eq(platformProjectsApprovalBinding.subjectType, subjectType),
            eq(platformProjectsApprovalBinding.subjectId, subjectId),
            eq(platformProjectsApprovalBinding.kind, kind),
          ),
        )
        .orderBy(desc(platformProjectsApprovalBinding.updatedAt))
        .limit(1);
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async upsert(tenantId, binding) {
      const db = getDb();
      const values = {
        id: binding.id,
        tenantId,
        kind: binding.kind,
        projectId: binding.projectId,
        subjectType: binding.subjectType,
        subjectId: binding.subjectId,
        title: binding.title,
        reason: binding.reason ?? null,
        status: binding.status,
        workflowRunId: binding.workflowRunId ?? null,
        workflowTaskId: binding.workflowTaskId ?? null,
        workflowUnavailableReason: binding.workflowUnavailableReason ?? null,
        requestedBy: binding.requestedBy,
        decidedBy: binding.decidedBy ?? null,
        decidedAt: binding.decidedAt ? new Date(binding.decidedAt) : null,
        comment: binding.comment ?? null,
        createdAt: new Date(binding.createdAt),
        updatedAt: new Date(binding.updatedAt),
      };
      await db
        .insert(platformProjectsApprovalBinding)
        .values(values)
        .onConflictDoUpdate({
          target: platformProjectsApprovalBinding.id,
          set: {
            status: values.status,
            workflowRunId: values.workflowRunId,
            workflowTaskId: values.workflowTaskId,
            workflowUnavailableReason: values.workflowUnavailableReason,
            decidedBy: values.decidedBy,
            decidedAt: values.decidedAt,
            comment: values.comment,
            updatedAt: values.updatedAt,
          },
        });
      return binding;
    },
  };
}
