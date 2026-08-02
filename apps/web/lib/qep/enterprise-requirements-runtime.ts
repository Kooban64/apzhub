/**
 * Process-local Enterprise Requirements & Traceability runtime (APZQEP-140-E).
 * In-memory SoR — LIMITED_AVAILABILITY. Cap A–D ports are read-only.
 */

import {
  createEnterpriseRequirementsTraceability,
  type EnterpriseRequirementsTraceability,
  type QualityArtefactPorts,
} from "@apzhub/qep-requirements-traceability";

import { getDefectRuntime } from "./defect-runtime";
import { getExecutionPlanRuntime } from "./execution-plan-runtime";
import { getExecutionWorkspaceRuntime } from "./execution-workspace-runtime";
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
    globalForReq.__apzqepEnterpriseRequirementsRuntime =
      createEnterpriseRequirementsTraceability({ ports: qualityPorts() });
  }
  return globalForReq.__apzqepEnterpriseRequirementsRuntime;
}
