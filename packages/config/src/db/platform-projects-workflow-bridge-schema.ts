/**
 * APZ Projects ↔ Workflow approval bindings (Release 3.0 Gate P1).
 */

import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformProjectsApprovalBinding = pgTable(
  "apz_platform_projects_approval_binding",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    kind: text("kind").notNull(),
    projectId: text("project_id").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    title: text("title").notNull(),
    reason: text("reason"),
    status: text("status").notNull(),
    workflowRunId: text("workflow_run_id"),
    workflowTaskId: text("workflow_task_id"),
    workflowUnavailableReason: text("workflow_unavailable_reason"),
    requestedBy: text("requested_by").notNull(),
    decidedBy: text("decided_by"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byProject: index("idx_apz_pab_project").on(table.tenantId, table.projectId),
    bySubject: index("idx_apz_pab_subject").on(
      table.tenantId,
      table.projectId,
      table.subjectType,
      table.subjectId,
      table.kind,
    ),
    byStatus: index("idx_apz_pab_status").on(table.tenantId, table.status),
  }),
);
