/**
 * PostgreSQL ExecutionStore — QX-PR-01.
 * Production Source of Record for Automation executions.
 */
import {
  getDatabaseExecutor,
  qepAutomationExecution,
  type DatabaseExecutor,
} from "@apzhub/config";
import type {
  AutomationExecutionRecord,
  ExecutionStore,
} from "@apzhub/platform-automation";
import { and, desc, eq } from "drizzle-orm";

function toRecord(
  row: typeof qepAutomationExecution.$inferSelect,
): AutomationExecutionRecord {
  return row.executionJson as unknown as AutomationExecutionRecord;
}

export function createPostgresExecutionStore(db: DatabaseExecutor): ExecutionStore {
  const exec = () => getDatabaseExecutor(db);

  return {
    async save(record: AutomationExecutionRecord): Promise<void> {
      const values = {
        id: record.executionId,
        tenantId: record.tenantId,
        projectId: record.projectId ?? null,
        providerId: record.providerId,
        correlationId: record.correlationId,
        requestedBy: record.requestedBy,
        state: record.state,
        attempt: record.attempt,
        maxAttempts: record.maxAttempts,
        executionJson: record as unknown as Record<string, unknown>,
        revision: 1,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        createdBy: record.requestedBy,
        updatedBy: record.requestedBy,
      };

      const existing = await exec()
        .select({
          id: qepAutomationExecution.id,
          revision: qepAutomationExecution.revision,
        })
        .from(qepAutomationExecution)
        .where(eq(qepAutomationExecution.id, record.executionId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepAutomationExecution)
          .set({
            projectId: values.projectId,
            providerId: values.providerId,
            correlationId: values.correlationId,
            requestedBy: values.requestedBy,
            state: values.state,
            attempt: values.attempt,
            maxAttempts: values.maxAttempts,
            executionJson: values.executionJson,
            revision: existing[0].revision + 1,
            updatedAt: values.updatedAt,
            updatedBy: values.updatedBy,
          })
          .where(eq(qepAutomationExecution.id, record.executionId));
        return;
      }

      await exec().insert(qepAutomationExecution).values(values);
    },

    async get(executionId: string): Promise<AutomationExecutionRecord | undefined> {
      const rows = await exec()
        .select()
        .from(qepAutomationExecution)
        .where(eq(qepAutomationExecution.id, executionId))
        .limit(1);
      return rows[0] ? toRecord(rows[0]) : undefined;
    },

    async list(tenantId?: string): Promise<readonly AutomationExecutionRecord[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepAutomationExecution)
            .where(eq(qepAutomationExecution.tenantId, tenantId))
            .orderBy(desc(qepAutomationExecution.createdAt))
        : await exec()
            .select()
            .from(qepAutomationExecution)
            .orderBy(desc(qepAutomationExecution.createdAt));
      return rows.map(toRecord);
    },
  };
}

/** Test helper — delete all rows for a tenant. */
export async function deleteAutomationExecutionsForTenant(
  tenantId: string,
  db: DatabaseExecutor,
): Promise<void> {
  await getDatabaseExecutor(db)
    .delete(qepAutomationExecution)
    .where(and(eq(qepAutomationExecution.tenantId, tenantId)));
}
