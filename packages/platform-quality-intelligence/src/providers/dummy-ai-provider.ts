import type {
  IntelligenceEvaluationOutcome,
  IntelligenceProvider,
} from "../contracts/provider";
import {
  clampConfidenceNumeric,
  confidenceLevelFromNumeric,
} from "../contracts/confidence";

/**
 * Offline AI provider slot — validates the AI provider contract without network calls.
 * NEVER imports or references OpenAI, Anthropic, Google, or Azure SDKs.
 */
export function createDummyAiProvider(): IntelligenceProvider {
  return {
    descriptor: {
      providerId: "dummy_ai",
      name: "Dummy AI Provider",
      kind: "ai",
      version: "0.1.0",
      status: "active",
      capabilities: ["offline-demo-only", "recommendations", "explanations"],
    },
    async health() {
      return { ok: true, detail: "dummy AI provider ready (offline, no network)" };
    },
    async evaluate(context): Promise<IntelligenceEvaluationOutcome> {
      if (context.observations.length === 0) {
        return {
          recommendations: [],
          signalContributions: [],
          scoreContributions: [],
          explanations: [],
        };
      }

      const observationIds = context.observations
        .slice(0, 3)
        .map((o) => o.observationId);
      const numeric = clampConfidenceNumeric(45);
      const confidence = {
        level: confidenceLevelFromNumeric(numeric),
        numeric,
        factors: { mode: "offline-demo-only" },
      };

      const explanation = {
        reason: "Canned offline AI analysis — no external API invoked",
        evidenceRefs: context.observations
          .flatMap((o) => o.evidenceRefs ?? [])
          .slice(0, 2),
        contributingObservationIds: observationIds,
        confidence,
        providerId: "dummy_ai" as const,
        inputs: {
          observationCount: context.observations.length,
          signalCount: context.signals.length,
        },
        decisionPath: [
          "offline demo slot activated",
          "inspect observation sample",
          "emit general_quality recommendation",
        ],
      };

      return {
        recommendations: [
          {
            type: "general_quality",
            priority: "low",
            reason: "Offline AI demo suggests reviewing overall quality posture",
            evidenceRefs: explanation.evidenceRefs,
            observationIds,
            confidence,
            explanation,
          },
        ],
        signalContributions: [],
        scoreContributions: [
          {
            dimension: "overall",
            value: numeric,
            weight: 0.5,
          },
        ],
        explanations: [explanation],
      };
    },
  };
}
