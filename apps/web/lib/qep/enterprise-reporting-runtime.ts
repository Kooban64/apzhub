/**
 * Enterprise Reporting runtime (APZQEP-140-F / APZQEP-151).
 * Derived facts from Cap A–E — Reporting is never business SoR.
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createEnterpriseReportingAnalytics,
  createReportingPersistence,
  type EnterpriseReportingAnalytics,
  type QualityFacts,
  type QualityFactsPort,
  type ReportingEventPublisher,
} from "@apzhub/qep-reporting";

import { getDefectRuntime } from "./defect-runtime";
import { getEnterpriseRequirementsRuntime } from "./enterprise-requirements-runtime";
import { getExecutionPlanRuntime } from "./execution-plan-runtime";
import { getExecutionWorkspaceRuntime } from "./execution-workspace-runtime";
import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";
import { getSuiteRuntime } from "./suite-runtime";

const globalForReporting = globalThis as typeof globalThis & {
  __apzqepEnterpriseReportingRuntime?: EnterpriseReportingAnalytics;
};

function openDefect(status: string): boolean {
  return ![
    "closed",
    "verified",
    "rejected",
    "duplicate",
    "wont_fix",
    "archived",
  ].includes(status);
}

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function qualityFactsPort(): QualityFactsPort {
  return {
    async collect({ tenantId, projectId, now }) {
      // APZQEP-152: no privileged system-reporting actor (HR-001).
      // Facts are derived from Cap repositories under the caller's Cap F authority.
      void now;
      const requirements = await getEnterpriseRequirementsRuntime().repository.list({
        tenantId,
        ...(projectId ? { projectId } : {}),
        includeArchived: false,
      });
      let requirementUncovered = 0;
      let requirementHighRiskGaps = 0;
      let requirementCoverageSum = 0;
      let requirementApproved = 0;
      for (const req of requirements) {
        if (req.status === "approved" || req.status === "active") {
          requirementApproved += 1;
        }
        const linked = req.suiteLinks?.length ?? 0;
        const overallCoverage = linked > 0 ? 100 : 0;
        requirementCoverageSum += overallCoverage;
        if (linked === 0) requirementUncovered += 1;
        if (linked === 0 && (req.risk === "high" || req.criticality === "critical")) {
          requirementHighRiskGaps += 1;
        }
      }

      const suites = await getSuiteRuntime().repository.list({
        tenantId,
        ...(projectId ? { projectId } : {}),
        includeDeleted: false,
      });
      const suiteActive = suites.filter(
        (s) => s.status === "published" || s.status === "approved",
      ).length;

      const plans = await getExecutionPlanRuntime().repository.list({
        tenantId,
        ...(projectId ? { projectId } : {}),
        includeArchived: true,
      });
      const planReady = plans.filter((p) => p.status === "ready").length;
      const planHandedOff = plans.filter((p) => p.status === "handed_off").length;

      const sessions = await getExecutionWorkspaceRuntime().repository.list({
        tenantId,
        ...(projectId ? { projectId } : {}),
        includeArchived: true,
      });
      let sessionCompleted = 0;
      let sessionInProgress = 0;
      let sessionBlocked = 0;
      let sessionPassed = 0;
      let sessionFailed = 0;
      let evidenceTotal = 0;
      for (const s of sessions) {
        if (s.status === "completed") sessionCompleted += 1;
        if (s.status === "in_progress") sessionInProgress += 1;
        if (s.status === "blocked") sessionBlocked += 1;
        evidenceTotal += s.evidenceRefs.length;
        if (s.status === "completed") {
          const outcomes = s.steps.map((st) => st.outcome);
          if (outcomes.includes("fail") || outcomes.includes("block")) {
            sessionFailed += 1;
          } else if (outcomes.some((o) => o === "pass")) {
            sessionPassed += 1;
          }
        }
      }

      const defects = await getDefectRuntime().repository.list({
        tenantId,
        ...(projectId ? { projectId } : {}),
        includeArchived: true,
      });
      let defectOpen = 0;
      let defectCritical = 0;
      let defectRetest = 0;
      let defectVerified = 0;
      let defectAgingDaysSum = 0;
      let defectAgingCount = 0;
      for (const d of defects) {
        if (openDefect(d.status)) {
          defectOpen += 1;
          defectAgingDaysSum += daysBetween(d.createdAt, now);
          defectAgingCount += 1;
        }
        if (d.severity === "critical" && openDefect(d.status)) {
          defectCritical += 1;
        }
        if (d.status === "ready_for_retest") defectRetest += 1;
        if (d.status === "verified" || d.status === "closed") {
          defectVerified += 1;
        }
        evidenceTotal += d.evidenceRefs.length;
      }

      const facts: QualityFacts = {
        tenantId,
        ...(projectId ? { projectId } : {}),
        asOf: now,
        requirementTotal: requirements.length,
        requirementApproved,
        requirementUncovered,
        requirementHighRiskGaps,
        requirementCoverageAvg:
          requirements.length === 0
            ? 0
            : Math.round(requirementCoverageSum / requirements.length),
        suiteTotal: suites.length,
        suiteActive,
        planTotal: plans.length,
        planReady,
        planHandedOff,
        sessionTotal: sessions.length,
        sessionCompleted,
        sessionInProgress,
        sessionBlocked,
        sessionPassed,
        sessionFailed,
        evidenceTotal,
        evidenceIntegrityOk: evidenceTotal,
        defectTotal: defects.length,
        defectOpen,
        defectCritical,
        defectRetest,
        defectVerified,
        defectAgingDaysSum,
        defectAgingCount,
      };
      return facts;
    },
  };
}

export function getEnterpriseReportingRuntime(): EnterpriseReportingAnalytics {
  if (!globalForReporting.__apzqepEnterpriseReportingRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createReportingPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? (createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_saved_report",
          }) as unknown as ReportingEventPublisher)
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForReporting.__apzqepEnterpriseReportingRuntime =
      createEnterpriseReportingAnalytics({
        facts: qualityFactsPort(),
        repository,
        ...(publisher ? { publisher } : {}),
        ...(runInTransaction ? { runInTransaction } : {}),
      });
  }
  return globalForReporting.__apzqepEnterpriseReportingRuntime;
}
