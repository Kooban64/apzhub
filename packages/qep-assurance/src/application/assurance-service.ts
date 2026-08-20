import { randomUUID } from "node:crypto";

import {
  assertApplicationBound,
  assertNoRawSecrets,
  assertSameApplication,
  isBlockingRisk,
  isGateConditionKind,
  isGateType,
  isRiskSeverity,
  isRiskStatus,
  isSignalKind,
  requireText,
} from "../domain/guards";
import {
  assertCertificationOutcomeAllowed,
  composeReadinessSnapshot,
  evaluateCondition,
  observedFact,
} from "../domain/policy";
import type {
  CertificationExceptionRecord,
  CertificationOutcome,
  CreateGateDefinitionInput,
  CreateRiskInput,
  DecisionContext,
  LegacyJsonRisk,
  PresentedQualityRisk,
  QualityFactSnapshot,
  QualityGateDefinitionRecord,
  QualityGateEvaluationRecord,
  QualityRiskHistoryEntry,
  QualityRiskRecord,
  QualityRiskSignal,
  ReadinessSnapshot,
  RiskSeverity,
  RiskStatus,
  RiskTrend,
} from "../domain/types";
import { newOpaqueId } from "./in-memory-repository";
import type { AssuranceRepository, FactOverrides } from "./repository";

function nowIso(): string {
  return new Date().toISOString();
}

function historyId(): string {
  return `qrh_${randomUUID().replaceAll("-", "")}`;
}

function padNumber(prefix: string, value: number): string {
  return `${prefix}-${String(value).padStart(3, "0")}`;
}

function deriveTrend(history: readonly QualityRiskHistoryEntry[]): RiskTrend {
  const levelChanges = history.filter(
    (row) => row.fromSeverity && row.toSeverity && row.fromSeverity !== row.toSeverity,
  );
  if (levelChanges.length < 1) return "insufficient_history";
  const last = levelChanges[levelChanges.length - 1]!;
  const rank: Record<RiskSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  const from = rank[last.fromSeverity!];
  const to = rank[last.toSeverity!];
  if (to > from) return "increasing";
  if (to < from) return "decreasing";
  return "stable";
}

async function presentRisk(
  repository: AssuranceRepository,
  row: QualityRiskRecord,
): Promise<PresentedQualityRisk> {
  const [history, signals] = await Promise.all([
    repository.listRiskHistory(row.tenantId, row.id),
    repository.listRiskSignals(row.tenantId, row.id),
  ]);
  return {
    ...row,
    trend: deriveTrend(history),
    history,
    signals,
  };
}

function emptyFacts(): QualityFactSnapshot {
  return {
    unresolvedBlockingRisks: 0,
    openCriticalDefects: 0,
    openQualityIssues: 0,
    failedCustomerExecutions: 0,
    requiredEvidenceMissing: 0,
    risksAvailable: true,
    defectsAvailable: false,
    issuesAvailable: false,
    executionsAvailable: false,
    evidenceAvailable: false,
  };
}

async function collectFacts(
  repository: AssuranceRepository,
  tenantId: string,
  applicationId: string,
  overrides?: FactOverrides,
): Promise<QualityFactSnapshot> {
  const risks = await repository.listRisks(tenantId, applicationId);
  const unresolvedBlockingRisks = risks.filter((row) =>
    isBlockingRisk(row.severity, row.status),
  ).length;
  const defects = repository.countOpenCriticalDefects
    ? await repository.countOpenCriticalDefects(tenantId, applicationId)
    : undefined;
  const issues = repository.countOpenQualityIssues
    ? await repository.countOpenQualityIssues(tenantId, applicationId)
    : undefined;
  const base: QualityFactSnapshot = {
    ...emptyFacts(),
    unresolvedBlockingRisks,
    risksAvailable: true,
    openCriticalDefects: defects ?? 0,
    defectsAvailable: defects !== undefined,
    openQualityIssues: issues ?? 0,
    issuesAvailable: issues !== undefined,
  };
  return { ...base, ...overrides };
}

function latestEvaluationsForActiveGates(
  definitions: readonly QualityGateDefinitionRecord[],
  evaluations: readonly QualityGateEvaluationRecord[],
): QualityGateEvaluationRecord[] {
  const latest = new Map<string, QualityGateEvaluationRecord>();
  for (const row of evaluations) {
    const current = latest.get(row.gateDefinitionId);
    if (!current || row.evaluatedAt > current.evaluatedAt) {
      latest.set(row.gateDefinitionId, row);
    }
  }
  return definitions
    .filter((row) => row.lifecycle === "active")
    .map((row) => latest.get(row.id))
    .filter((row): row is QualityGateEvaluationRecord => Boolean(row));
}

