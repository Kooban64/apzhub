/**
 * Pure deterministic engineering intelligence helpers.
 * No I/O, no randomness, no ML / forecasting.
 */

import type {
  EngineeringAggregationInputs,
  EngineeringHealthStatus,
  EngineeringRiskFactor,
  EngineeringRiskSummary,
  QualityScore,
  QualityScoreComponent,
  QualityScoreInputs,
  QualityScoreWeights,
  TrendDirection,
} from "@apzhub/testing-contracts";
import { DEFAULT_QUALITY_SCORE_WEIGHTS } from "@apzhub/testing-contracts";

export function clamp01to100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Invert a 0–100 "badness" metric into a positive contribution base. */
export function invertPenalty(value: number): number {
  return clamp01to100(100 - clamp01to100(value));
}

export function normalizeWeights(
  weights: QualityScoreWeights = DEFAULT_QUALITY_SCORE_WEIGHTS,
): QualityScoreWeights {
  const sum =
    weights.coverage +
    weights.automation +
    weights.manualExecution +
    weights.failedTests +
    weights.openDefects +
    weights.certification +
    weights.approvals +
    weights.releaseReadiness;
  if (sum <= 0) {
    return { ...DEFAULT_QUALITY_SCORE_WEIGHTS };
  }
  return {
    coverage: weights.coverage / sum,
    automation: weights.automation / sum,
    manualExecution: weights.manualExecution / sum,
    failedTests: weights.failedTests / sum,
    openDefects: weights.openDefects / sum,
    certification: weights.certification / sum,
    approvals: weights.approvals / sum,
    releaseReadiness: weights.releaseReadiness / sum,
  };
}

const INVERTED_KEYS = new Set<keyof QualityScoreWeights>([
  "failedTests",
  "openDefects",
]);

export function computeQualityScore(input: {
  readonly id: string;
  readonly scope: QualityScore["scope"];
  readonly inputs: QualityScoreInputs;
  readonly weights?: QualityScoreWeights;
  readonly computedAt: string;
}): QualityScore {
  const weights = normalizeWeights(input.weights);
  const components: QualityScoreComponent[] = (
    Object.keys(weights) as (keyof QualityScoreWeights)[]
  ).map((key) => {
    const weight = weights[key];
    const raw = input.inputs[key];
    const inverted = INVERTED_KEYS.has(key);
    const base = inverted ? invertPenalty(raw) : clamp01to100(raw);
    return {
      key,
      weight: round2(weight),
      input: round2(clamp01to100(raw)),
      contribution: round2(base * weight),
      inverted,
    };
  });
  const score = round2(components.reduce((sum, c) => sum + c.contribution, 0));
  return {
    id: input.id,
    scope: input.scope,
    score,
    weights: {
      coverage: round2(weights.coverage),
      automation: round2(weights.automation),
      manualExecution: round2(weights.manualExecution),
      failedTests: round2(weights.failedTests),
      openDefects: round2(weights.openDefects),
      certification: round2(weights.certification),
      approvals: round2(weights.approvals),
      releaseReadiness: round2(weights.releaseReadiness),
    },
    inputs: {
      coverage: round2(clamp01to100(input.inputs.coverage)),
      automation: round2(clamp01to100(input.inputs.automation)),
      manualExecution: round2(clamp01to100(input.inputs.manualExecution)),
      failedTests: round2(clamp01to100(input.inputs.failedTests)),
      openDefects: round2(clamp01to100(input.inputs.openDefects)),
      certification: round2(clamp01to100(input.inputs.certification)),
      approvals: round2(clamp01to100(input.inputs.approvals)),
      releaseReadiness: round2(clamp01to100(input.inputs.releaseReadiness)),
    },
    components,
    computedAt: input.computedAt,
  };
}

/**
 * Trend direction from ordered points.
 * Absolute delta &lt; 1 → stable; positive → increase/improving; negative → decrease/declining.
 * Uses improving/declining when |delta| ≥ 5, else increase/decrease.
 */
export function computeTrendDirection(
  points: readonly { readonly value: number }[],
): TrendDirection {
  if (points.length < 2) return "unknown";
  const first = points[0]!.value;
  const last = points[points.length - 1]!.value;
  if (!Number.isFinite(first) || !Number.isFinite(last)) return "unknown";
  const delta = last - first;
  if (Math.abs(delta) < 1) return "stable";
  if (delta >= 5) return "improving";
  if (delta > 0) return "increase";
  if (delta <= -5) return "declining";
  return "decrease";
}

export function computeTrendDelta(
  points: readonly { readonly value: number }[],
): number {
  if (points.length < 2) return 0;
  return round2(points[points.length - 1]!.value - points[0]!.value);
}

export function rollingAverage(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  return round2(sum / values.length);
}

export function healthStatusFromScore(score: number): EngineeringHealthStatus {
  const s = clamp01to100(score);
  if (s >= 85) return "healthy";
  if (s >= 70) return "watch";
  if (s >= 50) return "at_risk";
  if (s > 0) return "critical";
  return "unknown";
}

export function riskLevelFromScore(score: number): EngineeringRiskFactor["level"] {
  const s = clamp01to100(score);
  if (s >= 75) return "critical";
  if (s >= 50) return "high";
  if (s >= 25) return "medium";
  return "low";
}

export function aggregateRisk(
  inputs: EngineeringAggregationInputs,
  computedAt: string,
): EngineeringRiskSummary {
  const raw: readonly Omit<EngineeringRiskFactor, "level" | "reasons">[] = [
    {
      key: "quality",
      score: round2(
        invertPenalty(inputs.coverage * 0.5 + (100 - inputs.failedTests) * 0.5),
      ),
    },
    {
      key: "release",
      score: round2(invertPenalty(inputs.releaseReadiness)),
    },
    {
      key: "coverage",
      score: round2(invertPenalty(inputs.coverage)),
    },
    {
      key: "automation",
      score: round2(invertPenalty(inputs.automation)),
    },
    {
      key: "approval",
      score: round2(invertPenalty(inputs.approvals)),
    },
    {
      key: "defect",
      score: round2(clamp01to100(inputs.openDefects)),
    },
    {
      key: "stability",
      score: round2(invertPenalty(inputs.stability)),
    },
  ];
  const factors: EngineeringRiskFactor[] = raw.map((f) => {
    const matched = inputs.reasons.filter((r) =>
      r.toLowerCase().includes(f.key === "approval" ? "approval" : f.key),
    );
    return {
      ...f,
      level: riskLevelFromScore(f.score),
      reasons:
        matched.length > 0
          ? matched
          : [`${f.key} risk derived from aggregated ${f.key} indicators`],
    };
  });

  const overallScore = round2(
    factors.reduce((s, f) => s + f.score, 0) / Math.max(factors.length, 1),
  );
  return {
    overallScore,
    overallLevel: riskLevelFromScore(overallScore),
    factors,
    computedAt,
  };
}

export function emptyAggregation(
  reasons: readonly string[] = ["no source metrics available"],
): EngineeringAggregationInputs {
  return {
    coverage: 0,
    automation: 0,
    manualExecution: 0,
    failedTests: 0,
    openDefects: 0,
    certification: 0,
    approvals: 0,
    releaseReadiness: 0,
    stability: 0,
    pipelineHealth: 0,
    risk: 0,
    velocity: 0,
    leadTime: 0,
    sourceRefs: {},
    reasons,
  };
}

/** Extract a numeric metric from a QI snapshot metrics bag without recalculating. */
export function readMetric(
  metrics: Readonly<Record<string, unknown>>,
  key: string,
): number | undefined {
  const v = metrics[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
