import type {
  IntelligenceEvaluationOutcome,
  IntelligenceProvider,
} from "../contracts/provider";
import { clampConfidenceNumeric } from "../contracts/confidence";

export function createHistoricalProvider(): IntelligenceProvider {
  return {
    descriptor: {
      providerId: "historical",
      name: "Historical Provider",
      kind: "historical",
      version: "0.1.0",
      status: "active",
      capabilities: ["trend-comparison", "signals", "offline"],
    },
    async health() {
      return { ok: true, detail: "historical provider ready" };
    },
    async evaluate(context): Promise<IntelligenceEvaluationOutcome> {
      const now = context.observations.length;
      const priorWindow = context.observations.filter((o) => {
        const ageMs = Date.now() - new Date(o.recordedAt).getTime();
        return ageMs > 60_000;
      }).length;
      const recentWindow = now - priorWindow;

      const delta = recentWindow - priorWindow;
      const trend =
        delta > 1 ? "degrading" : delta < -1 ? "improving" : ("stable" as const);

      const instabilityValue = clampConfidenceNumeric(
        Math.max(100 - Math.abs(delta) * 15, 0),
      );

      const observationIds = context.observations.map((o) => o.observationId);

      return {
        recommendations: [],
        signalContributions: [
          {
            kind: "execution_instability",
            value: instabilityValue,
            trend,
            summary: `Historical comparison: recent=${recentWindow}, prior=${priorWindow}`,
            observationIds,
          },
          {
            kind: "coverage_trend",
            value: clampConfidenceNumeric(
              priorWindow === 0 ? 50 : Math.round((recentWindow / priorWindow) * 50),
            ),
            trend,
            summary: "Coverage trend from observation volume change",
            observationIds,
          },
        ],
        scoreContributions: [
          {
            dimension: "execution",
            value: instabilityValue,
            weight: 0.7,
          },
        ],
        explanations: [],
      };
    },
  };
}
