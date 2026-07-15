import type {
  ReleaseReadinessInputs,
  ReleaseReadinessService,
  ReleaseReadinessStatus,
} from "@apzhub/testing-contracts";
import {
  canonicalizeExecutionStatus,
  type CertificationRecordId,
  type TestPlanId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { createCertificationPreparationService } from "./certification-preparation-service";
import type { ServiceRuntime } from "./types";

function suggestStatus(
  preparation: ReleaseReadinessInputs["preparation"],
  extras: {
    failCount: number;
    blockedCount: number;
    missingEvidenceCount: number;
    missingApprovalCount: number;
  },
): { status: ReleaseReadinessStatus; blockers: string[] } {
  const blockers: string[] = [];
  if (preparation.coverageGaps.length > 0) {
    blockers.push(`coverage_gaps:${preparation.coverageGaps.length}`);
  }
  if (extras.missingEvidenceCount > 0) {
    blockers.push(`missing_evidence:${extras.missingEvidenceCount}`);
  }
  if (preparation.approvalCompletenessPercent < 100) {
    blockers.push(`approvals_incomplete:${preparation.approvalCompletenessPercent}`);
  }
  if (extras.missingApprovalCount > 0) {
    blockers.push(`missing_approvals:${extras.missingApprovalCount}`);
  }
  if (preparation.executionCompletenessPercent < 100) {
    blockers.push(
      `executions_incomplete:${preparation.executionCompletenessPercent}`,
    );
  }
  if (extras.failCount > 0) {
    blockers.push(`fail_count:${extras.failCount}`);
  }
  if (extras.blockedCount > 0) {
    blockers.push(`blocked_count:${extras.blockedCount}`);
  }
  if (preparation.riskSummary.highOrCriticalCount > 0) {
    blockers.push(`high_risks:${preparation.riskSummary.highOrCriticalCount}`);
  }

  let status: ReleaseReadinessStatus;
  if (blockers.length === 0) status = "ready";
  else if (
    preparation.executionCompletenessPercent === 0 &&
    preparation.coverageGaps.length > 0
  ) {
    status = "not_ready";
  } else if (
    extras.missingEvidenceCount > 0 ||
    preparation.approvalCompletenessPercent < 50 ||
    extras.blockedCount > 0
  ) {
    status = "blocked";
  } else {
    status = "partially_ready";
  }
  return { status, blockers };
}

async function enrichExecutionMetrics(
  rt: ServiceRuntime,
  ctx: Parameters<ReleaseReadinessService["calculateForPlan"]>[0],
  preparation: ReleaseReadinessInputs["preparation"],
): Promise<{
  passPercent: number;
  failCount: number;
  blockedCount: number;
  missingEvidenceCount: number;
  missingApprovalCount: number;
  completionPercent: number;
}> {
  const rctx = toRepositoryContext(ctx);
  const executions = (await rt.persistence.manualExecutions.list(rctx)).items;
  let pass = 0;
  let failCount = 0;
  let blockedCount = 0;
  let completedLike = 0;
  for (const exec of executions) {
    const canon = canonicalizeExecutionStatus(exec.status);
    if (
      canon === "completed" ||
      canon === "under_review" ||
      canon === "approved" ||
      canon === "rejected" ||
      canon === "archived"
    ) {
      completedLike += 1;
    }
    if (exec.overallResult === "pass") pass += 1;
    if (exec.overallResult === "fail") failCount += 1;
    if (exec.overallResult === "blocked" || canon === "blocked") blockedCount += 1;
  }
  const passPercent =
    executions.length === 0 ? 0 : Math.round((pass / executions.length) * 100);
  const completionPercent =
    executions.length === 0
      ? preparation.executionCompletenessPercent
      : Math.round((completedLike / executions.length) * 100);

  return {
    passPercent,
    failCount,
    blockedCount,
    missingEvidenceCount: preparation.missingEvidenceCount,
    missingApprovalCount: preparation.pendingApprovalIds.length,
    completionPercent,
  };
}

/**
 * Calculates release readiness *inputs* only.
 * Never persists a release decision and never flips certification state.
 */
export function createReleaseReadinessService(
  rt: ServiceRuntime,
): ReleaseReadinessService {
  const prep = createCertificationPreparationService(rt);

  return {
    async calculateForPlan(ctx, planId: TestPlanId): Promise<ReleaseReadinessInputs> {
      const preparation = await prep.prepareForPlan(ctx, planId);
      const metrics = await enrichExecutionMetrics(rt, ctx, preparation);
      const { status, blockers } = suggestStatus(preparation, metrics);
      const result: ReleaseReadinessInputs = {
        planId,
        preparation,
        blockingFactors: blockers,
        suggestedStatus: status,
        computedAt: rt.now(),
        isDecision: false,
        passPercent: metrics.passPercent,
        failCount: metrics.failCount,
        blockedCount: metrics.blockedCount,
        missingEvidenceCount: metrics.missingEvidenceCount,
        missingApprovalCount: metrics.missingApprovalCount,
        completionPercent: metrics.completionPercent,
      };
      rt.events.record({
        eventType: "release_readiness_inputs.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId, suggestedStatus: status, isDecision: false },
      });
      return result;
    },
    async calculateForCertification(
      ctx,
      certificationRecordId: CertificationRecordId,
    ): Promise<ReleaseReadinessInputs> {
      const preparation = await prep.prepareForCertification(
        ctx,
        certificationRecordId,
      );
      const metrics = await enrichExecutionMetrics(rt, ctx, preparation);
      const { status, blockers } = suggestStatus(preparation, metrics);
      const result: ReleaseReadinessInputs = {
        certificationRecordId,
        planId: preparation.planId,
        preparation,
        blockingFactors: blockers,
        suggestedStatus: status,
        computedAt: rt.now(),
        isDecision: false,
        passPercent: metrics.passPercent,
        failCount: metrics.failCount,
        blockedCount: metrics.blockedCount,
        missingEvidenceCount: metrics.missingEvidenceCount,
        missingApprovalCount: metrics.missingApprovalCount,
        completionPercent: metrics.completionPercent,
      };
      rt.events.record({
        eventType: "release_readiness_inputs.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          certificationRecordId,
          suggestedStatus: status,
          isDecision: false,
        },
      });
      return result;
    },
  };
}
