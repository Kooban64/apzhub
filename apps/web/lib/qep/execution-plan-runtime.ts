/**
 * Enterprise Test Execution Planning runtime (APZQEP-140-B / APZQEP-151).
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createEnterpriseTestExecutionPlanning,
  createExecutionPlanPersistence,
  type EnterpriseTestExecutionPlanning,
  type PlanEventPublisher,
} from "@apzhub/qep-execution-plans";

import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";
import { getSuiteRuntime } from "./suite-runtime";

const globalForPlans = globalThis as typeof globalThis & {
  __apzqepExecutionPlanRuntime?: EnterpriseTestExecutionPlanning;
};

function suitePort() {
  return {
    async get(tenantId: string, suiteId: string) {
      try {
        const agg = await getSuiteRuntime().repository.get(tenantId, suiteId);
        if (!agg) return undefined;
        return {
          suiteId: agg.suite.suiteId,
          tenantId: agg.suite.tenantId,
          ...(agg.suite.projectId ? { projectId: agg.suite.projectId } : {}),
          name: agg.suite.name,
          status: agg.suite.status,
          version: agg.suite.version,
        };
      } catch {
        return undefined;
      }
    },
  };
}

export function getExecutionPlanRuntime(): EnterpriseTestExecutionPlanning {
  if (!globalForPlans.__apzqepExecutionPlanRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createExecutionPlanPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? (createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_execution_plan",
          }) as unknown as PlanEventPublisher)
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForPlans.__apzqepExecutionPlanRuntime = createEnterpriseTestExecutionPlanning(
      {
        suites: suitePort(),
        repository,
        ...(publisher ? { publisher } : {}),
        ...(runInTransaction ? { runInTransaction } : {}),
      },
    );
  }
  return globalForPlans.__apzqepExecutionPlanRuntime;
}
