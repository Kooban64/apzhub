import type {
  CertificationReadinessAssessment,
  CertificationReadinessService,
  ReadinessDimension,
} from "@apzhub/testing-contracts";
import type { CertificationRecordId, TestPlanId } from "@apzhub/testing-contracts";

import { createCertificationPreparationService } from "../services/certification-preparation-service";
import type { ServiceRuntime } from "../services/types";
import { dimensionStatusFromScore, overallReadinessScore } from "./calculations";

function toDimensions(
  preparation: CertificationReadinessAssessment["preparation"],
): ReadinessDimension[] {
  const coverageScore = Math.max(0, 100 - preparation.coverageGaps.length * 10);
  const evidenceScore = Math.max(0, 100 - preparation.missingEvidenceCount * 10);
  const approvalScore = preparation.approvalCompletenessPercent;
  const executionScore = preparation.executionCompletenessPercent;
  const riskScore = Math.max(0, 100 - preparation.riskSummary.highOrCriticalCount * 20);

  const entries: Array<{ key: string; score: number; reasons: string[] }> = [
    {
      key: "coverage",
      score: coverageScore,
      reasons:
        preparation.coverageGaps.length > 0
          ? [`coverage_gaps:${preparation.coverageGaps.length}`]
          : [],
    },
    {
      key: "evidence",
      score: evidenceScore,
      reasons:
        preparation.missingEvidenceCount > 0
          ? [`missing_evidence:${preparation.missingEvidenceCount}`]
          : [],
    },
    {
      key: "approval",
      score: approvalScore,
      reasons:
        approvalScore < 100
          ? [`pending_approvals:${preparation.pendingApprovalIds.length}`]
          : [],
    },
    {
      key: "execution",
      score: executionScore,
      reasons:
        executionScore < 100
          ? [`incomplete_executions:${preparation.incompleteExecutionIds.length}`]
          : [],
    },
    {
      key: "risk",
      score: riskScore,
      reasons:
        preparation.riskSummary.highOrCriticalCount > 0
          ? [`high_risks:${preparation.riskSummary.highOrCriticalCount}`]
          : [],
    },
  ];

  return entries.map((e) => ({
    key: e.key,
    score: e.score,
    status: dimensionStatusFromScore(e.score, e.reasons),
    reasons: e.reasons,
  }));
}

/** Structured certification readiness — wraps CertificationPreparation. */
export function createCertificationReadinessService(
  rt: ServiceRuntime,
): CertificationReadinessService {
  const prep = createCertificationPreparationService(rt);

  return {
    async assessForPlan(ctx, planId: TestPlanId) {
      const preparation = await prep.prepareForPlan(ctx, planId);
      const dimensions = toDimensions(preparation);
      const overallScore = overallReadinessScore(dimensions.map((d) => d.score));
      const result: CertificationReadinessAssessment = {
        planId,
        preparation,
        dimensions,
        overallScore,
        blockingFactors: dimensions.flatMap((d) => d.reasons),
        computedAt: rt.now(),
        isDecision: false,
      };
      rt.events.record({
        eventType: "certification_readiness.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId, overallScore, isDecision: false },
      });
      return result;
    },
    async assessForCertification(ctx, certificationRecordId: CertificationRecordId) {
      const preparation = await prep.prepareForCertification(
        ctx,
        certificationRecordId,
      );
      const dimensions = toDimensions(preparation);
      const overallScore = overallReadinessScore(dimensions.map((d) => d.score));
      const result: CertificationReadinessAssessment = {
        planId: preparation.planId,
        certificationRecordId,
        preparation,
        dimensions,
        overallScore,
        blockingFactors: dimensions.flatMap((d) => d.reasons),
        computedAt: rt.now(),
        isDecision: false,
      };
      rt.events.record({
        eventType: "certification_readiness.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { certificationRecordId, overallScore, isDecision: false },
      });
      return result;
    },
  };
}
