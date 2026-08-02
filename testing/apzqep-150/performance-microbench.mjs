/**
 * APZQEP-150-02 — observational microbench (process-local Cap A–F factories).
 * Documents actual timings; does not invent claims.
 */

import { performance } from "node:perf_hooks";
import process, { stdout } from "node:process";
import { createEnterpriseTestSuiteManagement } from "../../packages/qep-suites/src/index.ts";
import { createEnterpriseTestExecutionPlanning } from "../../packages/qep-execution-plans/src/index.ts";
import { createEnterpriseReportingAnalytics } from "../../packages/qep-reporting/src/index.ts";

const actor = {
  userId: "perf-1",
  tenantId: "tenant-perf",
  permissions: [
    "qep.suites.read",
    "qep.suites.create",
    "qep.suites.update",
    "qep.suites.lifecycle",
    "qep.execution_plans.read",
    "qep.execution_plans.create",
    "qep.execution_plans.update",
    "qep.execution_plans.lifecycle",
    "qep.reporting.read",
  ],
};

function ms(start) {
  return Number((performance.now() - start).toFixed(2));
}

const results = {};

const suites = createEnterpriseTestSuiteManagement();
let t0 = performance.now();
const N = 200;
for (let i = 0; i < N; i++) {
  await suites.service.create(
    actor,
    { name: `Suite ${i}`, projectId: "proj-perf" },
    new Date(Date.UTC(2026, 7, 2, 18, 0, 0, i)).toISOString(),
  );
}
results.suiteCreate_x200_ms = ms(t0);

t0 = performance.now();
const listed = await suites.repository.list({
  tenantId: "tenant-perf",
  includeDeleted: false,
});
results.suiteList_200_ms = ms(t0);
results.suiteList_count = listed.length;

const plans = createEnterpriseTestExecutionPlanning({
  suites: {
    async get(tenantId, suiteId) {
      const agg = await suites.repository.get(tenantId, suiteId);
      if (!agg) return undefined;
      return {
        suiteId: agg.suite.suiteId,
        tenantId: agg.suite.tenantId,
        name: agg.suite.name,
        status: agg.suite.status,
        version: agg.suite.version,
      };
    },
  },
});

// Publish first suite for plan create
const first = listed[0];
for (const state of ["review", "approved", "published"]) {
  await suites.service.transition(
    actor,
    first.suiteId,
    state,
    new Date().toISOString(),
  );
}

t0 = performance.now();
for (let i = 0; i < 50; i++) {
  await plans.service.create(
    actor,
    {
      name: `Plan ${i}`,
      suiteId: first.suiteId,
      projectId: "proj-perf",
      assignments: { testerIds: ["t1"] },
      environmentReferences: [{ referenceId: "e1", label: "QA" }],
    },
    new Date(Date.UTC(2026, 7, 2, 19, 0, 0, i)).toISOString(),
  );
}
results.planCreate_x50_ms = ms(t0);

const reporting = createEnterpriseReportingAnalytics({
  facts: {
    async collect({ tenantId, now }) {
      return {
        tenantId,
        asOf: now,
        requirementTotal: 100,
        requirementApproved: 80,
        requirementUncovered: 10,
        requirementHighRiskGaps: 2,
        requirementCoverageAvg: 75,
        suiteTotal: listed.length,
        suiteActive: listed.length,
        planTotal: 50,
        planReady: 10,
        planHandedOff: 5,
        sessionTotal: 40,
        sessionCompleted: 20,
        sessionInProgress: 10,
        sessionBlocked: 2,
        sessionPassed: 15,
        sessionFailed: 5,
        evidenceTotal: 60,
        evidenceIntegrityOk: 58,
        defectTotal: 12,
        defectOpen: 7,
        defectCritical: 1,
        defectRetest: 2,
        defectVerified: 3,
        defectAgingDaysSum: 40,
        defectAgingCount: 7,
      };
    },
  },
});

t0 = performance.now();
for (let i = 0; i < 100; i++) {
  await reporting.service.getDashboard(actor, "executive", new Date().toISOString());
}
results.dashboardExecutive_x100_ms = ms(t0);
results.dashboardExecutive_avg_ms = Number(
  (results.dashboardExecutive_x100_ms / 100).toFixed(2),
);

results.heapUsed_mb = Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));
results.observedAt = new Date().toISOString();
results.environment = "process-local vitest/node microbench — not production load";

stdout.write(`${JSON.stringify(results, null, 2)}\n`);
