/**
 * Enterprise Requirements & Traceability runtime (APZQEP-140-E / APZQEP-151).
 * Cap A–D ports are read-only.
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createEnterpriseRequirementsTraceability,
  createRequirementPersistence,
  type EnterpriseRequirementsTraceability,
  type QualityArtefactPorts,
  type RequirementEventPublisher,
} from "@apzhub/qep-requirements-traceability";

import { getDefectRuntime } from "./defect-runtime";
import { getExecutionPlanRuntime } from "./execution-plan-runtime";
import { getExecutionWorkspaceRuntime } from "./execution-workspace-runtime";
import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";
import { getSuiteRuntime } from "./suite-runtime";

const globalForReq = globalThis as typeof globalThis & {
  __apzqepEnterpriseRequirementsRuntime?: EnterpriseRequirementsTraceability;
};

function qualityPorts(): QualityArtefactPorts {
  return {
    async getSuite(tenantId, suiteId) {
      const agg = await getSuiteRuntime().repository.get(tenantId, suiteId);
      if (!agg) return undefined;
      return {
        suiteId: agg.suite.suiteId,
        tenantId: agg.suite.tenantId,
        name: agg.suite.name,
        ...(agg.suite.projectId ? { projectId: agg.suite.projectId } : {}),
        status: agg.suite.status,
      };
    },
    async listPlansBySuite(tenantId, suiteId) {
      const plans = await getExecutionPlanRuntime().repository.list({
        tenantId,
        suiteId,
        includeArchived: true,
      });
      return plans.map((p) => ({
        planId: p.planId,
        tenantId: p.tenantId,
        suiteId: p.suiteRef.suiteId,
        name: p.name,
        status: p.status,
      }));
    },
    async listSessionsBySuite(tenantId, suiteId) {
      const sessions = await getExecutionWorkspaceRuntime().repository.list({
        tenantId,
        includeArchived: true,
      });
      return sessions
        .filter((s) => s.planning.suiteId === suiteId)
        .map((s) => ({
          sessionId: s.sessionId,
          tenantId: s.tenantId,
          ...(s.planning.planId ? { planId: s.planning.planId } : {}),
          suiteId: s.planning.suiteId,
          name: s.name,
          status: s.status,
          evidenceIds: s.evidenceRefs.map((e) => e.evidenceId),
          stepOutcomes: s.steps.map((step) => step.outcome),
        }));
    },
    async listDefectsBySuite(tenantId, suiteId) {
      const defects = await getDefectRuntime().repository.list({
        tenantId,
        suiteId,
        includeArchived: true,
      });
      return defects.map((d) => ({
        defectId: d.defectId,
        tenantId: d.tenantId,
        title: d.title,
        status: d.status,
        ...(d.executionOrigin?.sessionId
          ? { sessionId: d.executionOrigin.sessionId }
          : {}),
        ...(d.executionOrigin?.suiteId ? { suiteId: d.executionOrigin.suiteId } : {}),
        evidenceIds: d.evidenceRefs.map((e) => e.evidenceId),
      }));
    },
  };
}

export function getEnterpriseRequirementsRuntime(): EnterpriseRequirementsTraceability {
  if (!globalForReq.__apzqepEnterpriseRequirementsRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createRequirementPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? (createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_enterprise_requirement",
          }) as unknown as RequirementEventPublisher)
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForReq.__apzqepEnterpriseRequirementsRuntime =
      createEnterpriseRequirementsTraceability({
        ports: qualityPorts(),
        repository,
        ...(publisher ? { publisher } : {}),
        ...(runInTransaction ? { runInTransaction } : {}),
      });
  }
  return globalForReq.__apzqepEnterpriseRequirementsRuntime;
}