export type AssuranceService = {
  createRisk(input: CreateRiskInput): Promise<PresentedQualityRisk>;
  getRisk(tenantId: string, id: string): Promise<PresentedQualityRisk>;
  listRisks(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly PresentedQualityRisk[]>;
  updateRiskStatus(input: {
    readonly tenantId: string;
    readonly riskId: string;
    readonly actorId: string;
    readonly status: RiskStatus;
    readonly waiverNote?: string;
  }): Promise<PresentedQualityRisk>;
  updateRiskSeverity(input: {
    readonly tenantId: string;
    readonly riskId: string;
    readonly actorId: string;
    readonly severity: RiskSeverity;
  }): Promise<PresentedQualityRisk>;
  migrateLegacyRisks(input: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly actorId: string;
    readonly items: readonly LegacyJsonRisk[];
  }): Promise<{ readonly imported: number; readonly skipped: number }>;

  createGateDefinition(
    input: CreateGateDefinitionInput,
  ): Promise<QualityGateDefinitionRecord>;
  getGateDefinition(tenantId: string, id: string): Promise<QualityGateDefinitionRecord>;
  listGateDefinitions(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QualityGateDefinitionRecord[]>;
  updateGateDefinition(input: {
    readonly tenantId: string;
    readonly gateId: string;
    readonly actorId: string;
    readonly name?: string;
    readonly description?: string;
    readonly gateType?: string;
    readonly lifecycle?: string;
    readonly conditionKind?: string;
    readonly conditionValue?: number;
  }): Promise<QualityGateDefinitionRecord>;

  evaluateGate(input: {
    readonly tenantId: string;
    readonly gateId: string;
    readonly actorId: string;
    readonly context: DecisionContext;
    readonly factOverrides?: FactOverrides;
  }): Promise<QualityGateEvaluationRecord>;
  evaluateActiveGates(input: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly actorId: string;
    readonly context: DecisionContext;
    readonly factOverrides?: FactOverrides;
  }): Promise<readonly QualityGateEvaluationRecord[]>;
  getGateEvaluation(tenantId: string, id: string): Promise<QualityGateEvaluationRecord>;
  listGateEvaluations(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QualityGateEvaluationRecord[]>;

  composeReadiness(input: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly changeEventId?: string;
    readonly factOverrides?: FactOverrides;
  }): Promise<{
    readonly posture: ReadinessSnapshot["posture"];
    readonly snapshot: ReadinessSnapshot;
    readonly evaluations: readonly QualityGateEvaluationRecord[];
    readonly facts: QualityFactSnapshot;
    readonly risks: readonly PresentedQualityRisk[];
    readonly definitions: readonly QualityGateDefinitionRecord[];
  }>;

  authoriseException(input: {
    readonly tenantId: string;
    readonly actorId: string;
    readonly gateEvaluationId: string;
    readonly reason: string;
  }): Promise<CertificationExceptionRecord>;
  revokeException(input: {
    readonly tenantId: string;
    readonly exceptionId: string;
    readonly actorId: string;
  }): Promise<CertificationExceptionRecord>;
  listExceptions(
    tenantId: string,
    applicationId: string,
    changeEventId: string,
  ): Promise<readonly CertificationExceptionRecord[]>;

  assertOutcomeAllowed(input: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly changeEventId: string;
    readonly environmentId: string;
    readonly outcome: CertificationOutcome;
  }): Promise<{
    readonly blockingEvaluations: readonly QualityGateEvaluationRecord[];
    readonly exceptions: readonly CertificationExceptionRecord[];
    readonly snapshot: ReadinessSnapshot;
  }>;
};

