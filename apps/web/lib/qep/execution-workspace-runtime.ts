/**
 * Enterprise Test Execution Workspace runtime (APZQEP-140-C / APZQEP-151).
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createEnterpriseTestExecutionWorkspace,
  createExecutionSessionPersistence,
  type EnterpriseTestExecutionWorkspace,
  type PlanHandoffPort,
  type SessionEventPublisher,
} from "@apzhub/qep-execution-workspace";

import { getExecutionPlanRuntime } from "./execution-plan-runtime";
import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForWorkspace = globalThis as typeof globalThis & {
  __apzqepExecutionWorkspaceRuntime?: EnterpriseTestExecutionWorkspace;
};

function planHandoffPort(): PlanHandoffPort {
  return {
    async getByHandoff(tenantId, handoffId) {
      const items = await getExecutionPlanRuntime().repository.list({
        tenantId,
        includeArchived: true,
      });
      const match = items.find((p) => p.handoff?.handoffId === handoffId);
      if (!match?.handoff) return undefined;
      return {
        planId: match.planId,
        handoffId: match.handoff.handoffId,
        tenantId: match.tenantId,
        ...(match.projectId ? { projectId: match.projectId } : {}),
        planName: match.name,
        suiteId: match.suiteRef.suiteId,
        suiteVersion: match.suiteRef.suiteVersion,
        suiteName: match.suiteRef.suiteName,
        environmentLabels: match.environmentReferences.map((e) => e.label),
        configurationLabels: match.configurationReferences.map((c) => c.label),
        assigneeIds: [
          ...(match.assignments.testLeadId ? [match.assignments.testLeadId] : []),
          ...match.assignments.testerIds,
        ],
        ...(match.schedule.plannedStartAt
          ? { plannedStartAt: match.schedule.plannedStartAt }
          : {}),
        ...(match.schedule.plannedEndAt
          ? { plannedEndAt: match.schedule.plannedEndAt }
          : {}),
        handedOffAt: match.handoff.handedOffAt,
        correlationId: match.handoff.correlationId,
        status: match.status,
      };
    },
    async getByPlanId(tenantId, planId) {
      const agg = await getExecutionPlanRuntime().repository.get(tenantId, planId);
      if (!agg?.plan.handoff) return undefined;
      return this.getByHandoff(tenantId, agg.plan.handoff.handoffId);
    },
  };
}

export function getExecutionWorkspaceRuntime(): EnterpriseTestExecutionWorkspace {
  if (!globalForWorkspace.__apzqepExecutionWorkspaceRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createExecutionSessionPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? (createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_execution_session",
          }) as unknown as SessionEventPublisher)
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForWorkspace.__apzqepExecutionWorkspaceRuntime =
      createEnterpriseTestExecutionWorkspace({
        plans: planHandoffPort(),
        repository,
        ...(publisher ? { publisher } : {}),
        ...(runInTransaction ? { runInTransaction } : {}),
      });
  }
  return globalForWorkspace.__apzqepExecutionWorkspaceRuntime;
}
