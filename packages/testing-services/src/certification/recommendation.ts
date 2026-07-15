import {
  evaluateCertificationGate,
  mapGateOutcomesToRecommendation,
  type GateEvaluationInput,
  type GateEvaluationResult,
} from "./gate-evaluation";

export {
  evaluateCertificationGate,
  mapGateOutcomesToRecommendation,
  type GateEvaluationInput,
  type GateEvaluationResult,
};

/** Thin alias used by CertificationRecommendationService. */
export function recommendFromGateOutcomes(
  outcomes: Parameters<typeof mapGateOutcomesToRecommendation>[0],
) {
  return mapGateOutcomesToRecommendation(outcomes);
}
