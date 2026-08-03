/** Discrete confidence tier for recommendations and explanations. */
export type ConfidenceLevel = "low" | "medium" | "high";

/**
 * Confidence assessment combining discrete level and numeric score (0–100).
 */
export interface ConfidenceAssessment {
  readonly level: ConfidenceLevel;
  readonly numeric: number;
  readonly factors?: Readonly<Record<string, string | number | boolean>>;
}

export function clampConfidenceNumeric(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function confidenceLevelFromNumeric(numeric: number): ConfidenceLevel {
  const clamped = clampConfidenceNumeric(numeric);
  if (clamped >= 70) {
    return "high";
  }
  if (clamped >= 40) {
    return "medium";
  }
  return "low";
}
