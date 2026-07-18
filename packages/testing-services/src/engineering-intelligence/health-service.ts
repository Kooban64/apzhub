import type {
  EngineeringHealth,
  EngineeringHealthService,
  EngineeringIndicator,
  QualityScoreWeights,
} from "@apzhub/testing-contracts";

import type { ServiceRuntime } from "../services/types";
import { createEngineeringAggregationService } from "./aggregation-service";
import {
  aggregateRisk,
  clamp01to100,
  computeQualityScore,
  healthStatusFromScore,
  round2,
} from "./calculations";

export function createEngineeringHealthService(
  rt: ServiceRuntime,
): EngineeringHealthService {
  const aggregation = createEngineeringAggregationService(rt);
  return {
    async assess(ctx, scope, weights?: QualityScoreWeights) {
      const inputs = await aggregation.gatherInputs(ctx, scope);
      const quality = computeQualityScore({
        id: rt.id(),
        scope: scope ?? { tenantId: ctx.tenantId },
        inputs: {
          coverage: inputs.coverage,
          automation: inputs.automation,
          manualExecution: inputs.manualExecution,
          failedTests: inputs.failedTests,
          openDefects: inputs.openDefects,
          certification: inputs.certification,
          approvals: inputs.approvals,
          releaseReadiness: inputs.releaseReadiness,
        },
        weights,
        computedAt: rt.now(),
      });
      const risk = aggregateRisk(inputs, rt.now());
      const overallScore = round2(
        quality.score * 0.35 +
          inputs.stability * 0.15 +
          inputs.releaseReadiness * 0.15 +
          invertRisk(risk.overallScore) * 0.1 +
          inputs.coverage * 0.1 +
          inputs.automation * 0.05 +
          inputs.manualExecution * 0.05 +
          inputs.certification * 0.025 +
          inputs.pipelineHealth * 0.025,
      );
      const indicators: EngineeringIndicator[] = [
        indicator("quality", "Quality score", quality.score),
        indicator("stability", "Stability", inputs.stability),
        indicator("release_readiness", "Release readiness", inputs.releaseReadiness),
        indicator("risk", "Risk (inverted health)", invertRisk(risk.overallScore)),
        indicator("coverage", "Coverage", inputs.coverage),
        indicator("automation", "Automation", inputs.automation),
        indicator("manual_execution", "Manual execution", inputs.manualExecution),
        indicator("certification", "Certification", inputs.certification),
        indicator("pipeline_health", "Pipeline health", inputs.pipelineHealth),
      ];
      const health: EngineeringHealth = {
        scope: scope ?? { tenantId: ctx.tenantId, organisationId: ctx.organisationId },
        status: healthStatusFromScore(overallScore),
        overallScore: clamp01to100(overallScore),
        qualityScore: quality.score,
        stabilityScore: inputs.stability,
        releaseReadinessScore: inputs.releaseReadiness,
        riskScore: risk.overallScore,
        coverageScore: inputs.coverage,
        automationScore: inputs.automation,
        manualExecutionScore: inputs.manualExecution,
        certificationScore: inputs.certification,
        pipelineHealthScore: inputs.pipelineHealth,
        indicators,
        risk,
        computedAt: rt.now(),
        isDecision: false,
      };
      rt.events.record({
        eventType: "engineering.health_assessed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { status: health.status, overallScore: health.overallScore },
      });
      return health;
    },
  };
}

function invertRisk(riskScore: number): number {
  return clamp01to100(100 - riskScore);
}

function indicator(key: string, label: string, value: number): EngineeringIndicator {
  return {
    key,
    label,
    value: round2(value),
    status: healthStatusFromScore(value),
    reasons: [`${label} = ${round2(value)}`],
  };
}
