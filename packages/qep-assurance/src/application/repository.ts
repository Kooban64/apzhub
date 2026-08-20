import type {
  CertificationExceptionRecord,
  QualityFactSnapshot,
  QualityGateDefinitionRecord,
  QualityGateEvaluationRecord,
  QualityRiskHistoryEntry,
  QualityRiskRecord,
  QualityRiskSignal,
} from "../domain/types";

export type AssuranceRepository = {
  nextKeyNumber(tenantId: string, applicationId: string, kind: string): Promise<number>;

  saveRisk(row: QualityRiskRecord): Promise<void>;
  getRisk(tenantId: string, id: string): Promise<QualityRiskRecord | undefined>;
  listRisks(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QualityRiskRecord[]>;
  appendRiskHistory(
    tenantId: string,
    riskId: string,
    entry: QualityRiskHistoryEntry & { readonly applicationId: string },
  ): Promise<void>;
  listRiskHistory(
    tenantId: string,
    riskId: string,
  ): Promise<readonly QualityRiskHistoryEntry[]>;
  saveRiskSignals(
    tenantId: string,
    riskId: string,
    signals: readonly QualityRiskSignal[],
  ): Promise<void>;
  listRiskSignals(
    tenantId: string,
    riskId: string,
  ): Promise<readonly QualityRiskSignal[]>;

  saveGateDefinition(row: QualityGateDefinitionRecord): Promise<void>;
  getGateDefinition(
    tenantId: string,
    id: string,
  ): Promise<QualityGateDefinitionRecord | undefined>;
  listGateDefinitions(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QualityGateDefinitionRecord[]>;

  saveGateEvaluation(row: QualityGateEvaluationRecord): Promise<void>;
  getGateEvaluation(
    tenantId: string,
    id: string,
  ): Promise<QualityGateEvaluationRecord | undefined>;
  listGateEvaluations(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QualityGateEvaluationRecord[]>;
  listGateEvaluationsForContext(
    tenantId: string,
    applicationId: string,
    changeEventId: string,
  ): Promise<readonly QualityGateEvaluationRecord[]>;

  saveException(row: CertificationExceptionRecord): Promise<void>;
  getException(
    tenantId: string,
    id: string,
  ): Promise<CertificationExceptionRecord | undefined>;
  listExceptionsForContext(
    tenantId: string,
    applicationId: string,
    changeEventId: string,
  ): Promise<readonly CertificationExceptionRecord[]>;

  countOpenCriticalDefects?(
    tenantId: string,
    applicationId: string,
  ): Promise<number | undefined>;
  countOpenQualityIssues?(
    tenantId: string,
    applicationId: string,
  ): Promise<number | undefined>;
};

export type FactOverrides = Partial<QualityFactSnapshot>;
