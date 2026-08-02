/**
 * Enterprise Defect Management runtime (APZQEP-140-D / APZQEP-151).
 * Cap C sessions are read-only via ExecutionSessionPort.
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createDefectPersistence,
  createEnterpriseDefectManagement,
  type DefectEventPublisher,
  type EnterpriseDefectManagement,
  type ExecutionSessionPort,
} from "@apzhub/qep-defects";

import { getExecutionWorkspaceRuntime } from "./execution-workspace-runtime";
import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForDefects = globalThis as typeof globalThis & {
  __apzqepDefectRuntime?: EnterpriseDefectManagement;
};

function executionSessionPort(): ExecutionSessionPort {
  return {
    async get(tenantId, sessionId) {
      try {
        const agg = await getExecutionWorkspaceRuntime().repository.get(
          tenantId,
          sessionId,
        );
        if (!agg) return undefined;
        const s = agg.session;
        return {
          sessionId: s.sessionId,
          tenantId: s.tenantId,
          ...(s.projectId ? { projectId: s.projectId } : {}),
          name: s.name,
          status: s.status,
          ...(s.planning.planId ? { planId: s.planning.planId } : {}),
          ...(s.planning.suiteId ? { suiteId: s.planning.suiteId } : {}),
          ...(s.planning.suiteName ? { suiteName: s.planning.suiteName } : {}),
          steps: s.steps.map((step) => ({
            stepId: step.stepId,
            title: step.title,
            outcome: step.outcome,
            ...(step.failureNotes ? { failureNotes: step.failureNotes } : {}),
            evidenceIds: step.evidenceIds,
          })),
          evidenceIds: s.evidenceRefs.map((e) => e.evidenceId),
        };
      } catch {
        return undefined;
      }
    },
  };
}

export function getDefectRuntime(): EnterpriseDefectManagement {
  if (!globalForDefects.__apzqepDefectRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createDefectPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? (createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_defect",
          }) as unknown as DefectEventPublisher)
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForDefects.__apzqepDefectRuntime = createEnterpriseDefectManagement({
      executions: executionSessionPort(),
      repository,
      ...(publisher ? { publisher } : {}),
      ...(runInTransaction ? { runInTransaction } : {}),
    });
  }
  return globalForDefects.__apzqepDefectRuntime;
}
