import {
  testingCaseRequirement,
  testingManualStepActual,
  testingPlanRequirement,
  testingPlanRisk,
  testingPlanSuite,
  testingRiskRequirement,
  testingSuiteCase,
  testingTestStep,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { ManualStepActualRecord } from "../records";

/** Replace plan↔suite links for a plan. */
export async function replacePlanSuites(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
  suiteIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingPlanSuite)
    .where(
      and(eq(testingPlanSuite.tenantId, tenantId), eq(testingPlanSuite.planId, planId)),
    );
  if (suiteIds.length === 0) return;
  await db.insert(testingPlanSuite).values(
    suiteIds.map((suiteId) => ({
      tenantId,
      planId,
      suiteId,
    })),
  );
}

export async function loadPlanSuiteIds(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
): Promise<string[]> {
  const rows = await db
    .select({ suiteId: testingPlanSuite.suiteId })
    .from(testingPlanSuite)
    .where(
      and(eq(testingPlanSuite.tenantId, tenantId), eq(testingPlanSuite.planId, planId)),
    );
  return rows
    .map((row) => row.suiteId)
    .filter((id): id is string => typeof id === "string");
}

export async function replacePlanRequirements(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
  requirementIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingPlanRequirement)
    .where(
      and(
        eq(testingPlanRequirement.tenantId, tenantId),
        eq(testingPlanRequirement.planId, planId),
      ),
    );
  if (requirementIds.length === 0) return;
  await db.insert(testingPlanRequirement).values(
    requirementIds.map((requirementId) => ({
      tenantId,
      planId,
      requirementId,
    })),
  );
}

export async function loadPlanRequirementIds(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
): Promise<string[]> {
  const rows = await db
    .select({ requirementId: testingPlanRequirement.requirementId })
    .from(testingPlanRequirement)
    .where(
      and(
        eq(testingPlanRequirement.tenantId, tenantId),
        eq(testingPlanRequirement.planId, planId),
      ),
    );
  return rows
    .map((row) => row.requirementId)
    .filter((id): id is string => typeof id === "string");
}

export async function replacePlanRisks(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
  riskIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingPlanRisk)
    .where(
      and(eq(testingPlanRisk.tenantId, tenantId), eq(testingPlanRisk.planId, planId)),
    );
  if (riskIds.length === 0) return;
  await db.insert(testingPlanRisk).values(
    riskIds.map((riskId) => ({
      tenantId,
      planId,
      riskId,
    })),
  );
}

export async function loadPlanRiskIds(
  db: DatabaseExecutor,
  tenantId: string,
  planId: string,
): Promise<string[]> {
  const rows = await db
    .select({ riskId: testingPlanRisk.riskId })
    .from(testingPlanRisk)
    .where(
      and(eq(testingPlanRisk.tenantId, tenantId), eq(testingPlanRisk.planId, planId)),
    );
  return rows
    .map((row) => row.riskId)
    .filter((id): id is string => typeof id === "string");
}

export async function replaceSuiteCases(
  db: DatabaseExecutor,
  tenantId: string,
  suiteId: string,
  caseIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingSuiteCase)
    .where(
      and(eq(testingSuiteCase.tenantId, tenantId), eq(testingSuiteCase.suiteId, suiteId)),
    );
  if (caseIds.length === 0) return;
  await db.insert(testingSuiteCase).values(
    caseIds.map((caseId) => ({
      tenantId,
      suiteId,
      caseId,
    })),
  );
}

export async function loadSuiteCaseIds(
  db: DatabaseExecutor,
  tenantId: string,
  suiteId: string,
): Promise<string[]> {
  const rows = await db
    .select({ caseId: testingSuiteCase.caseId })
    .from(testingSuiteCase)
    .where(
      and(eq(testingSuiteCase.tenantId, tenantId), eq(testingSuiteCase.suiteId, suiteId)),
    );
  return rows
    .map((row) => row.caseId)
    .filter((id): id is string => typeof id === "string");
}

export async function loadSuitePlanIds(
  db: DatabaseExecutor,
  tenantId: string,
  suiteId: string,
): Promise<string[]> {
  const rows = await db
    .select({ planId: testingPlanSuite.planId })
    .from(testingPlanSuite)
    .where(
      and(eq(testingPlanSuite.tenantId, tenantId), eq(testingPlanSuite.suiteId, suiteId)),
    );
  return rows
    .map((row) => row.planId)
    .filter((id): id is string => typeof id === "string");
}

export async function replaceCaseRequirements(
  db: DatabaseExecutor,
  tenantId: string,
  caseId: string,
  requirementIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingCaseRequirement)
    .where(
      and(
        eq(testingCaseRequirement.tenantId, tenantId),
        eq(testingCaseRequirement.caseId, caseId),
      ),
    );
  if (requirementIds.length === 0) return;
  await db.insert(testingCaseRequirement).values(
    requirementIds.map((requirementId) => ({
      tenantId,
      caseId,
      requirementId,
    })),
  );
}

