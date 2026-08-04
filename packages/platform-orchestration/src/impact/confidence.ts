/**
 * Explainable confidence model (QO-005).
 * Deterministic, rule-based — no AI providers.
 */

import type {
  ChangeMagnitude,
  ConfidenceAssessment,
  ConfidenceFactor,
  QualityAsset,
} from "../contracts/impact-correlation";

export interface ConfidenceInput {
  readonly depth: number;
  readonly relationshipStrength: number;
  readonly isDirect: boolean;
  readonly asset: QualityAsset;
  readonly changeMagnitude: ChangeMagnitude;
  /** 0–1 historical co-occurrence from prior correlations. */
  readonly historicalCorrelation: number;
}

const MAGNITUDE_SCORE: Record<ChangeMagnitude, number> = {
  trivial: 0.3,
  small: 0.45,
  medium: 0.6,
  large: 0.8,
  massive: 0.95,
};

/**
 * Distance decay: depth 0 = 1.0, each hop reduces by 0.18 (floor 0.15).
 */
export function distanceScore(depth: number): number {
  return Math.max(0.15, 1 - depth * 0.18);
}

export function assessNodeConfidence(input: ConfidenceInput): ConfidenceAssessment {
  const factors: ConfidenceFactor[] = [];

  const directScore = input.isDirect ? 1 : 0.55;
  factors.push(
    factor(
      "direct_relationship",
      "Direct relationship",
      0.25,
      directScore,
      input.isDirect
        ? "Asset is a direct seed or one-hop neighbour of the change"
        : "Asset reached via multi-hop dependency traversal",
    ),
  );

  const hist = clamp01(input.historicalCorrelation);
  factors.push(
    factor(
      "historical_correlation",
      "Historical correlation",
      0.15,
      hist,
      `Prior correlations co-occurred at ${pct(hist)}`,
    ),
  );

  const dist = distanceScore(input.depth);
  factors.push(
    factor(
      "dependency_distance",
      "Dependency distance",
      0.2,
      dist,
      `Traversal depth ${input.depth} yields distance score ${pct(dist)}`,
    ),
  );

  const evidence = clamp01(input.asset.evidenceQuality ?? 0.5);
  factors.push(
    factor(
      "evidence_quality",
      "Evidence quality",
      0.15,
      evidence,
      `Asset evidence quality hint ${pct(evidence)}`,
    ),
  );

  const mag = MAGNITUDE_SCORE[input.changeMagnitude];
  factors.push(
    factor(
      "change_magnitude",
      "Change magnitude",
      0.15,
      mag,
      `Change magnitude '${input.changeMagnitude}' maps to ${pct(mag)}`,
    ),
  );

  const regressionScore = input.asset.knownRegression ? 0.9 : 0.4;
  factors.push(
    factor(
      "known_regressions",
      "Known regressions",
      0.1,
      regressionScore,
      input.asset.knownRegression
        ? "Asset marked with known regression history"
        : "No known regression marker on asset",
    ),
  );

  // Blend relationship strength into overall (weighted average of factors * strength bias)
  const base =
    factors.reduce((sum, f) => sum + f.contribution, 0) /
    factors.reduce((sum, f) => sum + f.weight, 0);
  const score = clamp01(base * (0.7 + 0.3 * clamp01(input.relationshipStrength)));

  return {
    score: round3(score),
    factors,
    summary: `Confidence ${pct(score)} from ${factors.length} explainable factors`,
  };
}

export function aggregateGraphConfidence(
  nodeScores: readonly number[],
): ConfidenceAssessment {
  if (nodeScores.length === 0) {
    return {
      score: 0,
      factors: [
        factor(
          "empty_graph",
          "Empty impact graph",
          1,
          0,
          "No correlated assets — confidence is zero",
        ),
      ],
      summary: "No correlated assets",
    };
  }
  const avg = nodeScores.reduce((a, b) => a + b, 0) / nodeScores.length;
  const min = Math.min(...nodeScores);
  const factors: ConfidenceFactor[] = [
    factor(
      "mean_node_confidence",
      "Mean node confidence",
      0.7,
      avg,
      `Average confidence across ${nodeScores.length} nodes is ${pct(avg)}`,
    ),
    factor(
      "min_node_confidence",
      "Minimum node confidence",
      0.3,
      min,
      `Weakest correlated node confidence is ${pct(min)}`,
    ),
  ];
  const score = round3(avg * 0.7 + min * 0.3);
  return {
    score,
    factors,
    summary: `Graph confidence ${pct(score)} over ${nodeScores.length} nodes`,
  };
}

function factor(
  factorId: string,
  label: string,
  weight: number,
  score: number,
  explanation: string,
): ConfidenceFactor {
  const s = clamp01(score);
  return {
    factorId,
    label,
    weight,
    score: round3(s),
    contribution: round3(weight * s),
    explanation,
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function pct(value: number): string {
  return `${Math.round(clamp01(value) * 100)}%`;
}
