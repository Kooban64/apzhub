import { randomUUID } from "node:crypto";

import type {
  CertificationExceptionRecord,
  QualityGateDefinitionRecord,
  QualityGateEvaluationRecord,
  QualityRiskHistoryEntry,
  QualityRiskRecord,
  QualityRiskSignal,
} from "../domain/types";
import type { AssuranceRepository } from "./repository";

function key(tenantId: string, id: string): string {
  return `${tenantId}:${id}`;
}

export function newOpaqueId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

export function createInMemoryAssuranceRepository(): AssuranceRepository {
  const counters = new Map<string, number>();
  const risks = new Map<string, QualityRiskRecord>();
  const riskHistory = new Map<string, QualityRiskHistoryEntry[]>();
  const riskSignals = new Map<string, QualityRiskSignal[]>();
  const gates = new Map<string, QualityGateDefinitionRecord>();
  const evaluations = new Map<string, QualityGateEvaluationRecord>();
  const exceptions = new Map<string, CertificationExceptionRecord>();

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const id = `${tenantId}:${applicationId}:${kind}`;
      const next = (counters.get(id) ?? 0) + 1;
      counters.set(id, next);
      return next;
    },
    async saveRisk(row) {
      risks.set(key(row.tenantId, row.id), row);
    },
    async getRisk(tenantId, id) {
      return risks.get(key(tenantId, id));
    },
    async listRisks(tenantId, applicationId) {
      return [...risks.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async appendRiskHistory(tenantId, riskId, entry) {
      const id = key(tenantId, riskId);
      riskHistory.set(id, [...(riskHistory.get(id) ?? []), entry]);
    },
    async listRiskHistory(tenantId, riskId) {
      return riskHistory.get(key(tenantId, riskId)) ?? [];
    },
    async saveRiskSignals(tenantId, riskId, signals) {
      riskSignals.set(key(tenantId, riskId), [...signals]);
    },
    async listRiskSignals(tenantId, riskId) {
      return riskSignals.get(key(tenantId, riskId)) ?? [];
    },
    async saveGateDefinition(row) {
      gates.set(key(row.tenantId, row.id), row);
    },
    async getGateDefinition(tenantId, id) {
      return gates.get(key(tenantId, id));
    },
    async listGateDefinitions(tenantId, applicationId) {
      return [...gates.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => a.number.localeCompare(b.number));
    },
    async saveGateEvaluation(row) {
      evaluations.set(key(row.tenantId, row.id), row);
    },
    async getGateEvaluation(tenantId, id) {
      return evaluations.get(key(tenantId, id));
    },
    async listGateEvaluations(tenantId, applicationId) {
      return [...evaluations.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
    },
    async listGateEvaluationsForContext(tenantId, applicationId, changeEventId) {
      return [...evaluations.values()]
        .filter(
          (row) =>
            row.tenantId === tenantId &&
            row.applicationId === applicationId &&
            row.changeEventId === changeEventId,
        )
        .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
    },
    async saveException(row) {
      exceptions.set(key(row.tenantId, row.id), row);
    },
    async getException(tenantId, id) {
      return exceptions.get(key(tenantId, id));
    },
    async listExceptionsForContext(tenantId, applicationId, changeEventId) {
      return [...exceptions.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.applicationId === applicationId &&
          row.changeEventId === changeEventId,
      );
    },
  };
}
