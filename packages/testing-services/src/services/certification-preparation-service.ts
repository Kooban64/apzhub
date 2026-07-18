import type {
  CertificationPreparationService,
  CertificationPreparationSummary,
  RiskLevel,
} from "@apzhub/testing-contracts";
import {
  asApprovalId,
  canonicalizeExecutionStatus,
  type CertificationRecordId,
  type TestPlanId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

const LEVEL_RANK: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function isExecutionComplete(status: string): boolean {
  const canon = canonicalizeExecutionStatus(status as never);
  return (
    canon === "completed" ||
    canon === "under_review" ||
    canon === "approved" ||
    canon === "rejected" ||
    canon === "cancelled" ||
    canon === "archived"
  );
}

export function createCertificationPreparationService(
  rt: ServiceRuntime,
): CertificationPreparationService {
  async function computeForPlan(
    ctx: Parameters<CertificationPreparationService["prepareForPlan"]>[0],
    planId: TestPlanId,
    certificationRecordId?: CertificationRecordId,
  ): Promise<CertificationPreparationSummary> {
    const rctx = toRepositoryContext(ctx);
    const plan = requireFound(
      await rt.persistence.testPlans.get(rctx, planId),
      "test_plan",
      planId,
    );

    const cases = (await rt.persistence.testCases.list(rctx)).items.filter((c) =>
      c.suiteIds.some((s) => plan.suiteIds.includes(s)),
    );
    const coverageGaps: string[] = [];
    for (const reqId of plan.requirementIds) {
      const covered = cases.some((c) => c.requirementIds.includes(reqId));
      if (!covered) coverageGaps.push(`requirement:${reqId}`);
    }

    const executions = (await rt.persistence.manualExecutions.list(rctx)).items.filter(
      (e) => cases.some((c) => c.id === e.caseId),
    );
    const incompleteExecutionIds = executions
      .filter((e) => !isExecutionComplete(e.status))
      .map((e) => e.id);
    const executionCompletenessPercent =
      executions.length === 0
        ? 0
        : Math.round(
            ((executions.length - incompleteExecutionIds.length) / executions.length) *
              100,
          );

    const evidence = (await rt.persistence.evidence.list(rctx)).items;
    const missingEvidenceIds: string[] = [];
    for (const exec of executions.filter((e) => {
      const canon = canonicalizeExecutionStatus(e.status as never);
      return canon === "completed" || canon === "approved";
    })) {
      const has = evidence.some((ev) => ev.executionId === exec.id);
      if (!has) missingEvidenceIds.push(exec.id);
    }

    const approvals = (await rt.persistence.approvals.list(rctx)).items.filter((a) =>
      certificationRecordId ? a.certificationRecordId === certificationRecordId : true,
    );
    const pendingApprovalIds = approvals
      .filter((a) => a.status === "pending" || a.status === "rework")
      .map((a) => asApprovalId(a.id));
    const approvalCompletenessPercent =
      approvals.length === 0
        ? 100
        : Math.round(
            ((approvals.length - pendingApprovalIds.length) / approvals.length) * 100,
          );

    const risks = (await rt.persistence.risks.list(rctx)).items.filter((r) =>
      plan.riskIds.includes(r.id),
    );
    let highestLevel: RiskLevel | undefined;
    let highOrCriticalCount = 0;
    for (const risk of risks) {
      if (risk.level === "high" || risk.level === "critical") highOrCriticalCount += 1;
      if (!highestLevel || LEVEL_RANK[risk.level] > LEVEL_RANK[highestLevel]) {
        highestLevel = risk.level;
      }
    }

    return {
      planId,
      certificationRecordId,
      coverageGaps,
      missingEvidenceIds,
      missingEvidenceCount: missingEvidenceIds.length,
      approvalCompletenessPercent,
      pendingApprovalIds,
      executionCompletenessPercent,
      incompleteExecutionIds,
      riskSummary: {
        totalRisks: risks.length,
        highOrCriticalCount,
        highestLevel,
      },
      computedAt: rt.now(),
    };
  }

  return {
    async prepareForPlan(ctx, planId) {
      const summary = await computeForPlan(ctx, planId);
      rt.events.record({
        eventType: "certification_preparation.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { planId, coverageGaps: summary.coverageGaps.length },
      });
      return summary;
    },
    async prepareForCertification(ctx, certificationRecordId) {
      const rctx = toRepositoryContext(ctx);
      const cert = requireFound(
        await rt.persistence.certificationRecords.get(rctx, certificationRecordId),
        "certification_record",
        certificationRecordId,
      );
      if (!cert.planId) {
        return {
          certificationRecordId,
          coverageGaps: ["missing_plan"],
          missingEvidenceIds: [],
          missingEvidenceCount: 0,
          approvalCompletenessPercent: 0,
          pendingApprovalIds: [],
          executionCompletenessPercent: 0,
          incompleteExecutionIds: [],
          riskSummary: { totalRisks: 0, highOrCriticalCount: 0 },
          computedAt: rt.now(),
        };
      }
      const summary = await computeForPlan(
        ctx,
        cert.planId as TestPlanId,
        certificationRecordId,
      );
      rt.events.record({
        eventType: "certification_preparation.computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { certificationRecordId },
      });
      return summary;
    },
  };
}
