/**
 * W005 PF-D9 — Portfolio Confidence is weighted, not a mean.
 */

import type {
  PortfolioConfidenceContributor,
  PortfolioWeightedConfidence,
  StrategicImportance,
} from "@apzhub/platform-service-contracts";

export const IMPORTANCE_WEIGHT: Record<StrategicImportance, number> = {
  low: 0.6,
  normal: 1,
  high: 1.4,
  critical: 1.8,
};

export type PortfolioConfidenceMember = {
  readonly id: string;
  readonly name: string;
  readonly confidenceScore: number;
  readonly importance: StrategicImportance;
  readonly dependenciesBroken: number;
  readonly exceptionsCritical: number;
  readonly exceptionsMajor: number;
  readonly programmeCritical?: boolean;
};

/**
 * weightedCombine(importance_i × confidence_i, dependencyPenalty, exceptionPenalty, programmeCriticality)
 */
export function computePortfolioWeightedConfidence(
  members: readonly PortfolioConfidenceMember[],
): PortfolioWeightedConfidence {
  if (members.length === 0) {
    return Object.freeze({
      score: 0,
      band: "Low",
      contributors: Object.freeze([]),
    });
  }

  let weightSum = 0;
  let weightedScore = 0;
  const contributors: PortfolioConfidenceContributor[] = [];

  for (const m of members) {
    const w = IMPORTANCE_WEIGHT[m.importance] ?? 1;
    weightSum += w;
    weightedScore += w * m.confidenceScore;
    if (m.confidenceScore < 55) {
      contributors.push({
        code: `low_confidence:${m.id}`,
        label: `Low confidence: ${m.name}`,
        impact: Math.round((55 - m.confidenceScore) * w),
      });
    }
  }

  let score = weightSum > 0 ? weightedScore / weightSum : 0;

  const depBroken = members.reduce((s, m) => s + m.dependenciesBroken, 0);
  const depPenalty = Math.min(25, depBroken * 4);
  if (depPenalty > 0) {
    score -= depPenalty;
    contributors.push({
      code: "dependency_exposure",
      label: `Cross-project dependency exposure (${depBroken})`,
      impact: depPenalty,
    });
  }

  const exCrit = members.reduce((s, m) => s + m.exceptionsCritical, 0);
  const exMaj = members.reduce((s, m) => s + m.exceptionsMajor, 0);
  const exPenalty = Math.min(30, exCrit * 8 + exMaj * 3);
  if (exPenalty > 0) {
    score -= exPenalty;
    contributors.push({
      code: "unresolved_exceptions",
      label: `Unresolved Major/Critical exceptions (${exCrit + exMaj})`,
      impact: exPenalty,
    });
  }

  const programmeCritical = members.some((m) => m.programmeCritical);
  if (programmeCritical) {
    score -= 5;
    contributors.push({
      code: "programme_criticality",
      label: "Programme criticality pressure",
      impact: 5,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band = score >= 75 ? "High" : score >= 45 ? "Medium" : "Low";

  const top = [...contributors]
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)
    .map((c) => Object.freeze({ ...c }));

  return Object.freeze({
    score,
    band,
    contributors: Object.freeze(top),
  });
}
