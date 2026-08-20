import {
  getDatabaseExecutor,
  qepCertificationException,
  qepDefinitionKeyCounter,
  qepQualityGateDefinition,
  qepQualityGateEvaluation,
  qepQualityRisk,
  qepQualityRiskHistory,
  qepQualityRiskSignal,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type {
  CertificationExceptionRecord,
  EnvironmentSnapshot,
  GateConditionKind,
  GateLifecycle,
  GateResult,
  GateType,
  QualityFactSnapshot,
  QualityGateDefinitionRecord,
  QualityGateEvaluationRecord,
  QualityRiskHistoryEntry,
  QualityRiskRecord,
  QualityRiskSignal,
  RiskSeverity,
  RiskStatus,
  ScmIdentity,
  SignalKind,
} from "../../domain/types";
import type { AssuranceRepository } from "../../application/repository";

function exec(db: DatabaseExecutor): DatabaseExecutor {
  return getDatabaseExecutor(db);
}

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function reqIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toRisk(row: typeof qepQualityRisk.$inferSelect): QualityRiskRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    number: row.number,
    title: row.title,
    description: row.description,
    severity: row.severity as RiskSeverity,
    status: row.status as RiskStatus,
    ...(row.owner ? { owner: row.owner } : {}),
    ...(row.domain ? { domain: row.domain } : {}),
    ...(row.impact ? { impact: row.impact as RiskSeverity } : {}),
    ...(row.likelihood ? { likelihood: row.likelihood as RiskSeverity } : {}),
    ...(row.waiverNote ? { waiverNote: row.waiverNote } : {}),
    ...(row.evidenceRef ? { evidenceRef: row.evidenceRef } : {}),
    ...(row.legacyRiskId ? { legacyRiskId: row.legacyRiskId } : {}),
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function toDefinition(
  row: typeof qepQualityGateDefinition.$inferSelect,
): QualityGateDefinitionRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    number: row.number,
    name: row.name,
    description: row.description,
    gateType: row.gateType as GateType,
    lifecycle: row.lifecycle as GateLifecycle,
    version: row.version,
    condition: {
      kind: row.conditionKind as GateConditionKind,
      operator: "eq",
      value: row.conditionValue,
    },
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function toEvaluation(
  row: typeof qepQualityGateEvaluation.$inferSelect,
): QualityGateEvaluationRecord {
  const snapshot = row.definitionSnapshot as unknown as QualityGateDefinitionRecord;
  const scm = row.scmIdentity as ScmIdentity | null;
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    gateDefinitionId: row.gateDefinitionId,
    definitionVersion: row.definitionVersion,
    definitionSnapshot: snapshot,
    environmentId: row.environmentId,
    environmentSnapshot: row.environmentSnapshot as EnvironmentSnapshot,
    changeEventId: row.changeEventId,
    ...(scm ? { scmIdentity: scm } : {}),
    factsUsed: row.factsUsed as QualityFactSnapshot,
    ...(row.observedValue !== null && row.observedValue !== undefined
      ? { observedValue: row.observedValue }
      : {}),
    result: row.result as GateResult,
    reason: row.reason,
    evaluatedAt: reqIso(row.evaluatedAt),
    evaluatedBy: row.evaluatedBy,
  };
}

function toException(
  row: typeof qepCertificationException.$inferSelect,
): CertificationExceptionRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    environmentId: row.environmentId,
    changeEventId: row.changeEventId,
    gateDefinitionId: row.gateDefinitionId,
    gateEvaluationId: row.gateEvaluationId,
    reason: row.reason,
    status: row.status as CertificationExceptionRecord["status"],
    authorisedBy: row.authorisedBy,
    authorisedAt: reqIso(row.authorisedAt),
    ...(row.revokedBy ? { revokedBy: row.revokedBy } : {}),
    ...(iso(row.revokedAt) ? { revokedAt: iso(row.revokedAt) } : {}),
  };
}

