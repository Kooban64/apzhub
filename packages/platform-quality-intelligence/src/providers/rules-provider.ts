import type {
  IntelligenceEvaluationContext,
  IntelligenceEvaluationOutcome,
  IntelligenceProvider,
  ProviderRecommendationDraft,
} from "../contracts/provider";
import {
  clampConfidenceNumeric,
  confidenceLevelFromNumeric,
} from "../contracts/confidence";

function countBySource(
  observations: IntelligenceEvaluationContext["observations"],
  source: string,
): number {
  return observations.filter((o) => o.source === source).length;
}

function countFailures(
  observations: IntelligenceEvaluationContext["observations"],
): number {
  return observations.filter(
    (o) =>
      o.severity === "critical" ||
      o.kind.includes("failure") ||
      o.kind.includes("failed"),
  ).length;
}

function countEvidenceGaps(
  observations: IntelligenceEvaluationContext["observations"],
): number {
  return observations.filter(
    (o) =>
      o.source === "evidence" &&
      (o.severity === "warning" || o.severity === "critical"),
  ).length;
}

export function createRulesProvider(): IntelligenceProvider {
  return {
    descriptor: {
      providerId: "rules",
      name: "Rules Provider",
      kind: "rules",
      version: "0.1.0",
      status: "active",
      capabilities: ["deterministic-rules", "recommendations", "offline"],
    },
    async health() {
      return { ok: true, detail: "rules provider ready" };
    },
    async evaluate(context): Promise<IntelligenceEvaluationOutcome> {
      const recommendations: ProviderRecommendationDraft[] = [];
      const evidenceGaps = countEvidenceGaps(context.observations);
      const failures = countFailures(context.observations);
      const automationFailures = context.observations.filter(
        (o) => o.source === "automation" && o.severity === "critical",
      );

      if (evidenceGaps > 0) {
        const observationIds = context.observations
          .filter((o) => o.source === "evidence")
          .map((o) => o.observationId);
        const numeric = clampConfidenceNumeric(60 + evidenceGaps * 5);
        recommendations.push({
          type: "improve_evidence",
          priority: evidenceGaps >= 2 ? "high" : "medium",
          reason: `Evidence completeness is low (${evidenceGaps} gap(s) detected)`,
          evidenceRefs: context.observations
            .flatMap((o) => o.evidenceRefs ?? [])
            .slice(0, 5),
          observationIds,
          confidence: {
            level: confidenceLevelFromNumeric(numeric),
            numeric,
            factors: { evidenceGaps, rule: "evidence_completeness_low" },
          },
          explanation: {
            reason: "Rule triggered: evidence_completeness below threshold",
            evidenceRefs: [],
            contributingObservationIds: observationIds,
            confidence: {
              level: confidenceLevelFromNumeric(numeric),
              numeric,
            },
            providerId: "rules",
            inputs: { evidenceGaps },
            decisionPath: [
              "count evidence observations with warning/critical severity",
              "threshold exceeded → recommend improve_evidence",
            ],
          },
        });
      }

      if (failures > 0 || automationFailures.length > 0) {
        const observationIds = context.observations
          .filter(
            (o) =>
              o.source === "automation" ||
              o.kind.includes("failure") ||
              o.severity === "critical",
          )
          .map((o) => o.observationId);
        const numeric = clampConfidenceNumeric(55 + failures * 8);
        recommendations.push({
          type: "run_regression",
          priority: failures >= 3 ? "critical" : "high",
          reason: `Automation failures detected (${failures} failure observation(s))`,
          evidenceRefs: [],
          observationIds,
          confidence: {
            level: confidenceLevelFromNumeric(numeric),
            numeric,
            factors: { failures, rule: "automation_failures" },
          },
          explanation: {
            reason: "Rule triggered: automation failure concentration",
            evidenceRefs: [],
            contributingObservationIds: observationIds,
            confidence: {
              level: confidenceLevelFromNumeric(numeric),
              numeric,
            },
            providerId: "rules",
            inputs: { failures, automationFailures: automationFailures.length },
            decisionPath: [
              "scan observations for failure/critical severity",
              "failures > 0 → recommend run_regression",
            ],
          },
        });
      }

      const defectCount = countBySource(context.observations, "defects");
      if (defectCount >= 2) {
        const observationIds = context.observations
          .filter((o) => o.source === "defects")
          .map((o) => o.observationId);
        const numeric = clampConfidenceNumeric(50 + defectCount * 10);
        recommendations.push({
          type: "address_defects",
          priority: "medium",
          reason: `Recurring defects observed (${defectCount})`,
          evidenceRefs: [],
          observationIds,
          confidence: {
            level: confidenceLevelFromNumeric(numeric),
            numeric,
            factors: { defectCount, rule: "defect_recurrence" },
          },
          explanation: {
            reason: "Rule triggered: defect recurrence threshold",
            evidenceRefs: [],
            contributingObservationIds: observationIds,
            confidence: {
              level: confidenceLevelFromNumeric(numeric),
              numeric,
            },
            providerId: "rules",
            inputs: { defectCount },
            decisionPath: [
              "count defect-source observations",
              "defectCount >= 2 → recommend address_defects",
            ],
          },
        });
      }

      return {
        recommendations,
        signalContributions: [],
        scoreContributions: [],
        explanations: recommendations.map((r) => r.explanation),
      };
    },
  };
}
