import type {
  EngineeringAggregationInputs,
  EngineeringAggregationService,
  EngineeringScope,
  QualityIntelligenceMetrics,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";
import { clamp01to100, emptyAggregation, readMetric, round2 } from "./calculations";

function avg(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((s, v) => s + v, 0) / values.length);
}

/**
 * Gather aggregation inputs from existing SoR entities.
 * Consumes quality snapshot metrics and counts — does not re-run QI formulas.
 */
export function createEngineeringAggregationService(
  rt: ServiceRuntime,
): EngineeringAggregationService {
  return {
    async gatherInputs(ctx, scope?: EngineeringScope) {
      const rctx = toRepositoryContext(ctx);
      const reasons: string[] = [];
      const sourceRefs: Record<string, string[]> = {};

      const qiSnapshots = (await rt.persistence.qualitySnapshots.list(rctx)).items;
      const latestQi = qiSnapshots
        .slice()
        .sort((a, b) => b.computedAt.localeCompare(a.computedAt))[0];

      let coverage = 0;
      let automation = 0;
      let manualExecution = 0;
      let failedTests = 0;
      let openDefects = 0;
      let approvals = 0;
      let stability = 0;

      if (latestQi) {
        const m = latestQi.metrics as unknown as QualityIntelligenceMetrics &
          Record<string, unknown>;
        coverage = clamp01to100(readMetric(m, "coverageCompleteness") ?? 0);
        automation = clamp01to100(readMetric(m, "automationRatio") ?? 0);
        manualExecution = clamp01to100(readMetric(m, "manualRatio") ?? 0);
        failedTests = clamp01to100(readMetric(m, "failRate") ?? 0);
        const density = readMetric(m, "defectDensity") ?? 0;
        openDefects = clamp01to100(readMetric(m, "openDefectImpact") ?? density * 100);
        approvals = clamp01to100(readMetric(m, "approvalCompleteness") ?? 0);
        stability = clamp01to100(
          100 -
            (readMetric(m, "failRate") ?? 0) * 0.7 -
            (readMetric(m, "riskScore") ?? 0) * 0.3,
        );
        sourceRefs.qualitySnapshots = [latestQi.id];
        reasons.push("consumed latest quality.snapshot metrics");
      } else {
        reasons.push("no quality snapshots — falling back to coverage/defect counts");
        const coverageRows = (await rt.persistence.coverageRecords.list(rctx)).items;
        coverage = avg(coverageRows.map((c) => c.percentage));
        sourceRefs.coverageRecords = coverageRows.map((c) => c.id);

        const defects = (await rt.persistence.defectLinks.list(rctx)).items;
        const open = defects.filter((d) =>
          ["open", "in_progress", "reopened"].includes(d.status),
        );
        openDefects = clamp01to100((open.length / Math.max(defects.length, 1)) * 100);
        sourceRefs.defectLinks = defects.map((d) => d.id);

        const manual = (await rt.persistence.manualExecutions.list(rctx)).items;
        const auto = (await rt.persistence.automationRuns.list(rctx)).items;
        const execTotal = manual.length + auto.length;
        automation = execTotal === 0 ? 0 : round2((auto.length / execTotal) * 100);
        manualExecution =
          execTotal === 0 ? 0 : round2((manual.length / execTotal) * 100);
        const failed = [
          ...manual.filter((e) => e.overallResult === "fail" || e.status === "failed"),
          ...auto.filter((r) => r.status === "failed" || r.status === "fail"),
        ];
        failedTests = execTotal === 0 ? 0 : round2((failed.length / execTotal) * 100);
        sourceRefs.manualExecutions = manual.map((m) => m.id);
        sourceRefs.automationRuns = auto.map((a) => a.id);
      }

      const certs = (await rt.persistence.certificationRecords.list(rctx)).items;
      const approvedCerts = certs.filter((c) =>
        ["approved", "conditionally_approved", "certified"].includes(c.status),
      );
      const certification =
        certs.length === 0 ? 0 : round2((approvedCerts.length / certs.length) * 100);
      sourceRefs.certificationRecords = certs.map((c) => c.id);
      if (certs.length > 0)
        reasons.push("certification status aggregated from records");

      const releaseSnaps = (await rt.persistence.releaseReadinessSnapshots.list(rctx))
        .items;
      let releaseReadiness = 0;
      if (releaseSnaps.length > 0) {
        const scores = releaseSnaps.map((s) => {
          const json = s.snapshotJson as { overallScore?: number };
          return typeof json.overallScore === "number" ? json.overallScore : 0;
        });
        releaseReadiness = avg(scores);
        sourceRefs.releaseReadinessSnapshots = releaseSnaps.map((s) => s.id);
        reasons.push("release readiness consumed from readiness snapshots");
      }

      const pipelineRuns = (await rt.persistence.pipelineRuns.list(rctx)).items;
      const passed = pipelineRuns.filter((r) => r.status === "passed").length;
      const pipelineHealth =
        pipelineRuns.length === 0 ? 0 : round2((passed / pipelineRuns.length) * 100);
      sourceRefs.pipelineRuns = pipelineRuns.map((p) => p.id);
      if (pipelineRuns.length > 0)
        reasons.push("pipeline health from SoR run statuses");

      if (stability === 0 && pipelineHealth > 0) {
        stability = pipelineHealth;
      }

      const risk = round2(
        clamp01to100(
          failedTests * 0.35 + openDefects * 0.35 + (100 - pipelineHealth) * 0.3,
        ),
      );
      const velocity = round2(clamp01to100(automation * 0.5 + manualExecution * 0.5));
      const leadTime = round2(clamp01to100(pipelineHealth));

      if (scope?.releaseLabel) {
        reasons.push(`scoped to releaseLabel=${scope.releaseLabel}`);
      }

      const result: EngineeringAggregationInputs = {
        coverage,
        automation,
        manualExecution,
        failedTests,
        openDefects,
        certification,
        approvals: approvals || (await deriveApprovals(rt, ctx)),
        releaseReadiness,
        stability,
        pipelineHealth,
        risk,
        velocity,
        leadTime,
        sourceRefs,
        reasons: reasons.length > 0 ? reasons : emptyAggregation().reasons,
      };
      return result;
    },
  };
}

async function deriveApprovals(
  rt: ServiceRuntime,
  ctx: Parameters<EngineeringAggregationService["gatherInputs"]>[0],
): Promise<number> {
  const approvals = (await rt.persistence.approvals.list(toRepositoryContext(ctx)))
    .items;
  if (approvals.length === 0) return 0;
  const done = approvals.filter(
    (a) => a.status === "approved" || a.status === "conditional",
  ).length;
  return round2((done / approvals.length) * 100);
}
