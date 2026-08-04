/**
 * Provider-neutral advisory risk model (QO-005).
 * Risk never triggers execution.
 */

import type {
  ChangeMagnitude,
  RiskAssessment,
  RiskFactor,
  RiskLevel,
} from "../contracts/impact-correlation";

const LEVEL_SCORE: Record<RiskLevel, number> = {
  low: 0.2,
  medium: 0.45,
  high: 0.7,
  critical: 0.9,
};

const MAGNITUDE_RISK: Record<ChangeMagnitude, RiskLevel> = {
  trivial: "low",
  small: "low",
  medium: "medium",
  large: "high",
  massive: "critical",
};

export function levelFromScore(score: number): RiskLevel {
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return LEVEL_SCORE[a] >= LEVEL_SCORE[b] ? a : b;
}

export interface NodeRiskInput {
  readonly confidence: number;
  readonly depth: number;
  readonly knownRegression: boolean;
  readonly changeMagnitude: ChangeMagnitude;
  readonly assetType: string;
}

export function assessNodeRisk(input: NodeRiskInput): {
  readonly level: RiskLevel;
  readonly factors: readonly RiskFactor[];
} {
  const factors: RiskFactor[] = [];
  let score = 0.25;

  const magLevel = MAGNITUDE_RISK[input.changeMagnitude];
  score += LEVEL_SCORE[magLevel] * 0.35;
  factors.push({
    factorId: "change_magnitude",
    label: "Change magnitude",
    level: magLevel,
    explanation: `Change magnitude '${input.changeMagnitude}' contributes ${magLevel} risk`,
  });

  // Lower confidence at shallow depth = higher uncertainty risk
  if (input.depth <= 1 && input.confidence < 0.5) {
    score += 0.2;
    factors.push({
      factorId: "low_confidence_near_change",
      label: "Low confidence near change",
      level: "high",
      explanation: "Direct/near assets with low confidence elevate risk",
    });
  }

  if (input.knownRegression) {
    score += 0.25;
    factors.push({
      factorId: "known_regression",
      label: "Known regression",
      level: "critical",
      explanation: "Asset carries a known regression marker",
    });
  }

  if (
    input.assetType === "requirement" ||
    input.assetType === "release" ||
    input.assetType === "service"
  ) {
    score += 0.1;
    factors.push({
      factorId: "critical_asset_type",
      label: "Critical asset type",
      level: "high",
      explanation: `Asset type '${input.assetType}' elevates advisory risk`,
    });
  }

  // Deeper nodes contribute less absolute risk
  score *= Math.max(0.35, 1 - input.depth * 0.12);

  const level = levelFromScore(Math.min(1, score));
  if (factors.length === 0) {
    factors.push({
      factorId: "baseline",
      label: "Baseline",
      level: "low",
      explanation: "No elevated risk factors identified",
    });
  }
  return { level, factors };
}

export function assessGraphRisk(
  nodeLevels: readonly RiskLevel[],
  nodeFactors: readonly RiskFactor[],
  changeMagnitude: ChangeMagnitude,
): RiskAssessment {
  if (nodeLevels.length === 0) {
    return {
      level: "low",
      score: 0.1,
      factors: [
        {
          factorId: "empty_graph",
          label: "Empty impact graph",
          level: "low",
          explanation: "No affected assets — advisory risk is low",
        },
      ],
      summary: "Advisory risk low — no correlated assets",
      advisory: true,
    };
  }

  let peak: RiskLevel = "low";
  for (const level of nodeLevels) {
    peak = maxRisk(peak, level);
  }
  peak = maxRisk(peak, MAGNITUDE_RISK[changeMagnitude]);

  const score = LEVEL_SCORE[peak];
  const factors = dedupeFactors([
    ...nodeFactors.slice(0, 12),
    {
      factorId: "peak_node_risk",
      label: "Peak node risk",
      level: peak,
      explanation: `Highest advisory risk among correlated assets is ${peak}`,
    },
  ]);

  return {
    level: peak,
    score,
    factors,
    summary: `Advisory risk ${peak} (score ${score}) — does not select execution`,
    advisory: true,
  };
}

function dedupeFactors(factors: readonly RiskFactor[]): readonly RiskFactor[] {
  const seen = new Set<string>();
  const out: RiskFactor[] = [];
  for (const f of factors) {
    if (seen.has(f.factorId)) continue;
    seen.add(f.factorId);
    out.push(f);
  }
  return out;
}