export function createPostgresAssuranceRepository(
  db: DatabaseExecutor,
): AssuranceRepository {
  const run = () => exec(db);

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const rows = await run()
        .select()
        .from(qepDefinitionKeyCounter)
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        )
        .limit(1);
      const current = rows[0];
      if (!current) {
        await run().insert(qepDefinitionKeyCounter).values({
          tenantId,
          applicationId,
          kind,
          nextValue: 2,
        });
        return 1;
      }
      const value = current.nextValue;
      await run()
        .update(qepDefinitionKeyCounter)
        .set({ nextValue: value + 1 })
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        );
      return value;
    },

    async saveRisk(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        number: row.number,
        title: row.title,
        description: row.description,
        severity: row.severity,
        status: row.status,
        owner: row.owner ?? null,
        domain: row.domain ?? null,
        impact: row.impact ?? null,
        likelihood: row.likelihood ?? null,
        waiverNote: row.waiverNote ?? null,
        evidenceRef: row.evidenceRef ?? null,
        legacyRiskId: row.legacyRiskId ?? null,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      const existing = await run()
        .select({ id: qepQualityRisk.id })
        .from(qepQualityRisk)
        .where(eq(qepQualityRisk.id, row.id))
        .limit(1);
      if (existing[0]) {
        await run()
          .update(qepQualityRisk)
          .set(values)
          .where(eq(qepQualityRisk.id, row.id));
      } else {
        await run().insert(qepQualityRisk).values(values);
      }
    },

    async getRisk(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepQualityRisk)
        .where(and(eq(qepQualityRisk.tenantId, tenantId), eq(qepQualityRisk.id, id)))
        .limit(1);
      return rows[0] ? toRisk(rows[0]) : undefined;
    },

    async listRisks(tenantId, applicationId) {
      const rows = await run()
        .select()
        .from(qepQualityRisk)
        .where(
          and(
            eq(qepQualityRisk.tenantId, tenantId),
            eq(qepQualityRisk.applicationId, applicationId),
          ),
        )
        .orderBy(desc(qepQualityRisk.updatedAt));
      return rows.map(toRisk);
    },

    async appendRiskHistory(tenantId, riskId, entry) {
      await run()
        .insert(qepQualityRiskHistory)
        .values({
          id: entry.id,
          tenantId,
          applicationId: entry.applicationId,
          riskId,
          action: entry.action,
          fromStatus: entry.fromStatus ?? null,
          toStatus: entry.toStatus ?? null,
          fromSeverity: entry.fromSeverity ?? null,
          toSeverity: entry.toSeverity ?? null,
          note: entry.note ?? null,
          actorId: entry.actorId,
          createdAt: new Date(entry.createdAt),
        });
    },

    async listRiskHistory(tenantId, riskId) {
      const rows = await run()
        .select()
        .from(qepQualityRiskHistory)
        .where(
          and(
            eq(qepQualityRiskHistory.tenantId, tenantId),
            eq(qepQualityRiskHistory.riskId, riskId),
          ),
        )
        .orderBy(qepQualityRiskHistory.createdAt);
      return rows.map((row): QualityRiskHistoryEntry => ({
        id: row.id,
        action: row.action,
        ...(row.fromStatus ? { fromStatus: row.fromStatus as RiskStatus } : {}),
        ...(row.toStatus ? { toStatus: row.toStatus as RiskStatus } : {}),
        ...(row.fromSeverity ? { fromSeverity: row.fromSeverity as RiskSeverity } : {}),
        ...(row.toSeverity ? { toSeverity: row.toSeverity as RiskSeverity } : {}),
        ...(row.note ? { note: row.note } : {}),
        actorId: row.actorId,
        createdAt: reqIso(row.createdAt),
      }));
    },

    async saveRiskSignals(tenantId, riskId, signals) {
      await run()
        .delete(qepQualityRiskSignal)
        .where(
          and(
            eq(qepQualityRiskSignal.tenantId, tenantId),
            eq(qepQualityRiskSignal.riskId, riskId),
          ),
        );
      if (signals.length === 0) return;
      const risk = await this.getRisk(tenantId, riskId);
      if (!risk) return;
      await run()
        .insert(qepQualityRiskSignal)
        .values(
          signals.map((signal) => ({
            id: signal.id,
            tenantId,
            applicationId: risk.applicationId,
            riskId,
            kind: signal.kind,
            targetId: signal.targetId,
            createdAt: new Date(),
            createdBy: risk.updatedBy,
          })),
        );
    },

    async listRiskSignals(tenantId, riskId) {
      const rows = await run()
        .select()
        .from(qepQualityRiskSignal)
        .where(
          and(
            eq(qepQualityRiskSignal.tenantId, tenantId),
            eq(qepQualityRiskSignal.riskId, riskId),
          ),
        );
      return rows.map((row): QualityRiskSignal => ({
        id: row.id,
        kind: row.kind as SignalKind,
        targetId: row.targetId,
      }));
    },

    async saveGateDefinition(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        number: row.number,
        name: row.name,
        description: row.description,
        gateType: row.gateType,
        lifecycle: row.lifecycle,
        version: row.version,
        conditionKind: row.condition.kind,
        conditionOperator: row.condition.operator,
        conditionValue: row.condition.value,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      const existing = await run()
        .select({ id: qepQualityGateDefinition.id })
        .from(qepQualityGateDefinition)
        .where(eq(qepQualityGateDefinition.id, row.id))
        .limit(1);
      if (existing[0]) {
        await run()
          .update(qepQualityGateDefinition)
          .set(values)
          .where(eq(qepQualityGateDefinition.id, row.id));
      } else {
        await run().insert(qepQualityGateDefinition).values(values);
      }
    },

    async getGateDefinition(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepQualityGateDefinition)
        .where(
          and(
            eq(qepQualityGateDefinition.tenantId, tenantId),
            eq(qepQualityGateDefinition.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? toDefinition(rows[0]) : undefined;
    },

    async listGateDefinitions(tenantId, applicationId) {
      const rows = await run()
        .select()
        .from(qepQualityGateDefinition)
        .where(
          and(
            eq(qepQualityGateDefinition.tenantId, tenantId),
            eq(qepQualityGateDefinition.applicationId, applicationId),
          ),
        );
      return rows.map(toDefinition);
    },

    async saveGateEvaluation(row) {
      await run()
        .insert(qepQualityGateEvaluation)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          gateDefinitionId: row.gateDefinitionId,
          definitionVersion: row.definitionVersion,
          definitionSnapshot: row.definitionSnapshot as unknown as Record<
            string,
            unknown
          >,
          environmentId: row.environmentId,
          environmentSnapshot: row.environmentSnapshot,
          changeEventId: row.changeEventId,
          scmIdentity: row.scmIdentity ?? null,
          factsUsed: row.factsUsed as unknown as Record<string, unknown>,
          observedValue: row.observedValue ?? null,
          result: row.result,
          reason: row.reason,
          evaluatedAt: new Date(row.evaluatedAt),
          evaluatedBy: row.evaluatedBy,
        });
    },

    async getGateEvaluation(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepQualityGateEvaluation)
        .where(
          and(
            eq(qepQualityGateEvaluation.tenantId, tenantId),
            eq(qepQualityGateEvaluation.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? toEvaluation(rows[0]) : undefined;
    },

    async listGateEvaluations(tenantId, applicationId) {
      const rows = await run()
        .select()
        .from(qepQualityGateEvaluation)
        .where(
          and(
            eq(qepQualityGateEvaluation.tenantId, tenantId),
            eq(qepQualityGateEvaluation.applicationId, applicationId),
          ),
        )
        .orderBy(desc(qepQualityGateEvaluation.evaluatedAt));
      return rows.map(toEvaluation);
    },

    async listGateEvaluationsForContext(tenantId, applicationId, changeEventId) {
      const rows = await run()
        .select()
        .from(qepQualityGateEvaluation)
        .where(
          and(
            eq(qepQualityGateEvaluation.tenantId, tenantId),
            eq(qepQualityGateEvaluation.applicationId, applicationId),
            eq(qepQualityGateEvaluation.changeEventId, changeEventId),
          ),
        )
        .orderBy(desc(qepQualityGateEvaluation.evaluatedAt));
      return rows.map(toEvaluation);
    },

    async saveException(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        environmentId: row.environmentId,
        changeEventId: row.changeEventId,
        gateDefinitionId: row.gateDefinitionId,
        gateEvaluationId: row.gateEvaluationId,
        reason: row.reason,
        status: row.status,
        authorisedBy: row.authorisedBy,
        authorisedAt: new Date(row.authorisedAt),
        revokedBy: row.revokedBy ?? null,
        revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      };
      const existing = await run()
        .select({ id: qepCertificationException.id })
        .from(qepCertificationException)
        .where(eq(qepCertificationException.id, row.id))
        .limit(1);
      if (existing[0]) {
        await run()
          .update(qepCertificationException)
          .set(values)
          .where(eq(qepCertificationException.id, row.id));
      } else {
        await run().insert(qepCertificationException).values(values);
      }
    },

    async getException(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepCertificationException)
        .where(
          and(
            eq(qepCertificationException.tenantId, tenantId),
            eq(qepCertificationException.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? toException(rows[0]) : undefined;
    },

    async listExceptionsForContext(tenantId, applicationId, changeEventId) {
      const rows = await run()
        .select()
        .from(qepCertificationException)
        .where(
          and(
            eq(qepCertificationException.tenantId, tenantId),
            eq(qepCertificationException.applicationId, applicationId),
            eq(qepCertificationException.changeEventId, changeEventId),
          ),
        );
      return rows.map(toException);
    },
  };
}