export function createAssuranceService(
  repository: AssuranceRepository,
): AssuranceService {
  return {
    async createRisk(input) {
      assertApplicationBound(input.applicationId, "quality_risk");
      const title = requireText(input.title, "quality_risk.title");
      const description = requireText(input.description, "quality_risk.description");
      assertNoRawSecrets(title, "quality_risk.title");
      assertNoRawSecrets(description, "quality_risk.description");
      if (!isRiskSeverity(input.severity))
        throw new Error("quality_risk.severity_invalid");
      const now = nowIso();
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "quality_risk",
      );
      const row: QualityRiskRecord = {
        id: newOpaqueId("qr"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number: padNumber("QR", n),
        title,
        description,
        severity: input.severity,
        status: input.status ?? "open",
        ...(input.owner?.trim() ? { owner: input.owner.trim() } : {}),
        ...(input.domain?.trim() ? { domain: input.domain.trim() } : {}),
        ...(input.impact && isRiskSeverity(input.impact)
          ? { impact: input.impact }
          : {}),
        ...(input.likelihood && isRiskSeverity(input.likelihood)
          ? { likelihood: input.likelihood }
          : {}),
        ...(input.evidenceRef?.trim() ? { evidenceRef: input.evidenceRef.trim() } : {}),
        ...(input.legacyRiskId ? { legacyRiskId: input.legacyRiskId } : {}),
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveRisk(row);
      await repository.appendRiskHistory(input.tenantId, row.id, {
        id: historyId(),
        applicationId: row.applicationId,
        action: "created",
        toStatus: row.status,
        toSeverity: row.severity,
        actorId: input.actorId,
        createdAt: now,
      });
      if (input.signals?.length) {
        const signals: QualityRiskSignal[] = input.signals
          .filter((s) => isSignalKind(s.kind) && s.targetId.trim())
          .map((s) => ({
            id: newOpaqueId("qrs"),
            kind: s.kind,
            targetId: s.targetId.trim(),
          }));
        await repository.saveRiskSignals(input.tenantId, row.id, signals);
      }
      return presentRisk(repository, row);
    },

    async getRisk(tenantId, id) {
      const row = await repository.getRisk(tenantId, id);
      if (!row) throw new Error("quality_risk.not_found");
      return presentRisk(repository, row);
    },

    async listRisks(tenantId, applicationId) {
      assertApplicationBound(applicationId, "quality_risk");
      const rows = await repository.listRisks(tenantId, applicationId);
      return Promise.all(rows.map((row) => presentRisk(repository, row)));
    },

    async updateRiskStatus(input) {
      if (!isRiskStatus(input.status)) throw new Error("quality_risk.status_invalid");
      const row = await repository.getRisk(input.tenantId, input.riskId);
      if (!row) throw new Error("quality_risk.not_found");
      const now = nowIso();
      const next: QualityRiskRecord = {
        ...row,
        status: input.status,
        ...(input.status === "waived"
          ? { waiverNote: input.waiverNote?.trim() || row.waiverNote }
          : {}),
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveRisk(next);
      await repository.appendRiskHistory(input.tenantId, row.id, {
        id: historyId(),
        applicationId: row.applicationId,
        action: `status.${input.status}`,
        fromStatus: row.status,
        toStatus: input.status,
        note: input.waiverNote?.trim(),
        actorId: input.actorId,
        createdAt: now,
      });
      return presentRisk(repository, next);
    },

    async updateRiskSeverity(input) {
      if (!isRiskSeverity(input.severity))
        throw new Error("quality_risk.severity_invalid");
      const row = await repository.getRisk(input.tenantId, input.riskId);
      if (!row) throw new Error("quality_risk.not_found");
      const now = nowIso();
      const next: QualityRiskRecord = {
        ...row,
        severity: input.severity,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveRisk(next);
      await repository.appendRiskHistory(input.tenantId, row.id, {
        id: historyId(),
        applicationId: row.applicationId,
        action: "severity.changed",
        fromSeverity: row.severity,
        toSeverity: input.severity,
        actorId: input.actorId,
        createdAt: now,
      });
      return presentRisk(repository, next);
    },

    async migrateLegacyRisks(input) {
      assertApplicationBound(input.applicationId, "quality_risk");
      let imported = 0;
      let skipped = 0;
      const existing = await repository.listRisks(input.tenantId, input.applicationId);
      const seen = new Set(existing.map((row) => row.legacyRiskId).filter(Boolean));
      for (const item of input.items) {
        if (!item.riskId || seen.has(item.riskId)) {
          skipped += 1;
          continue;
        }
        if (!isRiskSeverity(item.severity) || !isRiskStatus(item.status)) {
          skipped += 1;
          continue;
        }
        await this.createRisk({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          actorId: input.actorId,
          title: item.title || item.riskId,
          description: `Migrated from JSON ledger ${item.riskId}`,
          severity: item.severity,
          status: item.status,
          owner: item.owner,
          evidenceRef: item.evidenceRef,
          legacyRiskId: item.riskId,
        });
        imported += 1;
      }
      return { imported, skipped };
    },

    async createGateDefinition(input) {
      assertApplicationBound(input.applicationId, "quality_gate");
      const name = requireText(input.name, "quality_gate.name");
      const description = requireText(input.description, "quality_gate.description");
      if (!isGateType(input.gateType)) throw new Error("quality_gate.type_invalid");
      if (!isGateConditionKind(input.condition.kind)) {
        throw new Error("quality_gate.condition_invalid");
      }
      if (input.condition.operator !== "eq")
        throw new Error("quality_gate.condition_invalid");
      const now = nowIso();
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "quality_gate",
      );
      const row: QualityGateDefinitionRecord = {
        id: newOpaqueId("qg"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number: padNumber("QG", n),
        name,
        description,
        gateType: input.gateType,
        lifecycle: "active",
        version: 1,
        condition: {
          kind: input.condition.kind,
          operator: "eq",
          value: input.condition.value,
        },
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveGateDefinition(row);
      return row;
    },

    async getGateDefinition(tenantId, id) {
      const row = await repository.getGateDefinition(tenantId, id);
      if (!row) throw new Error("quality_gate.not_found");
      return row;
    },

    async listGateDefinitions(tenantId, applicationId) {
      assertApplicationBound(applicationId, "quality_gate");
      return repository.listGateDefinitions(tenantId, applicationId);
    },

    async updateGateDefinition(input) {
      const row = await repository.getGateDefinition(input.tenantId, input.gateId);
      if (!row) throw new Error("quality_gate.not_found");
      const nextType = input.gateType ?? row.gateType;
      if (!isGateType(nextType)) throw new Error("quality_gate.type_invalid");
      const nextKind = input.conditionKind ?? row.condition.kind;
      if (!isGateConditionKind(nextKind))
        throw new Error("quality_gate.condition_invalid");
      const nextLifecycle = input.lifecycle ?? row.lifecycle;
      if (
        nextLifecycle !== "draft" &&
        nextLifecycle !== "active" &&
        nextLifecycle !== "retired"
      ) {
        throw new Error("quality_gate.lifecycle_invalid");
      }
      const conditionChanged =
        nextKind !== row.condition.kind ||
        (input.conditionValue !== undefined &&
          input.conditionValue !== row.condition.value) ||
        nextType !== row.gateType;
      const next: QualityGateDefinitionRecord = {
        ...row,
        name: input.name?.trim() || row.name,
        description: input.description?.trim() || row.description,
        gateType: nextType,
        lifecycle: nextLifecycle,
        version: conditionChanged ? row.version + 1 : row.version,
        condition: {
          kind: nextKind,
          operator: "eq",
          value: input.conditionValue ?? row.condition.value,
        },
        updatedAt: nowIso(),
        updatedBy: input.actorId,
      };
      await repository.saveGateDefinition(next);
      return next;
    },

    async evaluateGate(input) {
      assertApplicationBound(input.context.applicationId, "quality_gate");
      const definition = await repository.getGateDefinition(
        input.tenantId,
        input.gateId,
      );
      if (!definition) throw new Error("quality_gate.not_found");
      assertSameApplication(
        definition.applicationId,
        input.context.applicationId,
        "quality_gate",
      );
      if (
        !input.context.environmentId.trim() ||
        !input.context.environmentSnapshot.name
      ) {
        throw new Error("quality_gate.environment_required");
      }
      if (!input.context.changeEventId.trim()) {
        throw new Error("quality_gate.change_event_required");
      }
      const facts = await collectFacts(
        repository,
        input.tenantId,
        definition.applicationId,
        input.factOverrides,
      );
      const observed = observedFact(facts, definition.condition.kind);
      const outcome = evaluateCondition({
        expected: definition.condition.value,
        observed,
      });
      const row: QualityGateEvaluationRecord = {
        id: newOpaqueId("qge"),
        tenantId: input.tenantId,
        applicationId: definition.applicationId,
        gateDefinitionId: definition.id,
        definitionVersion: definition.version,
        definitionSnapshot: definition,
        environmentId: input.context.environmentId,
        environmentSnapshot: { ...input.context.environmentSnapshot },
        changeEventId: input.context.changeEventId,
        ...(input.context.scmIdentity
          ? { scmIdentity: input.context.scmIdentity }
          : {}),
        factsUsed: facts,
        ...(observed.available ? { observedValue: observed.value } : {}),
        result: outcome.result,
        reason: outcome.reason,
        evaluatedAt: nowIso(),
        evaluatedBy: input.actorId,
      };
      await repository.saveGateEvaluation(row);
      return row;
    },

    async evaluateActiveGates(input) {
      const definitions = (
        await repository.listGateDefinitions(input.tenantId, input.applicationId)
      ).filter((row) => row.lifecycle === "active");
      const rows: QualityGateEvaluationRecord[] = [];
      for (const definition of definitions) {
        rows.push(
          await this.evaluateGate({
            tenantId: input.tenantId,
            gateId: definition.id,
            actorId: input.actorId,
            context: input.context,
            factOverrides: input.factOverrides,
          }),
        );
      }
      return rows;
    },

    async getGateEvaluation(tenantId, id) {
      const row = await repository.getGateEvaluation(tenantId, id);
      if (!row) throw new Error("quality_gate_evaluation.not_found");
      return row;
    },

    async listGateEvaluations(tenantId, applicationId) {
      assertApplicationBound(applicationId, "quality_gate");
      return repository.listGateEvaluations(tenantId, applicationId);
    },

    async composeReadiness(input) {
      assertApplicationBound(input.applicationId, "readiness");
      const [definitions, allEvals, risks, facts] = await Promise.all([
        repository.listGateDefinitions(input.tenantId, input.applicationId),
        input.changeEventId
          ? repository.listGateEvaluationsForContext(
              input.tenantId,
              input.applicationId,
              input.changeEventId,
            )
          : repository.listGateEvaluations(input.tenantId, input.applicationId),
        this.listRisks(input.tenantId, input.applicationId),
        collectFacts(
          repository,
          input.tenantId,
          input.applicationId,
          input.factOverrides,
        ),
      ]);
      const evaluations = latestEvaluationsForActiveGates(definitions, allEvals);
      const snapshot = composeReadinessSnapshot({
        evaluations,
        facts,
        composedAt: nowIso(),
      });
      return {
        posture: snapshot.posture,
        snapshot,
        evaluations,
        facts,
        risks,
        definitions,
      };
    },

    async authoriseException(input) {
      const actor = input.actorId.trim();
      if (
        !actor ||
        actor.startsWith("system:") ||
        actor.startsWith("qi:") ||
        actor.startsWith("automation:")
      ) {
        throw new Error("certification.human_actor_required");
      }
      const evaluation = await repository.getGateEvaluation(
        input.tenantId,
        input.gateEvaluationId,
      );
      if (!evaluation) throw new Error("quality_gate_evaluation.not_found");
      if (evaluation.definitionSnapshot.gateType !== "blocking") {
        throw new Error("certification.exception_blocking_gate_only");
      }
      if (evaluation.result !== "failed") {
        throw new Error("certification.exception_failed_gate_only");
      }
      const reason = requireText(input.reason, "certification.exception.reason");
      const row: CertificationExceptionRecord = {
        id: newOpaqueId("qcx"),
        tenantId: input.tenantId,
        applicationId: evaluation.applicationId,
        environmentId: evaluation.environmentId,
        changeEventId: evaluation.changeEventId,
        gateDefinitionId: evaluation.gateDefinitionId,
        gateEvaluationId: evaluation.id,
        reason,
        status: "authorised",
        authorisedBy: actor,
        authorisedAt: nowIso(),
      };
      await repository.saveException(row);
      return row;
    },

    async revokeException(input) {
      const row = await repository.getException(input.tenantId, input.exceptionId);
      if (!row) throw new Error("certification.exception_not_found");
      const next: CertificationExceptionRecord = {
        ...row,
        status: "revoked",
        revokedBy: input.actorId,
        revokedAt: nowIso(),
      };
      await repository.saveException(next);
      return next;
    },

    async listExceptions(tenantId, applicationId, changeEventId) {
      return repository.listExceptionsForContext(
        tenantId,
        applicationId,
        changeEventId,
      );
    },

    async assertOutcomeAllowed(input) {
      const composed = await this.composeReadiness({
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        changeEventId: input.changeEventId,
      });
      const blocking = composed.evaluations.filter(
        (row) =>
          row.definitionSnapshot.gateType === "blocking" &&
          row.environmentId === input.environmentId,
      );
      const exceptions = await repository.listExceptionsForContext(
        input.tenantId,
        input.applicationId,
        input.changeEventId,
      );
      assertCertificationOutcomeAllowed({
        outcome: input.outcome,
        blockingEvaluations: blocking,
        exceptions: exceptions.filter(
          (row) => row.environmentId === input.environmentId,
        ),
      });
      return {
        blockingEvaluations: blocking,
        exceptions,
        snapshot: composed.snapshot,
      };
    },
  };
}
