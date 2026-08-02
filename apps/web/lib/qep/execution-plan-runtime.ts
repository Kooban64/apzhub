/**
 * Process-local Enterprise Test Execution Planning runtime (APZQEP-140-B).
 * In-memory SoR — consistent with Cap A LIMITED_AVAILABILITY.
 */

import {
  createEnterpriseTestExecutionPlanning,
  type EnterpriseTestExecutionPlanning,
} from "@apzhub/qep-execution-plans";

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
    globalForPlans.__apzqepExecutionPlanRuntime = createEnterpriseTestExecutionPlanning(
      { suites: suitePort() },
    );
  }
  return globalForPlans.__apzqepExecutionPlanRuntime;
}
