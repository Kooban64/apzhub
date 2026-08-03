import type { ConfidenceAssessment } from "../contracts/confidence";
import type { IntelligenceProviderId } from "../contracts/provider";
import {
  clampConfidenceNumeric,
  confidenceLevelFromNumeric,
} from "../contracts/confidence";

export interface ConfidenceInput {
  readonly baseNumeric: number;
  readonly evidenceRefCount: number;
  readonly observationCount: number;
  readonly providerId: IntelligenceProviderId;
  readonly historicalAcceptanceRate?: number;
}

const PROVIDER_WEIGHTS: Readonly<Record<IntelligenceProviderId, number>> = {
  rules: 0.85,
  statistical: 0.75,
  historical: 0.7,
  dummy_ai: 0.45,
  openai: 0,
  claude: 0,
  gemini: 0,
  azure_openai: 0,
  local_llm: 0,
  risk_engine: 0,
};

/**
 * Combines evidence, provider trust, and historical weighting into a confidence assessment.
 */
export function assessConfidence(input: ConfidenceInput): ConfidenceAssessment {
  const providerWeight = PROVIDER_WEIGHTS[input.providerId] ?? 0.5;
  const evidenceBoost = Math.min(input.evidenceRefCount * 5, 20);
  const observationBoost = Math.min(input.observationCount * 3, 15);
  const historicalBoost = input.historicalAcceptanceRate
    ? Math.round(input.historicalAcceptanceRate * 10)
    : 0;

  const numeric = clampConfidenceNumeric(
    Math.round(
      input.baseNumeric * providerWeight +
        evidenceBoost +
        observationBoost +
        historicalBoost,
    ),
  );

  return {
    level: confidenceLevelFromNumeric(numeric),
    numeric,
    factors: {
      baseNumeric: input.baseNumeric,
      providerWeight,
      evidenceBoost,
      observationBoost,
      historicalBoost,
      providerId: input.providerId,
    },
  };
}
