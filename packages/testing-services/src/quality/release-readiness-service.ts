import type {
  ReadinessDimension,
  ReleaseReadinessAssessment,
  ReleaseReadinessInputs,
  ReleaseReadinessService,
  ReleaseReadinessStatus,
} from "@apzhub/testing-contracts";
import type { CertificationRecordId, TestPlanId } from "@apzhub/testing-contracts";

import { createCertificationPreparationService } from "../services/certification-preparation-service";
import { createReleaseReadinessService as createLegacyReleaseReadinessService } from "../services/release-readiness-service";
import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";
import {
  dimensionStatusFromScore,
  overallReadinessScore,
  suggestedReleaseStatusFromDimensions,
} from "./calculations";
import { assertReleaseCalculationInputs } from "./validation";

function dim(key: string, score: number, reasons: string[]): ReadinessDimension {
  const status = dimensionStatusFromScore(score, reasons);
  return { key, score, status, reasons };
}

async function buildAssessment(
  rt: ServiceRuntime,
  ctx: Parameters<ReleaseReadinessService["calculateForPlan"]>[0],
  legacy: ReleaseReadinessInputs,
  releaseLabel?: string,
): Promise<ReleaseReadinessAssessment> {
  const rctx = toRepositoryContext(ctx);
  const defects = (await rt.persistence.defectLinks.list(rctx)).items;
  const coverage = (await rt.persistence.coverageRecords.list(rctx)).items;
  const autoExecs = (await rt.persistence.automatedExecutions.list(rctx)).items;
  const openDefects = defects.filter((d) =>
    ["open", "in_progress", "reopened"].includes(d.status),
  );
  const criticalOpen = openDefects.filter(
    (d) => d.severity === "critical" || d.severity === "blocker",
  );

  const prep = legacy.preparation;
  const executionScore = prep.executionCompletenessPercent;
  const executionReasons =
    executionScore < 100
      ? [`incomplete_executions:${prep.incompleteExecutionIds.length}`]
      : [];

  const coverageScore =
    coverage.length === 0
      ? Math.max(0, 100 - prep.coverageGaps.length * 10)
      : Math.round(coverage.reduce((s, c) => s + c.percentage, 0) / coverage.length);
  const coverageReasons =
    prep.coverageGaps.length > 0 ? [`coverage_gaps:${prep.coverageGaps.length}`] : [];

  const evidenceScore = Math.max(0, 100 - prep.missingEvidenceCount * 10);
  const evidenceReasons =
    prep.missingEvidenceCount > 0
      ? [`missing_evidence:${prep.missingEvidenceCount}`]
      : [];

  const approvalScore = prep.approvalCompletenessPercent;
  const approvalReasons =
    approvalScore < 100 ? [`pending_approvals:${prep.pendingApprovalIds.length}`] : [];

  const automationScore =
    autoExecs.length === 0 ? 50 : Math.min(100, autoExecs.length * 10);
  const automationReasons = autoExecs.length === 0 ? ["no_automation_executions"] : [];

  const defectScore = Math.max(
    0,
    100 - openDefects.length * 15 - criticalOpen.length * 25,
  );
  const defectReasons =
    openDefects.length > 0 ? [`open_defects:${openDefects.length}`] : [];

  const riskScore = Math.max(0, 100 - prep.riskSummary.highOrCriticalCount * 20);
  const riskReasons =
    prep.riskSummary.highOrCriticalCount > 0
      ? [`high_risks:${prep.riskSummary.highOrCriticalCount}`]
      : [];

  const dimensions = {
    execution: dim("execution", executionScore, executionReasons),
    coverage: dim("coverage", coverageScore, coverageReasons),
    evidence: dim("evidence", evidenceScore, evidenceReasons),
    approval: dim("approval", approvalScore, approvalReasons),
    automation: dim("automation", automationScore, automationReasons),
    defect: dim("defect", defectScore, defectReasons),
    risk: dim("risk", riskScore, riskReasons),
  };

  const scores = Object.values(dimensions).map((d) => d.score);
  const statuses = Object.values(dimensions).map((d) => d.status);
  // Formula: overallScore = equal-weight average of the seven dimension scores (0–100).
  const overallScore = overallReadinessScore(scores);
  const suggestedStatus = suggestedReleaseStatusFromDimensions(
    statuses,
  ) as ReleaseReadinessStatus;
  const blockingFactors = Object.values(dimensions).flatMap((d) => d.reasons);

  return {
    planId: legacy.planId,
    certificationRecordId: legacy.certificationRecordId,
    releaseLabel,
    dimensions,
    overallScore,
    suggestedStatus,
    blockingFactors,
    computedAt: rt.now(),
    isDecision: false,
    legacyInputs: legacy,
  };
}

/**
 * Enriched release readiness — wraps legacy calculator and adds dimensions.
 * Always `isDecision: false`; never auto-approves.
 */
export function createQualityReleaseReadinessService(
  rt: ServiceRuntime,
): ReleaseReadinessService {
  const legacy = createLegacyReleaseReadinessService(rt);

  return {
    calculateForPlan: (ctx, planId) => legacy.calculateForPlan(ctx, planId),
    calculateForCertification: (ctx, id) => legacy.calculateForCertification(ctx, id),

    async assessForPlan(ctx, planId: TestPlanId) {
      assertReleaseCalculationInputs({ hasPlanOrRelease: Boolean(planId) });
      const inputs = await legacy.calculateForPlan(ctx, planId);
      const assessment = await buildAssessment(rt, ctx, inputs);
      rt.events.record({
        eventType: "release_readiness.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          planId,
          overallScore: assessment.overallScore,
          isDecision: false,
        },
      });
      return assessment;
    },

    async assessForRelease(ctx, releaseLabel: string, planId?: TestPlanId) {
      assertReleaseCalculationInputs({
        hasPlanOrRelease: Boolean(releaseLabel || planId),
      });
      let inputs: ReleaseReadinessInputs;
      if (planId) {
        inputs = await legacy.calculateForPlan(ctx, planId);
      } else {
        const prep = createCertificationPreparationService(rt);
        // Without a plan, use empty preparation scaffold via a synthetic call path
        const preparation = {
          coverageGaps: [] as string[],
          missingEvidenceIds: [] as string[],
          missingEvidenceCount: 0,
          approvalCompletenessPercent: 0,
          pendingApprovalIds: [] as never[],
          executionCompletenessPercent: 0,
          incompleteExecutionIds: [] as string[],
          riskSummary: { totalRisks: 0, highOrCriticalCount: 0 },
          computedAt: rt.now(),
        };
        void prep;
        inputs = {
          preparation,
          blockingFactors: [],
          suggestedStatus: "not_ready",
          computedAt: rt.now(),
          isDecision: false,
        };
      }
      const assessment = await buildAssessment(rt, ctx, inputs, releaseLabel);
      rt.events.record({
        eventType: "release_readiness.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          releaseLabel,
          planId,
          overallScore: assessment.overallScore,
          isDecision: false,
        },
      });
      return assessment;
    },

    async assessForCertification(ctx, certificationRecordId: CertificationRecordId) {
      const inputs = await legacy.calculateForCertification(ctx, certificationRecordId);
      const assessment = await buildAssessment(rt, ctx, inputs);
      rt.events.record({
        eventType: "release_readiness.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          certificationRecordId,
          overallScore: assessment.overallScore,
          isDecision: false,
        },
      });
      return assessment;
    },
  };
}