export async function loadCaseRequirementIds(
  db: DatabaseExecutor,
  tenantId: string,
  caseId: string,
): Promise<string[]> {
  const rows = await db
    .select({ requirementId: testingCaseRequirement.requirementId })
    .from(testingCaseRequirement)
    .where(
      and(
        eq(testingCaseRequirement.tenantId, tenantId),
        eq(testingCaseRequirement.caseId, caseId),
      ),
    );
  return rows
    .map((row) => row.requirementId)
    .filter((id): id is string => typeof id === "string");
}

export async function loadCaseSuiteIds(
  db: DatabaseExecutor,
  tenantId: string,
  caseId: string,
): Promise<string[]> {
  const rows = await db
    .select({ suiteId: testingSuiteCase.suiteId })
    .from(testingSuiteCase)
    .where(
      and(eq(testingSuiteCase.tenantId, tenantId), eq(testingSuiteCase.caseId, caseId)),
    );
  return rows
    .map((row) => row.suiteId)
    .filter((id): id is string => typeof id === "string");
}

export async function loadCaseStepIds(
  db: DatabaseExecutor,
  tenantId: string,
  caseId: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: testingTestStep.id })
    .from(testingTestStep)
    .where(
      and(
        eq(testingTestStep.tenantId, tenantId),
        eq(testingTestStep.caseId, caseId),
        isNull(testingTestStep.archivedAt),
      ),
    );
  return rows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === "string");
}

export async function replaceRiskRequirements(
  db: DatabaseExecutor,
  tenantId: string,
  riskId: string,
  requirementIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingRiskRequirement)
    .where(
      and(
        eq(testingRiskRequirement.tenantId, tenantId),
        eq(testingRiskRequirement.riskId, riskId),
      ),
    );
  if (requirementIds.length === 0) return;
  await db.insert(testingRiskRequirement).values(
    requirementIds.map((requirementId) => ({
      tenantId,
      riskId,
      requirementId,
    })),
  );
}

export async function loadRiskRequirementIds(
  db: DatabaseExecutor,
  tenantId: string,
  riskId: string,
): Promise<string[]> {
  const rows = await db
    .select({ requirementId: testingRiskRequirement.requirementId })
    .from(testingRiskRequirement)
    .where(
      and(
        eq(testingRiskRequirement.tenantId, tenantId),
        eq(testingRiskRequirement.riskId, riskId),
      ),
    );
  return rows
    .map((row) => row.requirementId)
    .filter((id): id is string => typeof id === "string");
}

export async function loadRequirementRiskIds(
  db: DatabaseExecutor,
  tenantId: string,
  requirementId: string,
): Promise<string[]> {
  const rows = await db
    .select({ riskId: testingRiskRequirement.riskId })
    .from(testingRiskRequirement)
    .where(
      and(
        eq(testingRiskRequirement.tenantId, tenantId),
        eq(testingRiskRequirement.requirementId, requirementId),
      ),
    );
  return rows
    .map((row) => row.riskId)
    .filter((id): id is string => typeof id === "string");
}

export async function replaceRequirementRisks(
  db: DatabaseExecutor,
  tenantId: string,
  requirementId: string,
  riskIds: readonly string[],
): Promise<void> {
  await db
    .delete(testingRiskRequirement)
    .where(
      and(
        eq(testingRiskRequirement.tenantId, tenantId),
        eq(testingRiskRequirement.requirementId, requirementId),
      ),
    );
  if (riskIds.length === 0) return;
  await db.insert(testingRiskRequirement).values(
    riskIds.map((riskId) => ({
      tenantId,
      riskId,
      requirementId,
    })),
  );
}

/** Sync normalized step-actual rows from embedded JSON on a manual execution. */
export async function syncManualStepActuals(
  db: DatabaseExecutor,
  options: {
    tenantId: string;
    organisationId?: string;
    executionId: string;
    stepActuals: readonly ManualStepActualRecord[];
    actorUserId?: string;
  },
): Promise<void> {
  await db
    .delete(testingManualStepActual)
    .where(
      and(
        eq(testingManualStepActual.tenantId, options.tenantId),
        eq(testingManualStepActual.executionId, options.executionId),
      ),
    );
  if (options.stepActuals.length === 0) return;
  const now = new Date();
  await db.insert(testingManualStepActual).values(
    options.stepActuals.map((step) => ({
      id: randomUUID(),
      tenantId: options.tenantId,
      organisationId: options.organisationId ?? null,
      executionId: options.executionId,
      stepId: step.stepId,
      actualResult: step.actualResult ?? null,
      status: step.status ?? null,
      evidenceIds: [...(step.evidenceIds ?? [])],
      notes: step.notes ?? null,
      comment: step.comment ?? null,
      recordedAt: step.recordedAt ? new Date(step.recordedAt) : null,
      expectedSnapshot: step.expectedSnapshot ?? null,
      recordedByUserId: step.recordedByUserId ?? options.actorUserId ?? null,
      revision: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: options.actorUserId ?? null,
      updatedBy: options.actorUserId ?? null,
      archivedAt: null,
    })),
  );
}
