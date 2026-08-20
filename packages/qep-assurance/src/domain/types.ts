export const RISK_STATUSES = ["open", "mitigated", "accepted", "waived"] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];

export const RISK_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const RISK_TRENDS = [
  "increasing",
  "stable",
  "decreasing",
  "insufficient_history",
] as const;
export type RiskTrend = (typeof RISK_TRENDS)[number];

export const SIGNAL_KINDS = [
  "defect",
  "issue",
  "evidence",
  "execution",
  "observation",
] as const;
export type SignalKind = (typeof SIGNAL_KINDS)[number];

export const GATE_TYPES = ["blocking", "non_blocking"] as const;
export type GateType = (typeof GATE_TYPES)[number];

export const GATE_LIFECYCLES = ["draft", "active", "retired"] as const;
export type GateLifecycle = (typeof GATE_LIFECYCLES)[number];

export const GATE_CONDITION_KINDS = [
  "unresolved_blocking_risks",
  "open_critical_defects",
  "open_quality_issues",
  "failed_customer_executions",
  "required_evidence_missing",
] as const;
export type GateConditionKind = (typeof GATE_CONDITION_KINDS)[number];

export const GATE_RESULTS = ["passed", "failed", "not_evaluated"] as const;
export type GateResult = (typeof GATE_RESULTS)[number];

export const READINESS_POSTURES = [
  "ready",
  "at_risk",
  "not_ready",
  "insufficient_data",
] as const;
export type ReadinessPosture = (typeof READINESS_POSTURES)[number];

export const CERTIFICATION_OUTCOMES = [
  "GO",
  "CONDITIONAL_GO",
  "NO_GO",
  "DEFER",
] as const;
export type CertificationOutcome = (typeof CERTIFICATION_OUTCOMES)[number];

export const EXCEPTION_STATUSES = ["authorised", "revoked"] as const;
export type ExceptionStatus = (typeof EXCEPTION_STATUSES)[number];

export type QualityRiskSignal = {
  readonly id: string;
  readonly kind: SignalKind;
  readonly targetId: string;
};

export type QualityRiskHistoryEntry = {
  readonly id: string;
  readonly action: string;
  readonly fromStatus?: RiskStatus;
  readonly toStatus?: RiskStatus;
  readonly fromSeverity?: RiskSeverity;
  readonly toSeverity?: RiskSeverity;
  readonly note?: string;
  readonly actorId: string;
  readonly createdAt: string;
};

export type QualityRiskRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly severity: RiskSeverity;
  readonly status: RiskStatus;
  readonly owner?: string;
  readonly domain?: string;
  readonly impact?: RiskSeverity;
  readonly likelihood?: RiskSeverity;
  readonly waiverNote?: string;
  readonly evidenceRef?: string;
  readonly legacyRiskId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type PresentedQualityRisk = QualityRiskRecord & {
  readonly trend: RiskTrend;
  readonly history: readonly QualityRiskHistoryEntry[];
  readonly signals: readonly QualityRiskSignal[];
};

export type GateCondition = {
  readonly kind: GateConditionKind;
  readonly operator: "eq";
  readonly value: number;
};

export type QualityGateDefinitionRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly number: string;
  readonly name: string;
  readonly description: string;
  readonly gateType: GateType;
  readonly lifecycle: GateLifecycle;
  readonly version: number;
  readonly condition: GateCondition;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type EnvironmentSnapshot = {
  readonly id: string;
  readonly name: string;
};

export type ScmIdentity = {
  readonly changeEventId: string;
  readonly kind?: string;
  readonly externalKey?: string;
  readonly sha?: string;
};

export type DecisionContext = {
  readonly applicationId: string;
  readonly applicationName?: string;
  readonly environmentId: string;
  readonly environmentSnapshot: EnvironmentSnapshot;
  readonly changeEventId: string;
  readonly scmIdentity?: ScmIdentity;
};

export type QualityFactSnapshot = {
  readonly unresolvedBlockingRisks: number;
  readonly openCriticalDefects: number;
  readonly openQualityIssues: number;
  readonly failedCustomerExecutions: number;
  readonly requiredEvidenceMissing: number;
  readonly risksAvailable: boolean;
  readonly defectsAvailable: boolean;
  readonly issuesAvailable: boolean;
  readonly executionsAvailable: boolean;
  readonly evidenceAvailable: boolean;
};

export type QualityGateEvaluationRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly gateDefinitionId: string;
  readonly definitionVersion: number;
  readonly definitionSnapshot: QualityGateDefinitionRecord;
  readonly environmentId: string;
  readonly environmentSnapshot: EnvironmentSnapshot;
  readonly changeEventId: string;
  readonly scmIdentity?: ScmIdentity;
  readonly factsUsed: QualityFactSnapshot;
  readonly observedValue?: number;
  readonly result: GateResult;
  readonly reason: string;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
};

export type CertificationExceptionRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly environmentId: string;
  readonly changeEventId: string;
  readonly gateDefinitionId: string;
  readonly gateEvaluationId: string;
  readonly reason: string;
  readonly status: ExceptionStatus;
  readonly authorisedBy: string;
  readonly authorisedAt: string;
  readonly revokedBy?: string;
  readonly revokedAt?: string;
};

export type ReadinessSnapshot = {
  readonly posture: ReadinessPosture;
  readonly facts: QualityFactSnapshot;
  readonly gateEvaluationIds: readonly string[];
  readonly blockingFailed: readonly string[];
  readonly blockingNotEvaluated: readonly string[];
  readonly nonBlockingFailed: readonly string[];
  readonly composedAt: string;
};

export type CreateRiskInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: RiskSeverity;
  readonly owner?: string;
  readonly domain?: string;
  readonly impact?: RiskSeverity;
  readonly likelihood?: RiskSeverity;
  readonly evidenceRef?: string;
  readonly signals?: readonly {
    readonly kind: SignalKind;
    readonly targetId: string;
  }[];
  readonly legacyRiskId?: string;
  readonly status?: RiskStatus;
};

export type CreateGateDefinitionInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly name: string;
  readonly description: string;
  readonly gateType: GateType;
  readonly condition: GateCondition;
};

export type LegacyJsonRisk = {
  readonly riskId: string;
  readonly title: string;
  readonly severity: RiskSeverity;
  readonly status: RiskStatus;
  readonly waiverNote?: string;
  readonly owner?: string;
  readonly evidenceRef?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};
