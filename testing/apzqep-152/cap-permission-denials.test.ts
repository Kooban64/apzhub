/**
 * APZQEP-152 — Cap B–F domain fail-closed without Cap permissions.
 */
import { describe, expect, it } from "vitest";

import { createEnterpriseTestExecutionPlanning } from "@apzhub/qep-execution-plans";
import { createEnterpriseTestExecutionWorkspace } from "@apzhub/qep-execution-workspace";
import { createEnterpriseDefectManagement } from "@apzhub/qep-defects";
import { createEnterpriseRequirementsTraceability } from "@apzhub/qep-requirements-traceability";
import { createEnterpriseReportingAnalytics } from "@apzhub/qep-reporting";

const emptyActor = {
  userId: "u-deny",
  tenantId: "t-deny",
  permissions: [] as string[],
};
const now = "2026-08-03T06:40:00.000Z";

describe("APZQEP-152 Cap B–F permission denials", () => {
  it("denies Cap B plan create without permissions", async () => {
    const { service } = createEnterpriseTestExecutionPlanning({
      suites: {
        async getSuiteReference() {
          return {
            suiteId: "s1",
            suiteVersion: 1,
            suiteName: "S",
            suiteStatusAtBind: "published",
          };
        },
      },
    });
    await expect(
      service.create(
        emptyActor,
        {
          name: "Plan",
          suiteRef: {
            suiteId: "s1",
            suiteVersion: 1,
            suiteName: "S",
            suiteStatusAtBind: "published",
          },
        },
        now,
      ),
    ).rejects.toThrow(/permission/);
  });

  it("denies Cap C session create without permissions", async () => {
    const { service } = createEnterpriseTestExecutionWorkspace({
      plans: {
        async getHandoff() {
          return {
            planId: "p1",
            handoffId: "h1",
            planName: "P",
            suiteId: "s1",
            suiteVersion: 1,
            suiteName: "S",
            environmentLabels: [],
            configurationLabels: [],
            assigneeIds: [],
            handedOffAt: now,
            correlationId: "c1",
          };
        },
      },
    });
    await expect(
      service.createFromHandoff(
        emptyActor,
        {
          planId: "p1",
          handoffId: "h1",
          planName: "P",
          suiteId: "s1",
          suiteVersion: 1,
          suiteName: "S",
          environmentLabels: [],
          configurationLabels: [],
          assigneeIds: [],
          handedOffAt: now,
          correlationId: "c1",
        },
        now,
      ),
    ).rejects.toThrow(/permission/);
  });

  it("denies Cap D defect create without permissions", async () => {
    const { service } = createEnterpriseDefectManagement();
    await expect(
      service.create(
        emptyActor,
        {
          title: "D",
          description: "x",
          severity: "major",
          priority: "p2",
        },
        now,
      ),
    ).rejects.toThrow(/permission/);
  });

  it("denies Cap E requirement create without permissions", async () => {
    const { service } = createEnterpriseRequirementsTraceability();
    await expect(
      service.create(
        emptyActor,
        {
          title: "R",
          description: "x",
          category: "functional",
          priority: "normal",
          criticality: "medium",
          risk: "medium",
        },
        now,
      ),
    ).rejects.toThrow(/permission/);
  });

  it("denies Cap F saved report create without permissions", async () => {
    const facts = {
      async collect() {
        return {
          tenantId: "t-deny",
          asOf: now,
          requirementTotal: 0,
          requirementApproved: 0,
          requirementUncovered: 0,
          requirementHighRiskGaps: 0,
          requirementCoverageAvg: 0,
          suiteTotal: 0,
          suiteActive: 0,
          planTotal: 0,
          planReady: 0,
          planHandedOff: 0,
          sessionTotal: 0,
          sessionCompleted: 0,
          sessionInProgress: 0,
          sessionBlocked: 0,
          sessionPassed: 0,
          sessionFailed: 0,
          evidenceTotal: 0,
          evidenceIntegrityOk: 0,
          defectTotal: 0,
          defectOpen: 0,
          defectCritical: 0,
          defectRetest: 0,
          defectVerified: 0,
          defectAgingDaysSum: 0,
          defectAgingCount: 0,
        };
      },
    };
    const { service } = createEnterpriseReportingAnalytics({ facts });
    await expect(
      service.createSavedReport(
        emptyActor,
        {
          name: "Rpt",
          templateId: "execution_summary",
          filters: {},
        },
        now,
      ),
    ).rejects.toThrow(/permission/);
  });
});
