import type {
  IntelligenceEvaluationContext,
  IntelligenceEvaluationOutcome,
  IntelligenceProvider,
  ProviderSignalContribution,
  ProviderScoreContribution,
} from "../contracts/provider";
import type { QualitySignalKind } from "../contracts/signal";
import { clampConfidenceNumeric } from "../contracts/confidence";

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 100;
  }
  return clampConfidenceNumeric(Math.round((numerator / denominator) * 100));
}

function countBySource(
  observations: IntelligenceEvaluationContext["observations"],
  source: string,
): number {
  return observations.filter((o) => o.source === source).length;
}

export function createStatisticalProvider(): IntelligenceProvider {
  return {
    descriptor: {
      providerId: "statistical",
      name: "Statistical Provider",
      kind: "statistical",
      version: "0.1.0",
      status: "active",
      capabilities: ["counts", "rates", "signals", "scores", "offline"],
    },
    async health() {
      return { ok: true, detail: "statistical provider ready" };
    },
    async evaluate(context): Promise<IntelligenceEvaluationOutcome> {
      const total = context.observations.length;
      const critical = context.observations.filter(
        (o) => o.severity === "critical",
      ).length;
      const evidenceCount = countBySource(context.observations, "evidence");
      const automationCount = countBySource(context.observations, "automation");
      const scmCount = countBySource(context.observations, "scm");
      const requirementCount = countBySource(context.observations, "requirements");
      const defectCount = countBySource(context.observations, "defects");

      const signalContributions: ProviderSignalContribution[] = [];
      const observationIds = context.observations.map((o) => o.observationId);

      const evidenceCompleteness = rate(evidenceCount, Math.max(total, 1));
      signalContributions.push({
        kind: "evidence_completeness",
        value: evidenceCompleteness,
        trend: evidenceCompleteness >= 60 ? "stable" : "degrading",
        summary: `Evidence coverage ${evidenceCompleteness}% of observations`,
        observationIds,
      });

      const failureConcentration = rate(critical, Math.max(total, 1));
      signalContributions.push({
        kind: "failure_concentration",
        value: 100 - failureConcentration,
        trend: critical > 0 ? "degrading" : "stable",
        summary: `${critical} critical observation(s) of ${total}`,
        observationIds: context.observations
          .filter((o) => o.severity === "critical")
          .map((o) => o.observationId),
      });

      const automationHealth = rate(
        automationCount - critical,
        Math.max(automationCount, 1),
      );
      signalContributions.push({
        kind: "automation_health",
        value: automationHealth,
        trend: automationHealth >= 70 ? "stable" : "degrading",
        summary: `Automation health score ${automationHealth}`,
        observationIds: context.observations
          .filter((o) => o.source === "automation")
          .map((o) => o.observationId),
      });

      signalContributions.push({
        kind: "repository_activity",
        value: clampConfidenceNumeric(Math.min(scmCount * 20, 100)),
        trend: scmCount > 0 ? "improving" : "unknown",
        summary: `${scmCount} SCM observation(s)`,
        observationIds: context.observations
          .filter((o) => o.source === "scm")
          .map((o) => o.observationId),
      });

      signalContributions.push({
        kind: "requirement_volatility",
        value: clampConfidenceNumeric(Math.max(100 - requirementCount * 15, 0)),
        trend: requirementCount >= 3 ? "degrading" : "stable",
        summary: `${requirementCount} requirement observation(s)`,
        observationIds: context.observations
          .filter((o) => o.source === "requirements")
          .map((o) => o.observationId),
      });

      signalContributions.push({
        kind: "defect_recurrence",
        value: clampConfidenceNumeric(Math.max(100 - defectCount * 20, 0)),
        trend: defectCount >= 2 ? "degrading" : "stable",
        summary: `${defectCount} defect observation(s)`,
        observationIds: context.observations
          .filter((o) => o.source === "defects")
          .map((o) => o.observationId),
      });

      const executionCount = countBySource(context.observations, "execution");
      signalContributions.push({
        kind: "execution_instability",
        value: clampConfidenceNumeric(Math.max(100 - executionCount * 10, 0)),
        trend: executionCount >= 4 ? "degrading" : "stable",
        summary: `${executionCount} execution observation(s)`,
        observationIds: context.observations
          .filter((o) => o.source === "execution")
          .map((o) => o.observationId),
      });

      signalContributions.push({
        kind: "coverage_trend",
        value: clampConfidenceNumeric(
          Math.round((evidenceCompleteness + automationHealth) / 2),
        ),
        trend: "stable",
        summary: "Blended coverage trend from evidence and automation",
        observationIds,
      });

      const scoreContributions: ProviderScoreContribution[] = [
        { dimension: "evidence", value: evidenceCompleteness, weight: 1 },
        { dimension: "automation", value: automationHealth, weight: 1 },
        {
          dimension: "repository",
          value: clampConfidenceNumeric(Math.min(scmCount * 25, 100)),
          weight: 0.8,
        },
        {
          dimension: "requirement",
          value: clampConfidenceNumeric(Math.max(100 - requirementCount * 12, 0)),
          weight: 0.8,
        },
        {
          dimension: "execution",
          value: clampConfidenceNumeric(Math.max(100 - executionCount * 8, 0)),
          weight: 1,
        },
        {
          dimension: "project",
          value: clampConfidenceNumeric(
            Math.round((evidenceCompleteness + automationHealth) / 2),
          ),
          weight: 0.9,
        },
        {
          dimension: "product",
          value: clampConfidenceNumeric(Math.max(100 - defectCount * 15, 0)),
          weight: 0.9,
        },
      ];

      return {
        recommendations: [],
        signalContributions,
        scoreContributions,
        explanations: [],
      };
    },
  };
}

export function signalKindLabel(kind: QualitySignalKind): string {
  return kind.replace(/_/g, " ");
}
