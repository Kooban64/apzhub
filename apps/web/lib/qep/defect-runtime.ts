/**
 * Process-local Enterprise Defect Management runtime (APZQEP-140-D).
 * In-memory SoR — LIMITED_AVAILABILITY, consistent with Caps A–C.
 * Cap C sessions are read-only via ExecutionSessionPort.
 */

import {
  createEnterpriseDefectManagement,
  type EnterpriseDefectManagement,
  type ExecutionSessionPort,
} from "@apzhub/qep-defects";

import { getExecutionWorkspaceRuntime } from "./execution-workspace-runtime";

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
    globalForDefects.__apzqepDefectRuntime = createEnterpriseDefectManagement({
      executions: executionSessionPort(),
    });
  }
  return globalForDefects.__apzqepDefectRuntime;
}
